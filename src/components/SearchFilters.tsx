"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { MAIN_CATEGORIES, mainCategory } from "@/lib/taxonomy";

type Props = {
  cities: string[];
  lockedCategory?: string;
  showCategory?: boolean;
};

const SORTS = [
  { v: "newest", l: "الأحدث" },
  { v: "price_asc", l: "الأقل سعرًا" },
  { v: "price_desc", l: "الأعلى سعرًا" },
  { v: "area_desc", l: "الأكبر مساحة" },
];

export default function SearchFilters({ cities, lockedCategory, showCategory = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState(lockedCategory ?? params.get("category") ?? "");
  const [sub, setSub] = useState(params.get("sub") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [minArea, setMinArea] = useState(params.get("minArea") ?? "");
  const [maxArea, setMaxArea] = useState(params.get("maxArea") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "newest");

  const subs = useMemo(() => mainCategory(cat)?.subs ?? [], [cat]);

  const activeCount = ["sub", "city", "minPrice", "maxPrice", "minArea", "maxArea", "sort"].filter((k) => {
    const v = params.get(k);
    return v && !(k === "sort" && v === "newest");
  }).length;

  const push = useCallback(
    (next: Record<string, string>) => {
      const sp = new URLSearchParams();
      const merged = {
        q, category: cat, sub, city, minPrice, maxPrice, minArea, maxArea, sort,
        ...next,
      } as Record<string, string>;
      for (const [k, v] of Object.entries(merged)) {
        if (v && !(k === "sort" && v === "newest") && !(k === "category" && !showCategory)) sp.set(k, v);
      }
      const target = showCategory && merged.category ? `/${mainCategory(merged.category)?.slug ?? ""}` : pathname;
      const base = lockedCategory || merged.category ? `/${mainCategory(merged.category || lockedCategory || "")?.slug ?? ""}` : pathname;
      const url = `${showCategory ? base : pathname}?${sp.toString()}`;
      router.push(url, { scroll: false });
    },
    [q, cat, sub, city, minPrice, maxPrice, minArea, maxArea, sort, pathname, showCategory, lockedCategory, router]
  );

  function reset() {
    setQ(""); setSub(""); setCity(""); setMinPrice(""); setMaxPrice(""); setMinArea(""); setMaxArea(""); setSort("newest");
    router.push(lockedCategory ? `/${mainCategory(lockedCategory)?.slug ?? pathname}` : pathname, { scroll: false });
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); push({}); }}
      className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-4 shadow-soft sm:p-5"
      role="search"
      aria-label="تصفية العقارات"
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Label htmlFor="f-q">بحث</Label>
          <input
            id="f-q" type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="الحي، المدينة، رقم المرجع…" className={inputCls}
          />
        </div>

        {showCategory ? (
          <div>
            <Label htmlFor="f-cat">التصنيف الرئيسي</Label>
            <select
              id="f-cat" value={cat}
              onChange={(e) => { setCat(e.target.value); setSub(""); push({ category: e.target.value, sub: "" }); }}
              className={inputCls}
            >
              <option value="">كل التصنيفات</option>
              {MAIN_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <Label htmlFor="f-city">المدينة</Label>
            <select id="f-city" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
              <option value="">كل المدن</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <div>
          <Label htmlFor="f-sub">النوع</Label>
          <select id="f-sub" value={sub} onChange={(e) => setSub(e.target.value)} className={inputCls} disabled={!subs.length}>
            <option value="">{subs.length ? "كل الأنواع" : "لا توجد أنواع"}</option>
            {subs.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        {showCategory ? (
          <div>
            <Label htmlFor="f-city2">المدينة</Label>
            <select id="f-city2" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls}>
              <option value="">كل المدن</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ) : null}

        <div>
          <Label htmlFor="f-minp">أقل سعر</Label>
          <input id="f-minp" type="number" inputMode="numeric" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className={inputCls} />
        </div>
        <div>
          <Label htmlFor="f-maxp">أعلى سعر</Label>
          <input id="f-maxp" type="number" inputMode="numeric" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="بدون حد" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="f-mina">أقل مساحة</Label>
            <input id="f-mina" type="number" inputMode="numeric" min="0" value={minArea} onChange={(e) => setMinArea(e.target.value)} placeholder="م²" className={inputCls} />
          </div>
          <div>
            <Label htmlFor="f-maxa">أعلى مساحة</Label>
            <input id="f-maxa" type="number" inputMode="numeric" min="0" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} placeholder="م²" className={inputCls} />
          </div>
        </div>
        <div>
          <Label htmlFor="f-sort">الترتيب</Label>
          <select id="f-sort" value={sort} onChange={(e) => { setSort(e.target.value); push({ sort: e.target.value }); }} className={inputCls}>
            {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="submit" className="rounded-xl bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-brand-700">
          تطبيق الفلاتر
        </button>
        <button type="button" onClick={reset} className="rounded-xl border border-sand-200 px-4 py-2.5 text-[13.5px] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700">
          مسح الفلاتر
        </button>
        {activeCount > 0 && <span className="text-[12.5px] text-ink-500">فلاتر مفعّلة: <span className="tnum">{activeCount}</span></span>}
      </div>
    </form>
  );
}

const inputCls =
  "mt-1 w-full rounded-xl border border-sand-200 bg-sand-50/60 px-3 py-2.5 text-[13.5px] text-ink-900 outline-none transition-colors focus:border-brand-400 focus:bg-white disabled:cursor-not-allowed disabled:text-ink-300";

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="block text-[12px] font-semibold text-ink-700">{children}</label>;
}
