import { redirect } from "next/navigation";
import { getSession, atLeast } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "بيانات المكتب" };

export default async function SettingsPage() {
  const s = await getSession();
  if (!s || !atLeast(s.role, "manager")) redirect("/admin");

  const settings = await getSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">بيانات المكتب</h1>
        <p className="mt-1 text-[12.5px] text-ink-500">
          تنعكس هذه البيانات مباشرة على الموقع: العنوان، الترويسة، التذييل، وصفحة التواصل.
        </p>
      </div>
      <SettingsForm settings={settings} />
      <p className="rounded-xl border border-gold-400/40 bg-gold-300/10 px-4 py-3 text-[11.5px] leading-relaxed text-ink-700">
        <strong className="font-bold">ملاحظة:</strong> السجل التجاري ورقم الترخيص العقاري وغيرهما من
        المعرّفات النظامية لا تُضاف إلا بعد التحقق من الوثائق الرسمية للمكتب.
      </p>
    </div>
  );
}
