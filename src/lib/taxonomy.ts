/**
 * Single source of truth for the property taxonomy.
 * Order is contractual: it mirrors the office's approved specification exactly.
 * Keys are stable ASCII (safe for URLs / SEO); labels are the official Arabic terms.
 */

export type MainCategory = "sale" | "rent" | "management" | "auction";

export type SubCategory = { key: string; label: string };

export const MAIN_CATEGORIES: {
  key: MainCategory;
  label: string;
  slug: string;
  blurb: string;
  subs: SubCategory[];
}[] = [
  {
    key: "sale",
    label: "البيع",
    slug: "sale",
    blurb: "عقارات معروضة للبيع في مواقع مختارة",
    subs: [
      { key: "residential_land", label: "أرض سكنية" },
      { key: "commercial_land", label: "أرض تجارية" },
      { key: "villa", label: "فلة" },
      { key: "ground_floor", label: "دور أرضي" },
      { key: "upper_floor", label: "دور علوي" },
      { key: "apartment", label: "شقة" },
      { key: "chalet", label: "شالية" },
      { key: "rest_house", label: "استراحة" },
      { key: "hall", label: "صالة" },
      { key: "shop", label: "محل" },
      { key: "building", label: "عمارة" },
    ],
  },
  {
    key: "rent",
    label: "الإيجار",
    slug: "rent",
    blurb: "خيارات إيجار سكنية وتجارية",
    subs: [
      { key: "commercial_land", label: "أرض تجارية" },
      { key: "residential_land", label: "أرض سكنية" },
      { key: "villa", label: "فلة" },
      { key: "ground_floor", label: "دور أرضي" },
      { key: "upper_floor", label: "دور علوي" },
      { key: "apartment", label: "شقة" },
      { key: "chalet", label: "شالية" },
      { key: "rest_house", label: "استراحة" },
      { key: "shop", label: "محل" },
      { key: "hall", label: "صالة" },
      { key: "building", label: "عمارة" },
    ],
  },
  {
    key: "management",
    label: "إدارة الأملاك",
    slug: "management",
    blurb: "إدارة احترافية للأملاك والصيانة والتأجير",
    subs: [
      { key: "building", label: "عمارة" },
      { key: "villa", label: "فلة" },
      { key: "apartments", label: "شقق" },
      { key: "shops", label: "محلات" },
      { key: "chalets", label: "شاليهات" },
    ],
  },
  {
    key: "auction",
    label: "المزادات",
    slug: "auctions",
    blurb: "مزادات عقارية معلنة",
    subs: [],
  },
];

/** Auctions have no subcategories by specification. */
export const AUCTIONS_EMPTY_MESSAGE = "لا توجد مزادات حالياً";

export const STATUS_LABELS: Record<string, string> = {
  available: "متاح",
  sold: "تم البيع",
  rented: "مؤجر",
  unavailable: "غير متاح",
  archived: "مؤرشف",
};

export const PRICE_TYPE_LABELS: Record<string, string> = {
  total: "إجمالي",
  per_year: "سنوي",
  per_month: "شهري",
  per_day: "يومي",
  negotiable: "قابل للتفاوض",
};

export function mainCategory(key: string) {
  return MAIN_CATEGORIES.find((c) => c.key === key);
}

export function categoryLabel(key: string) {
  return mainCategory(key)?.label ?? key;
}

export function subCategoryLabel(main: string, key?: string | null) {
  if (!key) return "";
  return mainCategory(main)?.subs.find((s) => s.key === key)?.label ?? key;
}

export function categoryBySlug(slug: string) {
  return MAIN_CATEGORIES.find((c) => c.slug === slug);
}
