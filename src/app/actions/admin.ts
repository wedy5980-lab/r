"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { propertySchemaStrict, settingsSchema, loginSchema } from "@/lib/config";
import {
  verifyCredentials,
  createSession,
  destroySession,
  getSession,
  requireRole,
  audit,
  sha256,
  hashClientHint,
  recentFailureCount,
  recordAttempt,
} from "@/lib/auth";

export type ActionState = { ok: boolean; message: string; errors?: Record<string, string> };

const MAX_FAILURES = 6;

/* ── Auth ───────────────────────────────────────────────────────── */

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { ok: false, message: "بيانات الدخول غير مكتملة أو غير صحيحة." };
  }

  const { email, password } = parsed.data;
  const emailHash = sha256((process.env.SESSION_SECRET ?? "") + email.toLowerCase());
  const { ipHash } = await hashClientHint();

  if ((await recentFailureCount(emailHash)) >= MAX_FAILURES) {
    return {
      ok: false,
      message: "تم إيقاف المحاولات مؤقتًا بعد عدة محاولات فاشلة. حاول بعد ١٥ دقيقة.",
    };
  }

  const admin = await verifyCredentials(email, password);
  await recordAttempt(emailHash, ipHash, !!admin);

  if (!admin) {
    // Deliberately generic: does not reveal whether the account exists.
    return { ok: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  }

  await createSession(admin);
  await audit("login", "admin", admin.id, { email: admin.email }, admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  const s = await getSession();
  if (s) await audit("logout", "admin", s.id, {}, s.id);
  await destroySession();
  redirect("/admin/login");
}

/* ── Properties ─────────────────────────────────────────────────── */

function parsePropertyForm(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? null : String(v);
  };
  const raw = {
    title: String(formData.get("title") ?? ""),
    main_category: String(formData.get("main_category") ?? ""),
    subcategory: get("subcategory"),
    description: get("description"),
    city: get("city"),
    neighborhood: get("neighborhood"),
    address: get("address"),
    area: get("area"),
    street_width: get("street_width"),
    price: get("price"),
    price_type: get("price_type") ?? "total",
    rental_period: get("rental_period"),
    bedrooms: get("bedrooms"),
    bathrooms: get("bathrooms"),
    floors: get("floors"),
    status: get("status") ?? "available",
    owner_name: get("owner_name"),
    owner_phone: get("owner_phone"),
    internal_notes: get("internal_notes"),
    is_featured: formData.get("is_featured") === "on",
    reference_number: get("reference_number"),
  };
  return propertySchemaStrict.safeParse(raw);
}

function zodErrors(issues: { path: (string | number | symbol)[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? "form");
    if (!errors[k]) errors[k] = i.message;
  }
  return errors;
}

/** Transaction-ish create: insert property, then its media rows. */
export async function createPropertyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let admin;
  try {
    admin = await requireRole("editor");
  } catch {
    return { ok: false, message: "غير مصرّح." };
  }

  const parsed = parsePropertyForm(formData);
  if (!parsed.success) {
    return { ok: false, message: "يرجى تصحيح الحقول المظللة.", errors: zodErrors(parsed.error.issues) };
  }

  const d = parsed.data;
  const ref = d.reference_number?.trim() || (await nextReference());

  const { data: created, error } = await db()
    .from("mp_properties")
    .insert({
      reference_number: ref,
      title: d.title,
      main_category: d.main_category,
      subcategory: d.subcategory || null,
      description: d.description || null,
      city: d.city || null,
      neighborhood: d.neighborhood || null,
      address: d.address || null,
      area: d.area ?? null,
      street_width: d.street_width ?? null,
      price: d.price ?? null,
      price_type: d.price_type,
      rental_period: d.rental_period || null,
      bedrooms: d.bedrooms ?? null,
      bathrooms: d.bathrooms ?? null,
      floors: d.floors ?? null,
      status: d.status,
      owner_name: d.owner_name || null,
      owner_phone: d.owner_phone || null,
      internal_notes: d.internal_notes || null,
      is_featured: d.is_featured,
      created_by: admin.id,
      updated_by: admin.id,
    })
    .select("id,reference_number")
    .single();

  if (error) {
    const msg = error.code === "23505" ? "رقم المرجع مستخدم مسبقًا." : "تعذّر حفظ العقار.";
    return { ok: false, message: msg, errors: error.code === "23505" ? { reference_number: "مستخدم مسبقًا" } : undefined };
  }

  const mediaUrls = formData.getAll("media_urls").map(String).filter(Boolean);
  if (mediaUrls.length) {
    await db().from("mp_property_media").insert(
      mediaUrls.map((url, i) => ({
        property_id: created.id,
        media_type: /\.(mp4|webm)$/i.test(url) ? "video" : "image",
        media_url: url,
        alt_ar: d.title,
        display_order: i,
      }))
    );
  }

  await audit("create", "property", created.id, { reference: created.reference_number }, admin.id);
  revalidatePath("/admin/properties");
  revalidatePath("/");
  redirect(`/admin/properties/${created.id}?created=1`);
}

