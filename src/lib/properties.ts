import "server-only";
import { db, type Media, type Property } from "./db";
import type { MainCategory } from "./taxonomy";

/** Public listing: only `available` rows, owner fields never selected. */
const PUBLIC_COLUMNS =
  "id,reference_number,title,main_category,subcategory,description,city,neighborhood,address," +
  "latitude,longitude,area,street_width,price,price_type,rental_period,bedrooms,bathrooms,floors," +
  "status,is_featured,is_demo,views_count,published_at,created_at,updated_at";

export type ListFilters = {
  q?: string;
  category?: string;
  sub?: string;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "area_desc";
  page?: number;
  perPage?: number;
};

export type ListResult = {
  items: Property[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  firstImage: Record<string, Media>;
};

/** Escape user input before using inside a PostgREST `or()` filter string. */
function safeTerm(t: string) {
  return t.replace(/[%,()*"'\\]/g, " ").trim().slice(0, 80);
}

export async function listProperties(f: ListFilters, opts: { includeHidden?: boolean } = {}): Promise<ListResult> {
  if (process.env.DEMO_DATA === "1") {
    const { demoList } = await import("./demo");
    return demoList(f);
  }
  const perPage = Math.min(Math.max(f.perPage ?? 12, 1), 48);
  const page = Math.max(f.page ?? 1, 1);
  const from = (page - 1) * perPage;

  let q = db()
    .from("mp_properties")
    .select(opts.includeHidden ? "*" : PUBLIC_COLUMNS, { count: "exact" });

  if (!opts.includeHidden) q = q.eq("status", "available");

  if (f.category) q = q.eq("main_category", f.category);
  if (f.sub) q = q.eq("subcategory", f.sub);
  if (f.city) q = q.eq("city", f.city);
  if (f.neighborhood) q = q.ilike("neighborhood", `%${safeTerm(f.neighborhood)}%`);
  if (f.minPrice != null) q = q.gte("price", f.minPrice);
  if (f.maxPrice != null) q = q.lte("price", f.maxPrice);
  if (f.minArea != null) q = q.gte("area", f.minArea);
  if (f.maxArea != null) q = q.lte("area", f.maxArea);

  if (f.q) {
    const t = safeTerm(f.q);
    if (t) {
      q = q.or(
        [
          `title.ilike.%${t}%`,
          `description.ilike.%${t}%`,
          `neighborhood.ilike.%${t}%`,
          `city.ilike.%${t}%`,
          `reference_number.ilike.%${t}%`,
        ].join(",")
      );
    }
  }

  switch (f.sort) {
    case "price_asc":
      q = q.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      q = q.order("price", { ascending: false, nullsFirst: false });
      break;
    case "area_desc":
      q = q.order("area", { ascending: false, nullsFirst: false });
      break;
    default:
      q = q.order("is_featured", { ascending: false }).order("published_at", { ascending: false });
  }

  const { data, count, error } = await q.range(from, from + perPage - 1);
  if (error) throw new Error(error.message);

  const items = (data ?? []) as unknown as Property[];
  const firstImage = await getFirstImages(items.map((i) => i.id));

  return {
    items,
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.max(Math.ceil((count ?? 0) / perPage), 1),
    firstImage,
  };
}

/** One batched query instead of N per-card queries. */
async function getFirstImages(ids: string[]): Promise<Record<string, Media>> {
  if (!ids.length) return {};
  const { data } = await db()
    .from("mp_property_media")
    .select("*")
    .in("property_id", ids)
    .eq("media_type", "image")
    .order("display_order", { ascending: true });
  const map: Record<string, Media> = {};
  for (const m of (data ?? []) as Media[]) if (!map[m.property_id]) map[m.property_id] = m;
  return map;
}

export async function getPropertyByRef(reference: string): Promise<Property | null> {
  if (process.env.DEMO_DATA === "1") {
    const { demoByRef } = await import("./demo");
    return demoByRef(reference);
  }
  const { data } = await db()
    .from("mp_properties")
    .select(PUBLIC_COLUMNS)
    .eq("reference_number", reference)
    .eq("status", "available")
    .maybeSingle();
  return (data as unknown as Property) ?? null;
}

export async function getMedia(propertyId: string): Promise<Media[]> {
  if (process.env.DEMO_DATA === "1") {
    const { demoMedia } = await import("./demo");
    return demoMedia(propertyId);
  }
  const { data } = await db()
    .from("mp_property_media")
    .select("*")
    .eq("property_id", propertyId)
    .order("display_order", { ascending: true });
  return (data ?? []) as Media[];
}

export async function countByCategory(): Promise<Record<string, number>> {
  if (process.env.DEMO_DATA === "1") {
    const { demoCounts } = await import("./demo");
    return demoCounts();
  }
  const out: Record<string, number> = {};
  await Promise.all(
    (["sale", "rent", "management", "auction"] as MainCategory[]).map(async (c) => {
      const { count } = await db()
        .from("mp_properties")
        .select("id", { count: "exact", head: true })
        .eq("status", "available")
        .eq("main_category", c);
      out[c] = count ?? 0;
    })
  );
  return out;
}

export async function getCityOptions(): Promise<string[]> {
  if (process.env.DEMO_DATA === "1") {
    const { demoCities } = await import("./demo");
    return demoCities();
  }
  const { data } = await db()
    .from("mp_properties")
    .select("city")
    .eq("status", "available")
    .not("city", "is", null)
    .limit(500);
  const set = new Set<string>();
  for (const r of (data ?? []) as { city: string | null }[]) if (r.city) set.add(r.city);
  return [...set].sort((a, b) => a.localeCompare(b, "ar"));
}
