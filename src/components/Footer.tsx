import Link from "next/link";
import { MAIN_CATEGORIES } from "@/lib/taxonomy";
import type { OfficeSettings } from "@/lib/db";

export default function Footer({ settings }: { settings: OfficeSettings }) {
  const year = new Date().getFullYear();
  const hasPhone = !!settings.phone;
  const wa = settings.whatsapp?.replace(/[^0-9]/g, "");

  return (
    <footer className="mt-20 border-t border-sand-200 bg-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-10 w-10 place-items-center rounded-xl text-white"
              style={{ background: "linear-gradient(145deg,var(--brand),var(--brand-deep,#0b5541))" }}
              aria-hidden="true"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.8V21h14V9.8" />
                <path d="M9.5 21v-6h5v6" />
              </svg>
            </span>
            <span className="text-[15px] font-extrabold leading-tight text-ink-900">
              {settings.office_name}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-ink-500">
            {settings.about_text ||
              "منصة عقارية لعرض العقارات للبيع والإيجار وإدارة الأملاك، بخدمة مباشرة وشفافة داخل المملكة العربية السعودية."}
          </p>
        </div>

        <nav aria-label="تصنيفات العقارات">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-900">التصنيفات</h2>
          <ul className="mt-4 space-y-2.5 text-[13.5px]">
            {MAIN_CATEGORIES.map((c) => (
              <li key={c.key}>
                <Link href={`/${c.slug}`} className="text-ink-500 transition-colors hover:text-brand-600">
                  {c.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search" className="text-ink-500 transition-colors hover:text-brand-600">
                البحث المتقدم
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="روابط الموقع">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-900">الموقع</h2>
          <ul className="mt-4 space-y-2.5 text-[13.5px]">
            <li><Link href="/about" className="text-ink-500 transition-colors hover:text-brand-600">عن المكتب</Link></li>
            <li><Link href="/contact" className="text-ink-500 transition-colors hover:text-brand-600">تواصل معنا</Link></li>
            <li><Link href="/privacy" className="text-ink-500 transition-colors hover:text-brand-600">سياسة الخصوصية</Link></li>
            <li><Link href="/terms" className="text-ink-500 transition-colors hover:text-brand-600">الشروط والأحكام</Link></li>
            <li><Link href="/admin/login" className="text-ink-300 transition-colors hover:text-brand-600">دخول الإدارة</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-900">التواصل</h2>
          <ul className="mt-4 space-y-3 text-[13.5px]">
            {hasPhone ? (
              <li>
                <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-ink-700 hover:text-brand-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 3 5a1 1 0 0 1 1-1Z" />
                  </svg>
                  <span dir="ltr">{settings.phone}</span>
                </a>
              </li>
            ) : (
              <li className="text-ink-300">رقم الهاتف — سيُضاف من لوحة الإدارة</li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-ink-700 hover:text-brand-600">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  <span dir="ltr">{settings.email}</span>
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2 text-ink-700">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 shrink-0" aria-hidden="true">
                  <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>{settings.address}</span>
              </li>
            )}
            {wa && (
              <li>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#25D366]/10 px-3 py-2 text-[13px] font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/20"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.3 1.2-1.8 1.2-.5 0-1 .1-1.6-.1a13 13 0 0 1-4-2.5 11 11 0 0 1-2.2-3c-.2-.5-.4-1.1-.1-1.6.2-.4.9-1.3 1.2-1.4.3-.1.6-.1.8 0l.9 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6.4.7 1.5 2.1 2.9 2.6.3.1.5.1.6-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.2.5Z" />
                  </svg>
                  واتساب
                </a>
              </li>
            )}
            {settings.working_hours && (
              <li className="text-ink-500">{settings.working_hours}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-sand-200">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-[12.5px] text-ink-500 sm:flex-row">
          <p>© {year} {settings.office_name}. جميع الحقوق محفوظة.</p>
          <p className="text-ink-300">المملكة العربية السعودية</p>
        </div>
      </div>
    </footer>
  );
}
