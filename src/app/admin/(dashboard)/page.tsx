import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { STATUS_LABELS, categoryLabel } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

async function counts() {
  const keys = ["sale", "rent", "management", "auction"] as const;
  const statuses = ["available", "sold", "rented", "archived", "unavailable"] as const;

  const [{ count: total }, ...rest] = await Promise.all([
    db().from("mp_properties").select("id", { count: "exact", head: true }),
    ...keys.map((k) =>
      db().from("mp_properties").select("id", { count: "exact", head: true }).eq("main_category", k)
    ),
  ]);

  const catCounts: Record<string, number> = {};
  keys.forEach((k, i) => (catCounts[k] = (rest[i] as { count: number | null }).count ?? 0));

  const statusRes = await Promise.all(
    statuses.map((s) =>
      db().from("mp_properties").select("id", { count: "exact", head: true }).eq("status", s)
    )
  );
  const statusCounts: Record<string, number> = {};
  statuses.forEach((s, i) => (statusCounts[s] = statusRes[i].count ?? 0));

  const { count: newInquiries } = await db()
    .from("mp_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  const { count: views } = await db().from("mp_properties").select("views_count.sum()").then((r) => ({
    count: 0,
    data: r.data,
  }));

  return { total: total ?? 0, catCounts, statusCounts, newInquiries: newInquiries ?? 0, views };
}

export default async function AdminOverview() {
  const [c, session] = await Promise.all([counts(), getSession()]);

  const { data: recent } = await db()
    .from("mp_properties")
    .select("id,title,reference_number,status,main_category,updated_at,is_demo")
    .order("updated_at", { ascending: false })
    .limit(6);

  const { data: auditRows } = await db()
    .from("mp_audit_logs")
    .select("id,action,entity,entity_id,created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  const demoCount = (recent ?? []).filter((r) => r.is_demo).length;

  const cards = [
    { label: "إجمالي العقارات", value: c.total, tone: "brand" },
    { label: "عقارات البيع", value: c.catCounts.sale, tone: "ink" },
    { label: "عقارات الإيجار", value: c.catCounts.rent, tone: "ink" },
    { label: "إدارة الأملاك", value: c.catCounts.management, tone: "ink" },
  ] as const;

  const statusCards = [
    { label: STATUS_LABELS.available, value: c.statusCounts.available, cls: "bg-brand-50 text-brand-700" },
    { label: STATUS_LABELS.sold, value: c.statusCounts.sold, cls: "bg-sand-100 text-ink-700" },
    { label: STATUS_LABELS.rented, value: c.statusCounts.rented, cls: "bg-gold-300/25 text-gold-600" },
    { label: STATUS_LABELS.unavailable, value: c.statusCounts.unavailable, cls: "bg-sand-100 text-ink-500" },
    { label: STATUS_LABELS.archived, value: c.statusCounts.archived, cls: "bg-sand-200 text-ink-500" },
  ];

  const totalForBars = Math.max(c.total, 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">مرحبًا، {session?.name}</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          كل الأرقام أدناه محسوبة مباشرة من قاعدة البيانات — لا بيانات تقديرية.
        </p>
      </div>

      {c.newInquiries > 0 && (
        <Link
          href="/admin/inquiries"
          className="flex items-center justify-between rounded-xl border border-gold-400/50 bg-gold-300/15 px-4 py-3 text-[13px] font-semibold text-ink-900 hover:bg-gold-300/25"
        >
          <span>لديك <span className="tnum font-extrabold">{c.newInquiries}</span> استفسار جديد بانتظار المتابعة</span>
          <span aria-hidden="true">←</span>
        </Link>
      )}

      <section aria-label="إحصاءات العقارات" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-4 shadow-soft">
            <p className="text-[12px] font-semibold text-ink-500">{card.label}</p>
            <p className={`mt-1.5 font-[family-name:var(--font-display)] text-3xl font-extrabold tnum ${card.tone === "brand" ? "text-brand-700" : "text-ink-900"}`}>
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
          <h2 className="text-[14px] font-bold text-ink-900">توزيع الحالات</h2>
          <ul className="mt-4 space-y-3">
            {statusCards.map((s) => (
              <li key={s.label}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="font-semibold text-ink-700">{s.label}</span>
                  <span className="font-bold text-ink-900 tnum">{s.value}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${Math.round((s.value / totalForBars) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
          <h2 className="text-[14px] font-bold text-ink-900">آخر النشاطات</h2>
          <ul className="mt-3 divide-y divide-sand-100 text-[12.5px]">
            {(auditRows ?? []).length === 0 && <li className="py-3 text-ink-300">لا نشاط مسجل بعد.</li>}
            {(auditRows ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2.5">
                <span className="text-ink-700">{ACTION_LABEL[a.action] ?? a.action} · {a.entity}</span>
                <span className="text-[11px] text-ink-300 tnum">
                  {new Date(a.created_at).toLocaleDateString("ar-SA")}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/admin/audit" className="mt-3 inline-block text-[12px] font-semibold text-brand-700 hover:underline">
            عرض السجل الكامل ←
          </Link>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-ink-900">أحدث العقارات المحدّثة</h2>
          <Link href="/admin/properties" className="text-[12px] font-semibold text-brand-700 hover:underline">الكل ←</Link>
        </div>
        {(recent ?? []).length === 0 ? (
          <p className="mt-4 text-[13px] text-ink-500">
            لا عقارات بعد. <Link href="/admin/properties/new" className="font-semibold text-brand-700 hover:underline">أضف أول عقار</Link>.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-right text-[12.5px]">
              <thead>
                <tr className="border-b border-sand-200 text-[11px] uppercase text-ink-500">
                  <th className="py-2 font-semibold">العقار</th>
                  <th className="py-2 font-semibold">المرجع</th>
                  <th className="py-2 font-semibold">التصنيف</th>
                  <th className="py-2 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {recent!.map((r) => (
                  <tr key={r.id} className="hover:bg-sand-50">
                    <td className="py-2.5">
                      <Link href={`/admin/properties/${r.id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                        {r.title}
                      </Link>
                      {r.is_demo && <span className="ms-2 rounded bg-gold-300/30 px-1.5 py-0.5 text-[10px] font-bold text-gold-600">تجريبي</span>}
                    </td>
                    <td className="py-2.5 text-ink-500 tnum">{r.reference_number}</td>
                    <td className="py-2.5 text-ink-700">{categoryLabel(r.main_category)}</td>
                    <td className="py-2.5">
                      <span className="rounded-md bg-sand-100 px-2 py-0.5 text-[11px] font-semibold text-ink-700">
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {demoCount > 0 && (
        <p className="rounded-xl border border-gold-400/40 bg-gold-300/10 px-4 py-3 text-[12px] leading-relaxed text-ink-700">
          <strong className="font-bold">تنبيه:</strong> توجد عقارات ببيانات تجريبية لعرض المنصة.
          استبدلها أو احذفها قبل الإطلاق التجاري من صفحة العقارات.
        </p>
      )}
    </div>
  );
}

const ACTION_LABEL: Record<string, string> = {
  login: "تسجيل دخول", logout: "خروج", create: "إنشاء", update: "تحديث",
  delete: "حذف", archive: "أرشفة", status_change: "تغيير حالة",
  media_add: "إضافة وسائط", media_delete: "حذف وسيط", media_reorder: "ترتيب وسائط",
  inquiry_status: "تحديث استفسار",
};
