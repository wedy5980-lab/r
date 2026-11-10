import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import PropertyCard from "@/components/PropertyCard";
import { formatPrice, formatArea } from "@/components/PropertyCard";
import { getPropertyByRef, getMedia, listProperties } from "@/lib/properties";
import { getSettings } from "@/lib/db";
import {
  categoryLabel,
  subCategoryLabel,
  STATUS_LABELS,
  PRICE_TYPE_LABELS,
  mainCategory,
} from "@/lib/taxonomy";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  const p = await getPropertyByRef(ref);
  if (!p) return { title: "عقار غير متاح", robots: { index: false } };

  const place = [p.neighborhood, p.city].filter(Boolean).join(" — ");
  const desc =
    p.description?.slice(0, 155) ||
    `${categoryLabel(p.main_category)} في ${place || "المملكة العربية السعودية"} بمساحة ${p.area ?? "—"} م².`;

  return {
    title: p.title,
    description: desc,
    alternates: { canonical: `/property/${p.reference_number}` },
    openGraph: {
      title: p.title,
      description: desc,
      type: "article",
      url: `${SITE_URL}/property/${p.reference_number}`,
    },
    robots: { index: !p.is_demo, follow: true },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const p = await getPropertyByRef(ref);
  if (!p) notFound();

  const [media, settings, related] = await Promise.all([
    getMedia(p.id),
    getSettings(),
    listProperties({ category: p.main_category, perPage: 4 }),
  ]);

  const cat = mainCategory(p.main_category);
  const place = [p.neighborhood, p.city].filter(Boolean).join(" — ");
  const ownerPhone = settings.show_owner_phone ? p.owner_phone : null;

  const specs = [
    { label: "المساحة", value: formatArea(p.area) },
    { label: "عرض الشارع", value: p.street_width != null ? `${p.street_width} م` : null },
    { label: "غرف النوم", value: p.bedrooms != null ? String(p.bedrooms) : null },
    { label: "دورات المياه", value: p.bathrooms != null ? String(p.bathrooms) : null },
    { label: "الدوار", value: p.floors != null ? String(p.floors) : null },
    { label: "نوع السعر", value: PRICE_TYPE_LABELS[p.price_type] },
    { label: "النوع", value: subCategoryLabel(p.main_category, p.subcategory) || null },
    { label: "رقم المرجع", value: p.reference_number },
  ].filter((s) => s.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description ?? undefined,
    url: `${SITE_URL}/property/${p.reference_number}`,
    ...(p.price != null ? { offers: { "@type": "Offer", price: p.price, priceCurrency: "SAR" } } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: p.city ?? undefined,
      addressRegion: p.neighborhood ?? undefined,
      addressCountry: "SA",
    },
  };

  return (
    <div className="container-x py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="مسار التنقل" className="text-[12.5px] text-ink-500">
        <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
        <span className="mx-2 text-ink-300">/</span>
        <Link href={`/${cat?.slug ?? ""}`} className="hover:text-brand-600">{categoryLabel(p.main_category)}</Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-900">{p.title}</span>
      </nav>

      {p.is_demo && (
        <p className="mt-4 rounded-xl border border-gold-400/40 bg-gold-300/15 px-4 py-2.5 text-[12.5px] text-ink-700">
          <strong className="font-bold">عرض توضيحي:</strong> هذا العقار مُدرج كبيانات تجريبية لعرض شكل المنصة، والصور أمثلة معمارية غير مرتبطة بعقار حقيقي.
        </p>
      )}

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Gallery media={media} title={p.title} />
        </div>

        <aside>
          <div className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-[11.5px] font-bold text-brand-700">
                {categoryLabel(p.main_category)}
              </span>
              {p.subcategory && (
                <span className="rounded-full bg-sand-100 px-3 py-1 text-[11.5px] font-semibold text-ink-700">
                  {subCategoryLabel(p.main_category, p.subcategory)}
                </span>
              )}
              <span className="ms-auto flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-700">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
                {STATUS_LABELS[p.status]}
              </span>
            </div>

            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-snug text-ink-900 sm:text-[26px]">
              {p.title}
            </h1>

            {place && (
              <p className="mt-2 flex items-center gap-1.5 text-[13.5px] text-ink-500">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                {place}
              </p>
            )}

            <div className="mt-5 rounded-xl bg-sand-50 p-4">
              <p className="text-[11.5px] font-semibold text-ink-500">السعر</p>
              <p className="mt-0.5 font-[family-name:var(--font-display)] text-2xl font-extrabold text-brand-700 tnum">
                {formatPrice(p)}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <a
                href={settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`استفسار عن العقار: ${p.title} (${p.reference_number})`)}` : "/contact"}
                target={settings.whatsapp ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="rounded-xl bg-[#25D366] px-4 py-3 text-center text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
              >
                استفسار واتساب
              </a>
              <a
                href={`/contact?property=${p.reference_number}`}
                className="rounded-xl bg-brand-600 px-4 py-3 text-center text-[13.5px] font-bold text-white transition-colors hover:bg-brand-700"
              >
                نموذج الاستفسار
              </a>
              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="col-span-2 rounded-xl border border-sand-200 px-4 py-3 text-center text-[13.5px] font-bold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                >
                  اتصال بالمكتب <span dir="ltr" className="tnum">{settings.phone}</span>
                </a>
              )}
            </div>

            {ownerPhone && (
              <p className="mt-3 text-[11.5px] text-ink-500">
                جوال المالك: <span dir="ltr" className="tnum">{ownerPhone}</span>
              </p>
            )}
            {!ownerPhone && (
              <p className="mt-3 rounded-lg bg-sand-100 px-3 py-2 text-[11.5px] leading-relaxed text-ink-500">
                بيانات التواصل تُدار عبر المكتب حفاظًا على خصوصية الملاك.
              </p>
            )}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-xl2)] border border-sand-200 bg-sand-200">
            {specs.map((s) => (
              <div key={s.label} className="bg-white p-3.5">
                <dt className="text-[11.5px] text-ink-500">{s.label}</dt>
                <dd className="mt-0.5 text-[13.5px] font-bold text-ink-900 tnum">{s.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {p.description && (
        <section className="mt-10 max-w-3xl" aria-labelledby="desc-heading">
          <h2 id="desc-heading" className="font-[family-name:var(--font-display)] text-lg font-bold text-ink-900">
            وصف العقار
          </h2>
          <p className="mt-3 whitespace-pre-line text-[14.5px] leading-[1.9] text-ink-700">{p.description}</p>
        </section>
      )}

      {related.items.filter((r) => r.id !== p.id).length > 0 && (
        <section className="mt-14" aria-labelledby="related-heading">
          <h2 id="related-heading" className="font-[family-name:var(--font-display)] text-lg font-bold text-ink-900">
            عقارات مشابهة في {categoryLabel(p.main_category)}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.items.filter((r) => r.id !== p.id).slice(0, 3).map((r) => (
              <PropertyCard key={r.id} property={r} image={related.firstImage[r.id]} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
