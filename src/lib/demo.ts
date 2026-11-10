import type { Media, OfficeSettings, Property } from "./db";
import type { ListFilters, ListResult } from "./properties";

/**
 * OFFLINE PREVIEW FIXTURE — not used in production.
 *
 * Enabled only when DEMO_DATA=1. It mirrors a snapshot of the real database so the
 * interface can be reviewed in environments that cannot reach Supabase (e.g. this
 * build sandbox). Production deployments read exclusively from PostgreSQL.
 *
 * All rows are marked `is_demo` and described as illustrative in the UI.
 */

export const demoEnabled = () => process.env.DEMO_DATA === "1";

type Row = Property & { _media: Media[] };

const img = (property_id: string, url: string, alt: string, order: number, i: number): Media => ({
  id: `${property_id}-m${i}`,
  property_id,
  media_type: "image",
  media_url: url,
  thumbnail_url: null,
  alt_ar: alt,
  display_order: order,
});

const base = {
  address: null,
  latitude: null,
  longitude: null,
  rental_period: null,
  views_count: 0,
  created_at: "2026-11-10T09:12:19Z",
  owner_name: "مالك العقار (بيانات تجريبية)",
  owner_phone: "0500000000",
  internal_notes: null,
  is_demo: true,
} as const;

const ROWS: Row[] = [
  {
    ...base,
    id: "d1", reference_number: "MP-2026-0001",
    title: "فلة حديثة التصميم بحي النرجس",
    main_category: "sale", subcategory: "villa",
    description:
      "فلة مستقلة بتصميم معماري حديث، واجهات حجرية ومجلس واسع وملحق خارجي. التشطيب فاخر والمطبخ مفتوح على الصالة. مدخلان منفصلان، وحديقة أمامية منسقة.",
    city: "الرياض", neighborhood: "حي النرجس",
    area: 400, street_width: 20, price: 2850000, price_type: "total",
    bedrooms: 5, bathrooms: 6, floors: 2, status: "available",
    is_featured: true, published_at: "2026-11-08T09:12:19Z", updated_at: "2026-11-08T09:12:19Z",
    _media: [
      img("d1", "/media/p1.webp", "واجهة الفلة — صورة توضيحية", 0, 0),
      img("d1", "/media/p2.webp", "المجلس — صورة توضيحية", 1, 1),
      img("d1", "/media/p3.webp", "المطبخ — صورة توضيحية", 2, 2),
    ],
  },
  {
    ...base,
    id: "d2", reference_number: "MP-2026-0002",
    title: "شقة واسعة بحي الملقا",
    main_category: "rent", subcategory: "apartment",
    description:
      "شقة بمساحة كبيرة في دور علوي، صالة ومجلس ومطبخ راكب، مواقف خاصة. قريبة من الخدمات والطرق الرئيسية.",
    city: "الرياض", neighborhood: "حي الملقا",
    area: 180, street_width: 15, price: 65000, price_type: "per_year",
    bedrooms: 3, bathrooms: 3, floors: 1, status: "available",
    is_featured: true, published_at: "2026-11-06T09:12:19Z", updated_at: "2026-11-06T09:12:19Z",
    _media: [
      img("d2", "/media/p2.webp", "الصالة — صورة توضيحية", 0, 0),
      img("d2", "/media/p3.webp", "المطبخ — صورة توضيحية", 1, 1),
    ],
  },
  {
    ...base,
    id: "d3", reference_number: "MP-2026-0003",
    title: "أرض سكنية بحي الشاطئ",
    main_category: "sale", subcategory: "residential_land",
    description: "أرض سكنية مستوية في موقع ممتاز، واجهة على شارع معتمد، جاهزة للبناء فوراً.",
    city: "جدة", neighborhood: "حي الشاطئ",
    area: 600, street_width: 18, price: 1950000, price_type: "total",
    bedrooms: null, bathrooms: null, floors: null, status: "available",
    is_featured: true, published_at: "2026-11-05T09:12:19Z", updated_at: "2026-11-05T09:12:19Z",
    _media: [img("d3", "/media/category-sale.webp", "الأرض — صورة توضيحية", 0, 0)],
  },
  {
    ...base,
    id: "d4", reference_number: "MP-2026-0004",
    title: "محل تجاري على شارع رئيسي",
    main_category: "rent", subcategory: "shop",
    description: "محل بواجهة زجاجية على شارع تجاري حيوي، مساحة داخلية مفتوحة ودورة مياه. مناسب للمقاهي والمتاجر.",
    city: "الدمام", neighborhood: "حي الشاطئ",
    area: 90, street_width: 25, price: 120000, price_type: "per_year",
    bedrooms: null, bathrooms: 1, floors: null, status: "available",
    is_featured: false, published_at: "2026-11-04T09:12:19Z", updated_at: "2026-11-04T09:12:19Z",
    _media: [img("d4", "/media/p4.webp", "واجهة المحل — صورة توضيحية", 0, 0)],
  },
  {
    ...base,
    id: "d5", reference_number: "MP-2026-0005",
    title: "عمارة سكنية تحت الإدارة",
    main_category: "management", subcategory: "building",
    description:
      "عمارة سكنية كاملة تحت إدارة المكتب: تأجير الوحدات، تحصيل الإيجارات، الصيانة الدورية، ومتابعة المستأجرين.",
    city: "الرياض", neighborhood: "حي العليا",
    area: 1200, street_width: 20, price: null, price_type: "negotiable",
    bedrooms: null, bathrooms: null, floors: 4, status: "available",
    is_featured: false, published_at: "2026-11-03T09:12:19Z", updated_at: "2026-11-03T09:12:19Z",
    owner_name: null, owner_phone: null,
    _media: [img("d5", "/media/category-management.webp", "العمارة — صورة توضيحية", 0, 0)],
  },
  {
    ...base,
    id: "d6", reference_number: "MP-2026-0006",
    title: "شقة عصرية قريبة من الخدمات",
    main_category: "rent", subcategory: "apartment",
    description: "شقة بتشطيب حديث، مطبخ مجهز ومكيفات مركبة، دخول ذكي وباحة مواقف.",
    city: "جدة", neighborhood: "حي الروضة",
    area: 140, street_width: 12, price: 48000, price_type: "per_year",
    bedrooms: 2, bathrooms: 2, floors: 1, status: "available",
    is_featured: false, published_at: "2026-11-02T09:12:19Z", updated_at: "2026-11-02T09:12:19Z",
    _media: [
      img("d6", "/media/p3.webp", "المطبخ — صورة توضيحية", 0, 0),
      img("d6", "/media/p2.webp", "الصالة — صورة توضيحية", 1, 1),
    ],
  },
  {
    ...base,
    id: "d7", reference_number: "MP-2026-0007",
    title: "دور أرضي بمدخل مستقل",
    main_category: "sale", subcategory: "ground_floor",
    description: "دور أرضي بمساحة جيدة ومدخل مستقل، صالة كبيرة وغرف نوم ومطبخ راكب، مصعد وموقف خاص.",
    city: "الخبر", neighborhood: "حي العقربية",
    area: 220, street_width: 15, price: 1150000, price_type: "total",
    bedrooms: 4, bathrooms: 3, floors: 1, status: "available",
    is_featured: false, published_at: "2026-11-01T09:12:19Z", updated_at: "2026-11-01T09:12:19Z",
    _media: [img("d7", "/media/category-rent.webp", "الدور الأرضي — صورة توضيحية", 0, 0)],
  },
];