export async function updatePropertyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let admin;
  try {
    admin = await requireRole("editor");
  } catch {
    return { ok: false, message: "غير مصرّح." };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "معرّف العقار مفقود." };

  const parsed = parsePropertyForm(formData);
  if (!parsed.success) {
    return { ok: false, message: "يرجى تصحيح الحقول المظللة.", errors: zodErrors(parsed.error.issues) };
  }
  const d = parsed.data;

  const { error } = await db()
    .from("mp_properties")
    .update({
      title: d.title,
      main_category: d.main_category,
      subcategory: d.subcategory || null,
      description: d.description || null,
      city: d.city || null,
      neighborhood: d.neighborhood || null,
      address: d.address || null,
      area: d.area ?? null,
      street_width: d.street_width ?? null,
      price: d.price ?? null,
      price_type: d.price_type,
      rental_period: d.rental_period || null,
      bedrooms: d.bedrooms ?? null,
      bathrooms: d.bathrooms ?? null,
      floors: d.floors ?? null,
      status: d.status,
      owner_name: d.owner_name || null,
      owner_phone: d.owner_phone || null,
      internal_notes: d.internal_notes || null,
      is_featured: d.is_featured,
      updated_by: admin.id,
    })
    .eq("id", id);

  if (error) return { ok: false, message: "تعذّر تحديث العقار." };

  await audit("update", "property", id, { title: d.title, status: d.status }, admin.id);
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${id}`);
  revalidatePath("/");
  return { ok: true, message: "تم حفظ التغييرات بنجاح." };
}

export async function setStatusAction(formData: FormData) {
  const admin = await requireRole("editor").catch(() => null);
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = ["available", "sold", "rented", "unavailable", "archived"];
  if (!id || !allowed.includes(status)) return;

  await db().from("mp_properties").update({ status, updated_by: admin.id }).eq("id", id);
  await audit("status_change", "property", id, { status }, admin.id);
  revalidatePath("/admin/properties");
  revalidatePath("/");
}

/** Soft archive — the safe default. Permanent delete requires manager role. */
export async function archivePropertyAction(formData: FormData) {
  const admin = await requireRole("editor").catch(() => null);
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db().from("mp_properties").update({ status: "archived", updated_by: admin.id }).eq("id", id);
  await audit("archive", "property", id, {}, admin.id);
  revalidatePath("/admin/properties");
  revalidatePath("/");
}

export async function deletePropertyAction(formData: FormData) {
  const admin = await requireRole("manager").catch(() => null);
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!id || confirm !== "DELETE") return;

  // media rows cascade via FK; capture the reference for the audit trail first
  const { data } = await db().from("mp_properties").select("reference_number").eq("id", id).maybeSingle();
  await db().from("mp_properties").delete().eq("id", id);
  await audit("delete", "property", id, { reference: data?.reference_number ?? null }, admin.id);
  revalidatePath("/admin/properties");
  revalidatePath("/");
  redirect("/admin/properties?deleted=1");
}

/* ── Media ──────────────────────────────────────────────────────── */

export async function addMediaAction(formData: FormData) {
  const admin = await requireRole("editor").catch(() => null);
  if (!admin) return;
  const propertyId = String(formData.get("property_id") ?? "");
  const url = String(formData.get("media_url") ?? "").trim();
  if (!propertyId || !url) return;
  if (!/^https:\/\/|^\//.test(url)) return; // only absolute https or site-relative

  const { data: max } = await db()
    .from("mp_property_media")
    .select("display_order")
    .eq("property_id", propertyId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await db().from("mp_property_media").insert({
    property_id: propertyId,
    media_type: /\.(mp4|webm)(\?|$)/i.test(url) ? "video" : "image",
    media_url: url,
    display_order: (max?.display_order ?? -1) + 1,
  });
  await audit("media_add", "property", propertyId, { url }, admin.id);
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/");
}

export async function updateMediaAction(formData: FormData) {
  const admin = await requireRole("editor").catch(() => null);
  if (!admin) return;
  const id = String(formData.get("media_id") ?? "");
  const propertyId = String(formData.get("property_id") ?? "");
  const action = String(formData.get("op") ?? "");
  if (!id || !propertyId) return;

  if (action === "delete") {
    await db().from("mp_property_media").delete().eq("id", id);
    await audit("media_delete", "property", propertyId, { media_id: id }, admin.id);
  } else if (action === "up" || action === "down") {
    const { data: rows } = await db()
      .from("mp_property_media")
      .select("id,display_order")
      .eq("property_id", propertyId)
      .order("display_order", { ascending: true });
    const list = rows ?? [];
    const idx = list.findIndex((r) => r.id === id);
    const swap = action === "up" ? idx - 1 : idx + 1;
    if (idx >= 0 && swap >= 0 && swap < list.length) {
      await db().from("mp_property_media").update({ display_order: list[swap].display_order }).eq("id", list[idx].id);
      await db().from("mp_property_media").update({ display_order: list[idx].display_order }).eq("id", list[swap].id);
      await audit("media_reorder", "property", propertyId, { id, dir: action }, admin.id);
    }
  }
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/");
}

/* ── Inquiries ──────────────────────────────────────────────────── */

export async function updateInquiryAction(formData: FormData) {
  const admin = await requireRole("editor").catch(() => null);
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["new", "contacted", "closed", "spam"].includes(status)) return;
  await db()
    .from("mp_inquiries")
    .update({ status, handled_by: admin.id, handled_at: new Date().toISOString() })
    .eq("id", id);
  await audit("inquiry_status", "inquiry", id, { status }, admin.id);
  revalidatePath("/admin/inquiries");
}

/* ── Settings ───────────────────────────────────────────────────── */

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let admin;
  try {
    admin = await requireRole("manager");
  } catch {
    return { ok: false, message: "غير مصرّح لتعديل بيانات المكتب." };
  }

  const parsed = settingsSchema.safeParse({
    office_name: String(formData.get("office_name") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    about_text: String(formData.get("about_text") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    working_hours: String(formData.get("working_hours") ?? ""),
    brand_color: String(formData.get("brand_color") ?? "#0f6b52"),
    accent_color: String(formData.get("accent_color") ?? "#c9a227"),
    show_owner_phone: formData.get("show_owner_phone") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: "يرجى تصحيح الحقول.", errors: zodErrors(parsed.error.issues) };
  }

  const { error } = await db().from("mp_office_settings").update(parsed.data).eq("id", 1);
  if (error) return { ok: false, message: "تعذّر حفظ الإعدادات." };

  await audit("update", "settings", "1", { office_name: parsed.data.office_name }, admin.id);
  revalidatePath("/", "layout");
  return { ok: true, message: "تم حفظ إعدادات المكتب." };
}

/* ── Helpers ────────────────────────────────────────────────────── */

async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await db()
    .from("mp_properties")
    .select("reference_number")
    .like("reference_number", `MP-${year}-%`)
    .order("reference_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const last = data?.reference_number?.split("-").pop();
  const n = last ? Number(last) : 0;
  return `MP-${year}-${String((Number.isFinite(n) ? n : 0) + 1).padStart(4, "0")}`;
}
