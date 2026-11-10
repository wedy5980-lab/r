import { z } from "zod";

/* ── Environment ─────────────────────────────────────────────────── */
export function env() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local or the host's environment."
    );
  }
  return { url, key, host: new URL(url).host };
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const OFFICE_NAME = "مكتب معاذ الضحيان للعقارات";
export const WELCOME = "حياكم الله في مكتب معاذ الضحيان للعقارات";

/* ── Validation schemas ──────────────────────────────────────────── */
export const propertySchema = z.object({
  title: z.string().trim().min(3, "العنوان قصير جدًا").max(200, "العنوان طويل جدًا"),
  main_category: z.enum(["sale", "rent", "management", "auction"]),
  subcategory: z.string().trim().max(60).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  neighborhood: z.string().trim().max(120).optional().nullable(),
  address: z.string().trim().max(250).optional().nullable(),
  area: z.coerce.number().positive("المساحة يجب أن تكون أكبر من صفر").max(1_000_000).optional().nullable(),
  street_width: z.coerce.number().positive("عرض الشارع غير صحيح").max(500).optional().nullable(),
  price: z.coerce.number().min(0, "السعر غير صحيح").max(1_000_000_000).optional().nullable(),
  price_type: z.enum(["total", "per_year", "per_month", "per_day", "negotiable"]).default("total"),
  rental_period: z.string().trim().max(60).optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).max(100).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).max(100).optional().nullable(),
  floors: z.coerce.number().int().min(0).max(200).optional().nullable(),
  status: z.enum(["available", "sold", "rented", "unavailable", "archived"]).default("available"),
  owner_name: z.string().trim().max(120).optional().nullable(),
  owner_phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "رقم جوال المالك غير صحيح")
    .optional()
    .nullable()
    .or(z.literal("")),
  internal_notes: z.string().trim().max(2000).optional().nullable(),
  is_featured: z.coerce.boolean().default(false),
  reference_number: z.string().trim().max(40).optional().nullable(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

/**
 * Cross-field rules: a subcategory must belong to its main category, and
 * land/hall units cannot carry bedroom or bathroom counts.
 */
export const propertySchemaStrict = propertySchema.superRefine((v, ctx) => {
  const subs: Record<string, string[]> = {
    sale: ["residential_land","commercial_land","villa","ground_floor","upper_floor","apartment","chalet","rest_house","hall","shop","building"],
    rent: ["commercial_land","residential_land","villa","ground_floor","upper_floor","apartment","chalet","rest_house","shop","hall","building"],
    management: ["building","villa","apartments","shops","chalets"],
    auction: [],
  };
  if (v.subcategory && !subs[v.main_category]?.includes(v.subcategory)) {
    ctx.addIssue({ code: "custom", path: ["subcategory"], message: "النوع الفرعي لا يطابق التصنيف الرئيسي" });
  }
  if (["commercial_land","residential_land","hall"].includes(v.subcategory ?? "")) {
    if (v.bedrooms != null) ctx.addIssue({ code: "custom", path: ["bedrooms"], message: "غير منطقي لهذا النوع" });
    if (v.bathrooms != null) ctx.addIssue({ code: "custom", path: ["bathrooms"], message: "غير منطقي لهذا النوع" });
  }
  if (v.main_category === "rent" && v.price != null && v.price_type === "total") {
    ctx.addIssue({ code: "custom", path: ["price_type"], message: "عقار الإيجار يحتاج نوع سعر دوريًا" });
  }
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "أدخل رقم جوال صحيحًا"),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(160).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  property_id: z.string().uuid().optional().or(z.literal("")),
  /* honeypot: real users never fill this */
  website: z.string().max(0, "طلب غير صالح").optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(160),
  password: z.string().min(8, "كلمة المرور قصيرة").max(200),
});

export const settingsSchema = z.object({
  office_name: z.string().trim().min(3).max(120),
  tagline: z.string().trim().max(200).optional().nullable(),
  about_text: z.string().trim().max(4000).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  whatsapp: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().max(160).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  working_hours: z.string().trim().max(200).optional().nullable(),
  brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "لون غير صحيح").optional().nullable(),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "لون غير صحيح").optional().nullable(),
  show_owner_phone: z.coerce.boolean().default(false),
});
