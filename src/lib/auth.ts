import "server-only";
import { cookies, headers } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { env } from "./config";

export const SESSION_COOKIE = "mp_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

export type Role = "super_admin" | "manager" | "editor" | "viewer";
export type AdminSession = { id: string; name: string; email: string; role: Role };

function secretKey(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(s);
}

export function sha256(v: string) {
  return createHash("sha256").update(v).digest("hex");
}

export async function hashClientHint() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const ua = h.get("user-agent") || "unknown";
  // salted so the log table cannot be used to test candidate IPs offline
  const salt = process.env.SESSION_SECRET ?? "";
  return { ipHash: sha256(salt + ip), userAgent: ua.slice(0, 300) };
}

/* ── Login throttling ───────────────────────────────────────────── */

export async function recentFailureCount(emailHash: string, windowMinutes = 15) {
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { count } = await db()
    .from("mp_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email_hash", emailHash)
    .eq("success", false)
    .gte("created_at", since);
  return count ?? 0;
}

export async function recordAttempt(emailHash: string, ipHash: string, success: boolean) {
  await db().from("mp_login_attempts").insert({ email_hash: emailHash, ip_hash: ipHash, success });
}

/* ── Verify + issue session ─────────────────────────────────────── */

export async function verifyCredentials(email: string, password: string) {
  const { data: admin } = await db()
    .from("mp_admins")
    .select("id,name,email,role,is_active,password_hash")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  // Always run a bcrypt comparison so response time does not reveal
  // whether the email exists (user enumeration defence).
  const hash = admin?.password_hash ?? "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const ok = await bcrypt.compare(password, hash).catch(() => false);

  if (!admin || !ok || !admin.is_active) return null;
  return { id: admin.id as string, name: admin.name as string, email: admin.email as string, role: admin.role as Role };
}

export async function createSession(admin: AdminSession) {
  const raw = randomBytes(32).toString("base64url");
  const tokenHash = sha256(raw);
  const { ipHash, userAgent } = await hashClientHint();
  const expires = new Date(Date.now() + MAX_AGE_SECONDS * 1000);

  const { error } = await db().from("mp_admin_sessions").insert({
    admin_id: admin.id,
    token_hash: tokenHash,
    user_agent: userAgent,
    ip_hash: ipHash,
    expires_at: expires.toISOString(),
  });
  if (error) throw new Error(`Session creation failed: ${error.message}`);

  const jwt = await new SignJWT({ sid: tokenHash, role: admin.role, name: admin.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  await db().from("mp_admins").update({ last_login_at: new Date().toISOString() }).eq("id", admin.id);
}

/** Reads and validates the session. Returns null on any failure — never throws. */
export async function getSession(): Promise<AdminSession | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const sid = payload.sid as string;
    if (!sid) return null;

    const { data } = await db()
      .from("mp_admin_sessions")
      .select("admin_id,expires_at,revoked_at,mp_admins!inner(id,name,email,role,is_active)")
      .eq("token_hash", sid)
      .maybeSingle();

    if (!data) return null;
    if (data.revoked_at) return null;
    if (new Date(data.expires_at).getTime() < Date.now()) return null;

    const admin = (data as unknown as { mp_admins: { id: string; name: string; email: string; role: Role; is_active: boolean } }).mp_admins;
    if (!admin?.is_active) return null;
    if (admin.id !== payload.sub) return null;

    return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
  } catch {
    return null;
  }
}

export async function destroySession() {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (token) {
      const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] }).catch(() => ({ payload: null as never }));
      const sid = (payload as { sid?: string } | null)?.sid;
      if (sid) {
        await db().from("mp_admin_sessions").update({ revoked_at: new Date().toISOString() }).eq("token_hash", sid);
      }
    }
    jar.delete(SESSION_COOKIE);
  } catch {
    /* clearing the cookie is best-effort; the row is revoked above when possible */
  }
}

/* ── Authorisation ──────────────────────────────────────────────── */

const RANK: Record<Role, number> = { viewer: 1, editor: 2, manager: 3, super_admin: 4 };

export function atLeast(role: Role, min: Role) {
  return RANK[role] >= RANK[min];
}

/** Throws unless the current session has at least `min` role. */
export async function requireRole(min: Role): Promise<AdminSession> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHENTICATED");
  if (!atLeast(s.role, min)) throw new Error("FORBIDDEN");
  return s;
}

export async function audit(action: string, entity: string, entityId: string | null, details: Record<string, unknown>, adminId: string | null) {
  const { ipHash } = await hashClientHint().catch(() => ({ ipHash: "unknown" }));
  await db().from("mp_audit_logs").insert({
    admin_id: adminId,
    action,
    entity,
    entity_id: entityId,
    details,
    ip_hash: ipHash,
  });
}

/** Constant-time string compare helper (used where plaintext comparison is unavoidable). */
export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
