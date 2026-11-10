import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import Reveal from "@/components/Reveal";
import { listProperties, getCityOptions } from "@/lib/properties";
import { MAIN_CATEGORIES } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "البحث المتقدم عن العقارات",
  description: "ابحث في كامل عقارات المكتب حسب التصنيف والمدينة والسعر والمساحة.",
  alternates: { canonical: "/search" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
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
      category: one("category"),
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

  const qs = (n: number) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && v && k !== "page") p.set(k, v);
    p.set("page", String(n));
    return p.toString();
  };

  return (
    <div className="container-x py-10 md:py-14">
      <nav aria-label="مسار التنقل" className="text-[12.5px] text-ink-500">
        <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-900">البحث</span>
      </nav>

      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[26px] font-extrabold text-ink-900 sm:text-[32px]">
        البحث عن عقار
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] text-ink-500">
        ابحث في جميع العقارات المتاحة. النتائج تأتي مباشرة من قاعدة بيانات المكتب.
      </p>

      <div className="mt-6">
        <Suspense fallback={<div className="h-52 skeleton rounded-[var(--radius-xl2)]" />}>
          <SearchFilters cities={cities} />
        </Suspense>
      </div>

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-ink-900">
          النتائج <span className="ms-2 text-[13px] font-semibold text-ink-500 tnum">({res.total})</span>
        </h2>
        <p className="text-[12.5px] text-ink-500">صفحة <span className="tnum">{res.page}</span> من <span className="tnum">{res.totalPages}</span></p>
      </div>

      {res.items.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-xl2)] border border-dashed border-sand-200 bg-white p-12 text-center">
          <p className="font-bold text-ink-900">لا توجد نتائج مطابقة لبحثك</p>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] text-ink-500">
            جرّب كلمة بحث مختلفة أو وسّع نطاق السعر والمساحة.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {MAIN_CATEGORIES.map((c) => (
              <Link key={c.key} href={`/${c.slug}`} className="rounded-lg border border-sand-200 px-4 py-2 text-[13px] font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700">
                {c.label}
              </Link>
            ))}
          </div>
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
          {Array.from({ length: res.totalPages }).map((_, i) => {
            const n = i + 1;
            return (
              <Link
                key={n}
                href={`/search?${qs(n)}`}
                aria-current={n === res.page ? "page" : undefined}
                className={`grid h-9 w-9 place-items-center rounded-lg text-[13px] font-bold tnum ${
                  n === res.page ? "bg-brand-600 text-white" : "border border-sand-200 bg-white text-ink-700 hover:border-brand-300"
                }`}
              >
                {n}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