const PUBLIC_KEYS: (keyof Property)[] = [
  "id", "reference_number", "title", "main_category", "subcategory", "description",
  "city", "neighborhood", "address", "latitude", "longitude", "area", "street_width",
  "price", "price_type", "rental_period", "bedrooms", "bathrooms", "floors", "status",
  "is_featured", "is_demo", "views_count", "published_at", "created_at", "updated_at",
];

const project = (r: Row): Property => {
  const out = {} as Property;
  for (const k of PUBLIC_KEYS) (out as Record<string, unknown>)[k] = r[k];
  return out;
};

const firstImageMap = (rows: Row[]) => {
  const map: Record<string, Media> = {};
  for (const r of rows) {
    const first = [...r._media].sort((a, b) => a.display_order - b.display_order)[0];
    if (first) map[r.id] = first;
  }
  return map;
};

export const DEMO_SETTINGS: OfficeSettings = {
  office_name: "مكتب معاذ الضحيان للعقارات",
  tagline: "حياكم الله في مكتب معاذ الضحيان للعقارات",
  about_text: null,
  phone: null, whatsapp: null, email: null, address: null, working_hours: null,
  logo_url: null, brand_color: "#0f6b52", accent_color: "#c9a227",
  social_links: {}, show_owner_phone: false,
};

