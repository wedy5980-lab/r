import Link from "next/link";
import PropertyForm from "@/components/admin/PropertyForm";

export const metadata = { title: "إضافة عقار" };

export default function NewPropertyPage() {
  return (
    <div className="space-y-5">
      <nav aria-label="مسار التنقل" className="text-[12.5px] text-ink-500">
        <Link href="/admin/properties" className="hover:text-brand-700">العقارات</Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-900">إضافة عقار</span>
      </nav>
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">إضافة عقار جديد</h1>
        <p className="mt-1 text-[12.5px] text-ink-500">
          يُولَّد رقم مرجعي تلقائيًا عند الحفظ. لا يظهر العقار للجمهور إلا عندما تكون حالته «متاح».
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
