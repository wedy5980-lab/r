import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "سجل النشاط" };

const ACTION_LABEL: Record<string, string> = {
  login: "تسجيل دخول", logout: "خروج", create: "إنشاء", update: "تحديث",
  delete: "حذف", archive: "أرشفة", status_change: "تغيير حالة",
  media_add: "إضافة وسيط", media_delete: "حذف وسيط", media_reorder: "إعادة ترتيب",
  media_upload: "رفع ملف", inquiry_status: "تحديث استفسار",
};

export default async function AuditPage() {
  const { data } = await db()
    .from("mp_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">سجل النشاط</h1>
        <p className="mt-1 text-[12.5px] text-ink-500">
          آخر ٢٠٠ عملية حساسة. السجل للقراءة فقط ولا يمكن تعديله من الواجهة.
        </p>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-xl2)] border border-sand-200 bg-white shadow-soft">
        <table className="w-full min-w-[640px] text-right text-[12px]">
          <thead className="bg-sand-50 text-[11px] uppercase text-ink-500">
            <tr>
              <th className="px-3 py-2.5 font-semibold">الوقت</th>
              <th className="px-3 py-2.5 font-semibold">العملية</th>
              <th className="px-3 py-2.5 font-semibold">الكيان</th>
              <th className="px-3 py-2.5 font-semibold">التفاصيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-8 text-center text-ink-300">لا نشاط مسجل بعد.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-sand-50">
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-500 tnum">{new Date(r.created_at).toLocaleString("ar-SA")}</td>
                <td className="px-3 py-2.5 font-semibold text-ink-900">{ACTION_LABEL[r.action] ?? r.action}</td>
                <td className="px-3 py-2.5 text-ink-700">{r.entity}</td>
                <td className="px-3 py-2.5 text-[11px] text-ink-500" dir="ltr">
                  {JSON.stringify(r.details).slice(0, 90)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
