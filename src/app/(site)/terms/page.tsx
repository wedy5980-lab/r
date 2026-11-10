import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description: "شروط استخدام منصة مكتب معاذ الضحيان للعقارات.",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  { h: "طبيعة المحتوى", p: "تُعرض العقارات لأغراض التعريف والاستفسار. المعلومات قابلة للتغيّر، ولا تُعد عرضًا ملزمًا أو عقدًا." },
  { h: "دقة البيانات", p: "نسعى لعرض معلومات ومساحات وأسعار محدثة، إلا أن الأولوية للتحقق من التفاصيل عند المعاينة والاتفاق المباشر مع المكتب." },
  { h: "حالة العقارات", p: "قد يتغيّر توفر العقار (متاح، مباع، مؤجر) في أي وقت. تُحدَّث الحالات من لوحة الإدارة، ويُرجى التأكد قبل اتخاذ قرار." },
  { h: "الاستخدام المسموح", p: "يُمنع استخدام الموقع لأي غرض غير مشروع، أو محاولة الوصول غير المصرّح به للوحة الإدارة أو قواعد البيانات، أو إرسال محتوى مسيء." },
  { h: "الملكية الفكرية", p: "اسم المكتب وهويته البصرية ومحتوى الموقع محفوظة لأصحابها. الصور التوضيحية المستخدمة لأغراض العرض." },
  { h: "المسؤولية", p: "لا يتحمل المكتب مسؤولية أي قرار يُتخذ استنادًا إلى معلومات غير مؤكدة دون معاينة واتفاق موثّق." },
];

export default function TermsPage() {
  return (
    <div className="container-x py-10 md:py-14">
      <nav aria-label="مسار التنقل" className="text-[12.5px] text-ink-500">
        <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-900">الشروط والأحكام</span>
      </nav>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[26px] font-extrabold text-ink-900 sm:text-[32px]">الشروط والأحكام</h1>
      <p className="mt-2 text-[13px] text-ink-500">آخر تحديث: نوفمبر 2026</p>
      <div className="mt-8 max-w-3xl space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-[15px] font-bold text-ink-900">{s.h}</h2>
            <p className="mt-1.5 text-[14px] leading-[1.9] text-ink-700">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