export function demoList(f: ListFilters): ListResult {
  const perPage = Math.min(Math.max(f.perPage ?? 12, 1), 48);
  const page = Math.max(f.page ?? 1, 1);

  let rows = ROWS.filter((r) => r.status === "available");
  if (f.category) rows = rows.filter((r) => r.main_category === f.category);
  if (f.sub) rows = rows.filter((r) => r.subcategory === f.sub);
  if (f.city) rows = rows.filter((r) => r.city === f.city);
  if (f.neighborhood) rows = rows.filter((r) => r.neighborhood?.includes(f.neighborhood!));
  if (f.minPrice != null) rows = rows.filter((r) => (r.price ?? 0) >= f.minPrice!);
  if (f.maxPrice != null) rows = rows.filter((r) => (r.price ?? Infinity) <= f.maxPrice!);
  if (f.minArea != null) rows = rows.filter((r) => (r.area ?? 0) >= f.minArea!);
  if (f.maxArea != null) rows = rows.filter((r) => (r.area ?? Infinity) <= f.maxArea!);

  if (f.q) {
    const t = f.q.trim();
    rows = rows.filter((r) =>
      [r.title, r.description, r.neighborhood, r.city, r.reference_number]
        .some((v) => v?.toLowerCase().includes(t.toLowerCase()))
    );
  }

  const sorters: Record<string, (a: Row, b: Row) => number> = {
    price_asc: (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
    price_desc: (a, b) => (b.price ?? -1) - (a.price ?? -1),
    area_desc: (a, b) => (b.area ?? -1) - (a.area ?? -1),
    newest: (a, b) =>
      Number(b.is_featured) - Number(a.is_featured) ||
      b.published_at.localeCompare(a.published_at),
  };
  rows = [...rows].sort(sorters[f.sort ?? "newest"] ?? sorters.newest);

  const total = rows.length;
  const slice = rows.slice((page - 1) * perPage, page * perPage);

  return {
    items: slice.map(project),
    total,
    page,
    perPage,
    totalPages: Math.max(Math.ceil(total / perPage), 1),
    firstImage: firstImageMap(slice),
  };
}

export function demoByRef(ref: string): Property | null {
  const r = ROWS.find((x) => x.reference_number === ref && x.status === "available");
  return r ? project(r) : null;
}

export function demoMedia(propertyId: string): Media[] {
  return [...(ROWS.find((r) => r.id === propertyId)?._media ?? [])].sort(
    (a, b) => a.display_order - b.display_order
  );
}

export function demoCounts(): Record<string, number> {
  const out: Record<string, number> = { sale: 0, rent: 0, management: 0, auction: 0 };
  for (const r of ROWS) if (r.status === "available") out[r.main_category] = (out[r.main_category] ?? 0) + 1;
  return out;
}

export function demoCities(): string[] {
  return [...new Set(ROWS.map((r) => r.city).filter((c): c is string => !!c))].sort((a, b) =>
    a.localeCompare(b, "ar")
  );
}
