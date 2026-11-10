import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import PropertyCard from "@/components/PropertyCard";
import { listProperties, countByCategory, getCityOptions } from "@/lib/properties";
import { getSettings } from "@/lib/db";
import { MAIN_CATEGORIES } from "@/lib/taxonomy";
import { WELCOME } from "@/lib/config";

export const dynamic = "force-dynamic";

const CATEGORY_IMAGES: Record<string, string> = {
  sale: "/media/category-sale.webp",
  rent: "/media/category-rent.webp",
  management: "/media/category-management.webp",
  auction: "/media/category-auction.webp",
};

export default async function HomePage() {
  const [settings, counts, cities] = await Promise.all([
    getSettings(),
    countByCategory(),
    getCityOptions(),
  ]);

  const [featured, latest] = await Promise.all([
    listProperties({ perPage: 6, sort: "newest" }),
    listProperties({ perPage: 3, sort: "newest", page: 1 }),
  ]);

  const showLatest =
    latest.items.length > 0 &&
    latest.items.some((i) => !featured.items.some((f) => f.id === i.id));

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink-900">
        <div className="absolute inset-0">
          <Image
            src="/media/hero.webp"
            alt="واجهة معمارية لفلل سكنية حديثة — صورة توضيحية"
            fill
            priority
            sizes="100vw"
            className="hero-media object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-ink-900/92 via-ink-900/70 to-ink-900/45" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(201,162,39,0.22),transparent_55%)]" />
        </div>

        <div className="container-x relative grid gap-10 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-32">
          <div className="fade-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-gold-300 backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" />
              مكتب عقاري معتمد — المملكة العربية السعودية
            </p>

            <h1 className="mt-5 font-[family-name:var(--font-display)] text-[28px] font-extrabold leading-[1.35] text-white sm:text-[38px] lg:text-[44px]">
              {settings.tagline || WELCOME}
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-[16px]">
              عقارات للبيع والإيجار وإدارة الأملاك، منتقاة بعناية ومصنّفة بوضوح.
              ابحث حسب النوع والمدينة والحي، واطّلع على التفاصيل والصور قبل التواصل.
            </p>

            <form action="/search" method="get" className="mt-8 rounded-2xl bg-white/95 p-2 shadow-lift backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="hero-q">ابحث عن عقار</label>
                <div className="flex flex-1 items-center gap-2 rounded-xl px-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink-300" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input
                    id="hero-q"
                    name="q"
                    type="search"
                    placeholder="ابحث بالحي، المدينة، أو رقم المرجع…"
                    className="w-full bg-transparent py-3 text-[14px] text-ink-900 outline-none placeholder:text-ink-300"
                  />
                </div>

                <label className="sr-only" htmlFor="hero-cat">التصنيف</label>
                <select
                  id="hero-cat"
                  name="category"
                  className="rounded-xl border border-sand-200 bg-white px-3 py-3 text-[13.5px] font-medium text-ink-700 outline-none focus:border-brand-400 sm:w-40"
                  defaultValue=""
                >
                  <option value="">كل التصنيفات</option>
                  {MAIN_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-700"
                >
                  بحث
                </button>
              </div>
            </form>

            {cities.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px]">
                <span className="text-white/50">مدن متاحة:</span>
                {cities.slice(0, 4).map((c) => (
                  <Link
                    key={c}
                    href={`/search?city=${encodeURIComponent(c)}`}
                    className="rounded-full border border-white/20 px-3 py-1 text-white/80 transition-colors hover:border-gold-400 hover:text-gold-300"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* stats card */}
          <Reveal className="lg:justify-self-end" delay={150}>
            <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
              <p className="text-[12px] font-bold uppercase tracking-wider text-gold-300">نظرة سريعة</p>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                {MAIN_CATEGORIES.map((c) => (
                  <div key={c.key} className="rounded-xl bg-white/10 p-3.5">
                    <dt className="text-[12px] text-white/60">{c.label}</dt>
                    <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-white tnum">
                      {counts[c.key] ?? 0}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-white/15 pt-3 text-[11.5px] leading-relaxed text-white/50">
                الأرقام محسوبة مباشرة من العقارات المتاحة في قاعدة البيانات.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CATEGORY CARDS ───────────────────────────────────── */}
      <section className="container-x -mt-8 relative z-10" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="sr-only">التصنيفات الرئيسية</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MAIN_CATEGORIES.map((c, i) => (
            <Reveal key={c.key} delay={i * 90}>
              <Link
                href={`/${c.slug}`}
                className="group relative flex h-44 flex-col justify-end overflow-hidden rounded-[var(--radius-xl2)] shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift sm:h-52"
              >
                <Image
                  src={CATEGORY_IMAGES[c.key]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/35 to-transparent" />
                <div className="relative p-4">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">{c.label}</h3>
                  <p className="mt-0.5 text-[12px] text-white/70">{c.blurb}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur tnum">
                    {counts[c.key] ?? 0} عقار
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURED ─────────────────────────────────────────── */}
      <section className="container-x py-16 md:py-20" aria-labelledby="featured-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-gold-600">عقارات مختارة</p>
            <h2 id="featured-heading" className="mt-1.5 font-[family-name:var(--font-display)] text-2xl font-extrabold text-ink-900 sm:text-3xl">
              أحدث العقارات المعروضة
            </h2>
            <p className="mt-2 max-w-xl text-[14px] text-ink-500">
              كل عقار يعرض حالته الفعلية؛ ولا تظهر العقارات المبيعة أو المؤجرة كعروض متاحة.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-[13.5px] font-bold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            عرض كل العقارات
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 6l6 6-6 6M20 12H4" transform="scale(-1,1) translate(-24,0)" />
            </svg>
          </Link>
        </div>

        {featured.items.length === 0 ? (
          <EmptyProperties />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.items.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <PropertyCard property={p} image={featured.firstImage[p.id]} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ── ABOUT / TRUST ────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20" aria-labelledby="about-heading">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-gold-600">عن المكتب</p>
            <h2 id="about-heading" className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
              خدمة عقارية واضحة من أول استفسار إلى إتمام الصفقة
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink-500">
              {settings.about_text ||
                "نعرض العقارات بتفاصيل دقيقة وصور حقيقية، ونرافق العميل في المعاينة والتفاوض والإجراءات. التصنيفات لدينا تغطي البيع والإيجار وإدارة الأملاك والمزادات."}
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "تفاصيل موثّقة لكل عقار",
                "تصنيف واضح يسهّل البحث",
                "تواصل مباشر مع المكتب",
                "خصوصية بيانات المالك",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-[13.5px] text-ink-700">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.4" className="mt-0.5 shrink-0" aria-hidden="true">
                    <path d="m4 12.5 5 5L20 6.5" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/about"
              className="mt-7 inline-flex rounded-xl bg-ink-900 px-5 py-3 text-[13.5px] font-bold text-white transition-colors hover:bg-ink-700"
            >
              تعرّف على المكتب
            </Link>
          </div>

          <Reveal delay={120}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl2)] shadow-lift">
              <Image
                src="/media/about.webp"
                alt="مشهد معماري توضيحي لحي سكني"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="container-x py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-xl2)] bg-ink-900 px-6 py-12 text-center sm:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(15,107,82,0.55),transparent_60%)]" />
            <div className="relative">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-white sm:text-3xl">
                هل تبحث عن عقار محدد؟
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[14px] text-white/70">
                أخبرنا بما تحتاجه وسنبحث لك عن الخيارات المناسبة، أو تواصل معنا مباشرة.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/contact" className="rounded-xl bg-gold-500 px-6 py-3 text-[14px] font-bold text-ink-900 transition-colors hover:bg-gold-400">
                  تواصل معنا
                </Link>
                <Link href="/search" className="rounded-xl border border-white/25 px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-white/10">
                  تصفّح العقارات
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function EmptyProperties() {
  return (
    <div className="mt-8 rounded-[var(--radius-xl2)] border border-dashed border-sand-200 bg-white p-12 text-center">
      <p className="font-[family-name:var(--font-display)] text-lg font-bold text-ink-900">لا توجد عقارات معروضة حالياً</p>
      <p className="mx-auto mt-2 max-w-md text-[13.5px] text-ink-500">
        ستظهر العقارات هنا فور إضافتها من لوحة الإدارة. يمكنك التواصل معنا لمعرفة المتاح.
      </p>
      <Link href="/contact" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-brand-700">
        تواصل معنا
      </Link>
    </div>
  );
}
