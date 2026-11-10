"use server";

import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { inquirySchema } from "@/lib/config";

export type InquiryState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

/**
 * Public inquiry submission.
 * Defences: schema validation, honeypot, per-IP rate limit (5 / 10 min),
 * length caps and a hard server-side status. Nothing is emailed here —
 * delivery requires office configuration (see INTEGRATIONS.md).
 */
export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    property_id: String(formData.get("property_id") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!errors[k]) errors[k] = issue.message;
    }
    return { ok: false, message: "يرجى تصحيح الحقول المظللة.", errors };
  }

  const data = parsed.data;

  // Honeypot: silently accept so bots do not learn the trap.
  if (data.website) return { ok: true, message: "تم استلام طلبك." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const salt = process.env.SESSION_SECRET ?? "";
  const ipHash = createHash("sha256").update(salt + ip).digest("hex");

  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await db()
    .from("mp_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("source", `website:${ipHash.slice(0, 12)}`)
    .gte("created_at", since);

  if ((count ?? 0) >= 5) {
    return { ok: false, message: "تم استلام عدة طلبات من نفس الجهاز. يرجى المحاولة لاحقًا أو الاتصال بالمكتب." };
  }

  const { error } = await db().from("mp_inquiries").insert({
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    message: data.message || null,
    property_id: data.property_id || null,
    source: `website:${ipHash.slice(0, 12)}`,
    status: "new",
  });

  if (error) {
    console.error("[inquiry] insert failed", error.message);
    return { ok: false, message: "تعذّر إرسال الطلب حاليًا. يرجى المحاولة بعد قليل أو الاتصال بالمكتب." };
  }

  return { ok: true, message: "تم استلام استفسارك بنجاح. سيتواصل معك فريق المكتب في أقرب وقت." };
}
