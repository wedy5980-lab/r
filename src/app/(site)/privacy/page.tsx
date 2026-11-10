import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "كيف يجمع مكتب معاذ الضحيان للعقارات بياناتك ويستخدمها ويحميها.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  { h: "البيانات التي نجمعها", p: "عند إرسال نموذج الاستفسار نجمع الاسم ورقم الجوال والبريد الإلكتروني (اختياري) ومحتوى الرسالة، إضافة إلى بيانات تقنية محدودة لمنع إساءة الاستخدام." },
  { h: "الغرض من المعالجة", p: "تُستخدم البيانات للتواصل معك بشأن استفسارك أو العقار محل الاهتمام فقط، ولإدارة طلبات المكتب." },
  { h: "بيانات الملاك", p: "أرقام جوال الملاك وبياناتهم الخاصة لا تُعرض للجمهور افتراضيًا، وتُحفظ في نظام الإدارة بصلاحيات محدودة وسجل تدقيق." },
  { h: "مشاركة البيانات", p: "لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة لأغراض تسويقية. قد تُشارك مع مزوّدي الخدمة التقنية لتشغيل الموقع فقط." },
  { h: "الاحتفاظ", p: "تُحفظ طلبات الاستفسار للمدة اللازمة لإدارة العلاقة التجارية، ويمكن طلب حذفها عبر التواصل مع المكتب." },
  { h: "حقوقك", p: "يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها بالتواصل مع المكتب عبر صفحة التواصل." },
  { h: "الأمان", p: "نستخدم اتصالًا مشفرًا (HTTPS)، وكلمات مرور مشفّرة، وصلاحيات وصول محددة، وسجل تدقيق للعمليات الحساسة." },
  { h: "التحديثات", p: "قد تُحدّث هذه السياسة عند تغيّر الأنظمة أو الخدمات، ويُعرض تاريخ آخر تحديث أدناه." },
];

export default function PrivacyPage() {
  return (
    <div className="container-x py-10 md:py-14">
      <nav aria-label="مسار التنقل" className="text-[12.5px] text-ink-500">
        <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-900">سياسة الخصوصية</span>
      </nav>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[26px] font-extrabold text-ink-900 sm:text-[32px]">سياسة الخصوصية</h1>
      <p className="mt-2 text-[13px] text-ink-500">آخر تحديث: نوفمبر 2026</p>

      <div className="mt-8 max-w-3xl space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-[15px] font-bold text-ink-900">{s.h}</h2>
            <p className="mt-1.5 text-[14px] leading-[1.9] text-ink-700">{s.p}</p>
          </section>
        ))}
        <div className="rounded-xl border border-gold-400/40 bg-gold-300/15 p-4 text-[12.5px] leading-relaxed text-ink-700">
          <strong className="font-bold">تنبيه:</strong> هذه السياسة تمثّل ممارسات تشغيلية فعلية للمنصة، ولا تُعد استشارة قانونية.
          يُنصح بمراجعة مستشار قانوني للتحقق من الالتزام بأنظمة حماية البيانات الشخصية المعمول بها في المملكة.
        </div>
      </div>
    </div>
  );
}
