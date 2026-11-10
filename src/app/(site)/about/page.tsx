import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getSettings } from "@/lib/db";
import { MAIN_CATEGORIES } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "عن المكتب",
  description: "مكتب معاذ الضحيان للعقارات — خدمات البيع والإيجار وإدارة الأملاك في المملكة العربية السعودية.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <div className="container-x py-10 md:py-14">
      <nav aria-label="مسار التنقل" className="text-[12.5px] text-ink-500">
        <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-900">عن المكتب</span>
      </nav>

      <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[26px] font-extrabold leading-snug text-ink-900 sm:text-[34px]">
        {s.tagline || "حياكم الله في مكتب معاذ الضحيان للعقارات"}
      </h1>
      <p className="mt-4 max-w-2xl text-[14.5px] leading-[1.9] text-ink-500">
        {s.about_text ||
          "نعمل في الوساطة العقارية وإدارة الأملاك داخل المملكة العربية السعودية. نعرض العقارات بتفاصيل واضحة وصور واقعية، ونرافق العميل في المعاينة والتفاوض حتى إتمام الإجراءات."}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MAIN_CATEGORIES.map((c, i) => (
          <Reveal key={c.key} delay={i * 80}>
            <div className="h-full rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
              <h2 className="font-[family-name:var(--font-display)] text-[15px] font-bold text-brand-700">{c.label}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{c.blurb}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {c.subs.slice(0, 4).map((sub) => (
                  <li key={sub.key} className="rounded-md bg-sand-100 px-2 py-0.5 text-[11.5px] text-ink-700">{sub.label}</li>
                ))}
                {c.subs.length === 0 && <li className="text-[11.5px] text-ink-300">لا توجد أنواع فرعية</li>}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-bold text-ink-900">ملاحظة توضيحية</h2>
        <p className="mt-3 max-w-3xl text-[13.5px] leading-[1.9] text-ink-500">
          تُملأ بيانات المكتب الرسمية (السجل التجاري، العنوان، أرقام التواصل) من لوحة الإدارة بعد
          اعتمادها من صاحب المكتب. لا تُعرض أي بيانات غير مؤكدة على الموقع.
        </p>
      </div>
    </div>
  );
}
