import Link from "next/link";
import { db } from "@/lib/db";
import { STATUS_LABELS, categoryLabel } from "@/lib/taxonomy";
import { formatPrice } from "@/components/PropertyCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة العقارات" };

export default async function AdminProperties({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; deleted?: string }>;
}) {
  const sp = await searchParams;

  let q = db().from("mp_properties").select("*", { count: "exact" });
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.category) q = q.eq("main_category", sp.category);
  if (sp.q) {
    const t = sp.q.replace(/[%,()"']/g, " ").slice(0, 60);
    q = q.or(`title.ilike.%${t}%,reference_number.ilike.%${t}%,city.ilike.%${t}%`);
  }
  const { data, count } = await q.order("updated_at", { ascending: false }).limit(100);
  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">العقارات</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            <span className="tnum">{count ?? 0}</span> عقار — تشمل المؤرشفة
          </p>
        </div>
        <Link href="/admin/properties/new" className="rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-brand-700">
          + إضافة عقار
        </Link>
      </div>

      {sp.deleted && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] text-red-700">
          تم حذف العقار نهائيًا. تم تسجيل العملية في سجل النشاط.
        </p>
      )}

      <form method="get" className="flex flex-wrap gap-2 rounded-xl border border-sand-200 bg-white p-3">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="ابحث بالعنوان أو المرجع أو المدينة…"
          className="min-w-48 flex-1 rounded-lg border border-sand-200 px-3 py-2 text-[13px] outline-none focus:border-brand-400"
        />
        <select name="status" defaultValue={sp.status ?? ""} className="rounded-lg border border-sand-200 px-3 py-2 text-[13px]">
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="category" defaultValue={sp.category ?? ""} className="rounded-lg border border-sand-200 px-3 py-2 text-[13px]">
          <option value="">كل التصنيفات</option>
          <option value="sale">البيع</option>
          <option value="rent">الإيجار</option>
          <option value="management">إدارة الأملاك</option>
          <option value="auction">المزادات</option>
        </select>
        <button type="submit" className="rounded-lg bg-ink-900 px-4 py-2 text-[13px] font-semibold text-white">تصفية</button>
        <Link href="/admin/properties" className="rounded-lg border border-sand-200 px-4 py-2 text-[13px] font-semibold text-ink-700">مسح</Link>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-[var(--radius-xl2)] border border-dashed border-sand-200 bg-white p-12 text-center">
          <p className="font-bold text-ink-900">لا توجد عقارات مطابقة</p>
          <Link href="/admin/properties/new" className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-[13px] font-bold text-white">
            إضافة عقار جديد
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-xl2)] border border-sand-200 bg-white shadow-soft">
          <table className="w-full min-w-[820px] text-right text-[12.5px]">
            <thead className="bg-sand-50 text-[11px] uppercase text-ink-500">
              <tr>
                <th className="px-3 py-2.5 font-semibold">العقار</th>
                <th className="px-3 py-2.5 font-semibold">المرجع</th>
                <th className="px-3 py-2.5 font-semibold">التصنيف</th>
                <th className="px-3 py-2.5 font-semibold">السعر</th>
                <th className="px-3 py-2.5 font-semibold">الحالة</th>
                <th className="px-3 py-2.5 font-semibold">المالك</th>
                <th className="px-3 py-2.5 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-sand-50">
                  <td className="px-3 py-3">
                    <Link href={`/admin/properties/${r.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{r.title}</Link>
                    <span className="block text-[11px] text-ink-300">{[r.neighborhood, r.city].filter(Boolean).join(" — ") || "—"}</span>
                    {r.is_demo && <span className="mt-1 inline-block rounded bg-gold-300/30 px-1.5 py-0.5 text-[10px] font-bold text-gold-600">بيانات تجريبية</span>}
                  </td>
                  <td className="px-3 py-3 text-ink-500 tnum">{r.reference_number}</td>
                  <td className="px-3 py-3 text-ink-700">{categoryLabel(r.main_category)}</td>
                  <td className="px-3 py-3 text-ink-900 tnum">{formatPrice(r)}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      r.status === "available" ? "bg-brand-50 text-brand-700" : "bg-sand-100 text-ink-500"
                    }`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-ink-300 text-[11px]" dir="ltr">{r.owner_phone || "—"}</td>
                  <td className="px-3 py-3">
                    <Link href={`/admin/properties/${r.id}`} className="font-semibold text-brand-700 hover:underline">تعديل</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
