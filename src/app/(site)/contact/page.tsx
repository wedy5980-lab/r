import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "تواصل مع مكتب معاذ الضحيان للعقارات للاستفسار عن العقارات أو خدمات إدارة الأملاك.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const [{ property }, settings] = await Promise.all([searchParams, getSettings()]);
  const wa = settings.whatsapp?.replace(/[^0-9]/g, "");

  return (
    <div className="container-x py-10 md:py-14">
      <nav aria-label="مسار التنقل" className="text-[12.5px] text-ink-500">
        <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-900">تواصل معنا</span>
      </nav>

      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[26px] font-extrabold text-ink-900 sm:text-[32px]">
        تواصل معنا
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-500">
        أخبرنا بما تحتاجه وسنعود إليك. للاستفسار السريع يمكنك الاتصال أو مراسلتنا على واتساب.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft sm:p-7">
          <h2 className="text-lg font-bold text-ink-900">نموذج الاستفسار</h2>
          <p className="mt-1 text-[13px] text-ink-500">الحقول المعلّمة بـ * مطلوبة.</p>
          <div className="mt-5">
            <InquiryForm propertyRef={property} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
            <h2 className="text-[15px] font-bold text-ink-900">بيانات المكتب</h2>
            <ul className="mt-4 space-y-3 text-[13.5px]">
              <li className="font-semibold text-ink-900">{settings.office_name}</li>
              {settings.phone ? (
                <li><a href={`tel:${settings.phone}`} className="text-brand-700 hover:underline" dir="ltr">{settings.phone}</a></li>
              ) : (
                <li className="text-ink-300">رقم الهاتف سيُضاف من لوحة الإدارة</li>
              )}
              {settings.email && (
                <li><a href={`mailto:${settings.email}`} className="text-brand-700 hover:underline" dir="ltr">{settings.email}</a></li>
              )}
              {settings.address && <li className="text-ink-500">{settings.address}</li>}
              {settings.working_hours && <li className="text-ink-500">{settings.working_hours}</li>}
            </ul>

            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.3 1.2-1.8 1.2-.5 0-1 .1-1.6-.1a13 13 0 0 1-4-2.5 11 11 0 0 1-2.2-3c-.2-.5-.4-1.1-.1-1.6.2-.4.9-1.3 1.2-1.4.3-.1.6-.1.8 0l.9 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6.4.7 1.5 2.1 2.9 2.6.3.1.5.1.6-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.2.5Z" />
                </svg>
                مراسلة واتساب
              </a>
            )}
          </div>

          <div className="rounded-[var(--radius-xl2)] border border-sand-200 bg-sand-100 p-5">
            <h2 className="text-[13px] font-bold text-ink-900">خصوصية بياناتك</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">
              تُستخدم بيانات الاستفسار للتواصل معك بشأن طلبك فقط، ولا تُنشر على الموقع.
              راجع <Link href="/privacy" className="text-brand-700 hover:underline">سياسة الخصوصية</Link>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
