import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import Reveal from "@/components/Reveal";
import { listProperties, getCityOptions } from "@/lib/properties";
import { categoryBySlug, AUCTIONS_EMPTY_MESSAGE } from "@/lib/taxonomy";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const HERO_IMG: Record<string, string> = {
  sale: "/media/category-sale.webp",
  rent: "/media/category-rent.webp",
  management: "/media/category-management.webp",
  auction: "/media/category-auction.webp",
};

export async function buildCategoryPage(slug: string, searchParams: SearchParams) {
  const sp = await searchParams;
  const cat = categoryBySlug(slug);
  if (!cat) return null;

  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const num = (k: string) => {
    const v = one(k);
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  const page = Math.max(Number(one("page") || 1) || 1, 1);

  const [res, cities] = await Promise.all([
    listProperties({
      q: one("q"),
      category: cat.key,
      sub: one("sub"),
      city: one("city"),
      minPrice: num("minPrice"),
      maxPrice: num("maxPrice"),
      minArea: num("minArea"),
      maxArea: num("maxArea"),
      sort: (one("sort") as "newest" | "price_asc" | "price_desc" | "area_desc") || "newest",
      page,
      perPage: 12,
    }),
    getCityOptions(),
  ]);

  const selectedSub = cat.subs.find((s) => s.key === one("sub"));

  const qs = (over: Record<string, string | number>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && v) p.set(k, v);
    for (const [k, v] of Object.entries(over)) {
      if (v === "" ) p.delete(k); else p.set(k, String(v));
    }
    return p.toString();
  };

  return (
    <div>
      {/* category hero */}
      <section className="relative isolate overflow-hidden bg-ink-900">
        <Image src={HERO_IMG[cat.key]} alt="" fill sizes="100vw" className="object-cover opacity-45" priority />
        <div className="absolute inset-0 bg-gradient-to-l from-ink-900/90 via-ink-900/70 to-ink-900/40" />
        <div className="container-x relative py-14 md:py-20">
          <nav aria-label="مسار التنقل" className="text-[12.5px] text-white/60">
            <Link href="/" className="hover:text-gold-300">الرئيسية</Link>
            <span className="mx-2">/</span>
            <span className="text-white/90">{cat.label}</span>
          </nav>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[26px] font-extrabold text-white sm:text-[34px]">
            {cat.label}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-white/70">{cat.blurb}</p>

          {cat.subs.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              <li>
                <Link
                  href={`/${cat.slug}`}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    !selectedSub ? "bg-gold-500 text-ink-900" : "border border-white/25 text-white/80 hover:bg-white/10"
                  }`}
                >
                  الكل
                </Link>
              </li>
              {cat.subs.map((s) => (
                <li key={s.key}>
                  <Link
                    href={`/${cat.slug}?sub=${s.key}`}
                    className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                      selectedSub?.key === s.key ? "bg-gold-500 text-ink-900" : "border border-white/25 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="container-x py-10">
        {cat.key === "auction" && res.total === 0 ? (
          <div className="rounded-[var(--radius-xl2)] border border-dashed border-sand-200 bg-white p-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sand-100 text-ink-300" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="m5 15 4-4 3 3 6-6" />
                <path d="M4 20h16" />
              </svg>
            </div>
            <p className="mt-4 font-[family-name:var(--font-display)] text-xl font-bold text-ink-900">{AUCTIONS_EMPTY_MESSAGE}</p>
            <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-500">
              لا نعرض مزادات غير قائمة. سيتم الإعلان عن أي مزاد عقاري معتمد هنا بمجرد اعتماده من المكتب.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/sale" className="rounded-xl bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-brand-700">
                عقارات البيع
              </Link>
              <Link href="/contact" className="rounded-xl border border-sand-200 px-5 py-2.5 text-[13.5px] font-bold text-ink-700 hover:border-brand-300 hover:text-brand-700">
                تواصل معنا
              </Link>
            </div>
          </div>
        ) : (
          <>
            <Suspense fallback={<div className="h-40 skeleton rounded-[var(--radius-xl2)]" />}>
              <SearchFilters cities={cities} lockedCategory={cat.key} showCategory={false} />
            </Suspense>

            <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink-900">
                {selectedSub ? selectedSub.label : cat.label}
                <span className="ms-2 text-[13px] font-semibold text-ink-500 tnum">({res.total} عقار)</span>
              </h2>
              <p className="text-[12.5px] text-ink-500">صفحة <span className="tnum">{res.page}</span> من <span className="tnum">{res.totalPages}</span></p>
            </div>

            {res.items.length === 0 ? (
              <div className="mt-6 rounded-[var(--radius-xl2)] border border-dashed border-sand-200 bg-white p-12 text-center">
                <p className="font-bold text-ink-900">لا توجد نتائج مطابقة</p>
                <p className="mt-2 text-[13.5px] text-ink-500">جرّب توسيع نطاق السعر أو المساحة، أو امسح الفلاتر.</p>
                <Link href={`/${cat.slug}`} className="mt-5 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-brand-700">
                  مسح الفلاتر
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {res.items.map((p, i) => (
                  <Reveal key={p.id} delay={i * 60}>
                    <PropertyCard property={p} image={res.firstImage[p.id]} priority={i < 3} />
                  </Reveal>
                ))}
              </div>
            )}

            {res.totalPages > 1 && (
              <nav aria-label="تصفح الصفحات" className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: res.totalPages }).map((_, idx) => {
                  const n = idx + 1;
                  const active = n === res.page;
                  return (
                    <Link
                      key={n}
                      href={`/${cat.slug}?${qs({ page: n })}`}
                      scroll
                      aria-current={active ? "page" : undefined}
                      className={`grid h-9 w-9 place-items-center rounded-lg text-[13px] font-bold tnum transition-colors ${
                        active ? "bg-brand-600 text-white" : "border border-sand-200 bg-white text-ink-700 hover:border-brand-300"
                      }`}
                    >
                      {n}
                    </Link>
                  );
                })}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
