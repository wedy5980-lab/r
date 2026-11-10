import Link from "next/link";
import Image from "next/image";
import type { Property } from "@/lib/db";
import type { Media } from "@/lib/db";
import {
  categoryLabel,
  subCategoryLabel,
  STATUS_LABELS,
  PRICE_TYPE_LABELS,
} from "@/lib/taxonomy";

export function formatPrice(p: Pick<Property, "price" | "price_type">): string {
  if (p.price == null) return "السعر عند الطلب";
  if (p.price_type === "negotiable") return "قابل للتفاوض";
  const n = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(p.price);
  const suffix =
    p.price_type === "per_year"
      ? " / سنويًا"
      : p.price_type === "per_month"
        ? " / شهريًا"
        : p.price_type === "per_day"
          ? " / يوميًا"
          : "";
  return `${n} ر.س${suffix}`;
}

export function formatArea(a: number | null) {
  if (a == null) return null;
  return `${new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(a)} م²`;
}

export default function PropertyCard({
  property,
  image,
  priority = false,
}: {
  property: Property;
  image?: Media;
  priority?: boolean;
}) {
  const href = `/property/${property.reference_number}`;
  const place = [property.neighborhood, property.city].filter(Boolean).join(" — ");
  const subs = subCategoryLabel(property.main_category, property.subcategory);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl2)] border border-sand-200 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden="true">
        {image ? (
          <Image
            src={image.media_url}
            alt={image.alt_ar || property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-sand-100 text-ink-300">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
              <rect x="9.5" y="14" width="5" height="7" />
            </svg>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-brand-700 backdrop-blur">
            {categoryLabel(property.main_category)}
          </span>
          {property.is_featured && (
            <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-bold text-ink-900 shadow">
              مميز
            </span>
          )}
        </div>

        {/* gradient scrim keeps the price legible over any photo */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-sm font-bold text-ink-900 tnum">
          {formatPrice(property)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-ink-900">
          <Link href={href} className="transition-colors hover:text-brand-600">
            {property.title}
          </Link>
        </h3>

        {place && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span className="line-clamp-1">{place}</span>
          </p>
        )}

        <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-700">
          {property.area != null && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">المساحة</dt>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6" />
              </svg>
              <dd className="tnum">{formatArea(property.area)}</dd>
            </div>
          )}
          {property.bedrooms != null && property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">غرف النوم</dt>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 18v-6h18v6M3 18v2M21 18v2M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
              </svg>
              <dd className="tnum">{property.bedrooms}</dd>
            </div>
          )}
          {subs && (
            <div className="ms-auto rounded-md bg-sand-100 px-2 py-0.5 text-[11px] font-medium text-ink-500">
              {subs}
            </div>
          )}
        </dl>

        <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-3">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
            {STATUS_LABELS[property.status] ?? property.status}
            <span className="text-ink-300">·</span>
            {PRICE_TYPE_LABELS[property.price_type]}
          </span>
          <Link
            href={href}
            className="group/btn inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-brand-600 transition-colors hover:bg-brand-50"
          >
            التفاصيل
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover/btn:-translate-x-0.5" aria-hidden="true">
              <path d="M14 6l-6 6 6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
