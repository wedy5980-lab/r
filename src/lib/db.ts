import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./config";

/**
 * Server-only Supabase client using the service role key.
 * This module must never be imported from a client component.
 * `import "server-only"` makes a bundling mistake a hard build error.
 */
let cached: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (cached) return cached;
  const { url, key } = env();
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "muath-real-estate" } },
  });
  return cached;
}

export type Property = {
  id: string;
  reference_number: string;
  title: string;
  main_category: string;
  subcategory: string | null;
  description: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  area: number | null;
  street_width: number | null;
  price: number | null;
  price_type: string;
  rental_period: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  status: string;
  owner_name?: string | null;
  owner_phone?: string | null;
  internal_notes?: string | null;
  is_featured: boolean;
  is_demo: boolean;
  views_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type Media = {
  id: string;
  property_id: string;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url: string | null;
  alt_ar: string | null;
  display_order: number;
};

export type OfficeSettings = {
  office_name: string;
  tagline: string | null;
  about_text: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  working_hours: string | null;
  logo_url: string | null;
  brand_color: string | null;
  accent_color: string | null;
  social_links: Record<string, string>;
  show_owner_phone: boolean;
};

export const FALLBACK_SETTINGS: OfficeSettings = {
  office_name: "مكتب معاذ الضحيان للعقارات",
  tagline: "حياكم الله في مكتب معاذ الضحيان للعقارات",
  about_text: null,
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
  working_hours: null,
  logo_url: null,
  brand_color: "#0f6b52",
  accent_color: "#c9a227",
  social_links: {},
  show_owner_phone: false,
};

export async function getSettings(): Promise<OfficeSettings> {
  if (process.env.DEMO_DATA === "1") {
    // lazy import keeps the fixture out of production bundles
    const { DEMO_SETTINGS } = await import("./demo");
    return DEMO_SETTINGS;
  }
  try {
    const { data } = await db().from("mp_office_settings").select("*").eq("id", 1).maybeSingle();
    if (!data) return FALLBACK_SETTINGS;
    return { ...FALLBACK_SETTINGS, ...data };
  } catch {
    return FALLBACK_SETTINGS;
  }
}
