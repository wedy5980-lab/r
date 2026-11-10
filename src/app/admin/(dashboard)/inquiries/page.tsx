import Link from "next/link";
import { db } from "@/lib/db";
import { updateInquiryAction } from "@/app/actions/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "الاستفسارات" };

const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "جديد", cls: "bg-gold-300/30 text-gold-600" },
  contacted: { label: "تم التواصل", cls: "bg-brand-50 text-brand-700" },
  closed: { label: "مغلق", cls: "bg-sand-100 text-ink-500" },
  spam: { label: "مزعج", cls: "bg-red-50 text-red-600" },
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;

  let q = db().from("mp_inquiries").select("*,mp_properties(reference_number,title)", { count: "exact" });
  if (sp.status) q = q.eq("status", sp.status);
  const { data, count } = await q.order("created_at", { ascending: false }).limit(100);

  const rows = (data ?? []) as (Record<string, unknown> & {
    id: string; name: string; phone: string; email: string | null; message: string | null;
    status: string; created_at: string;
    mp_properties: { reference_number: string; title: string } | null;
  })[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">الاستفسارات</h1>
        <p className="mt-0.5 text-[12.5px] text-ink-500"><span className="tnum">{count ?? 0}</span> استفسار وارد من الموقع</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[["", "الكل"], ["new", "جديد"], ["contacted", "تم التواصل"], ["closed", "مغلق"], ["spam", "مزعج"]].map(([v, l]) => (
          <Link
            key={l}
            href={v ? `/admin/inquiries?status=${v}` : "/admin/inquiries"}
            className={`rounded-lg px-3.5 py-2 text-[12.5px] font-semibold ${
              (sp.status ?? "") === v ? "bg-brand-600 text-white" : "border border-sand-200 bg-white text-ink-700 hover:border-brand-300"
            }`}
          >
            {l}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[var(--radius-xl2)] border border-dashed border-sand-200 bg-white p-12 text-center">
          <p className="font-bold text-ink-900">لا توجد استفسارات</p>
          <p className="mt-2 text-[13px] text-ink-500">ستظهر هنا كل الاستفسارات المرسلة من صفحة التواصل.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const s = STATUS[r.status] ?? STATUS.new;
            return (
              <li key={r.id} className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-4 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[13.5px] font-bold text-ink-900">
                      {r.name}
                      <span className="ms-2 text-[12px] font-normal text-ink-500" dir="ltr">{r.phone}</span>
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-300">
                      {new Date(r.created_at).toLocaleString("ar-SA")}
                      {r.email && <> · <span dir="ltr">{r.email}</span></>}
                    </p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>
                </div>

                {r.message && (
                  <p className="mt-2.5 whitespace-pre-line rounded-lg bg-sand-50 px-3 py-2 text-[12.5px] leading-relaxed text-ink-700">
                    {r.message}
                  </p>
                )}

                {r.mp_properties && (
                  <p className="mt-2 text-[11.5px] text-ink-500">
                    بخصوص: <span className="font-semibold text-ink-700">{r.mp_properties.title}</span>
                    <span className="ms-1 tnum">({r.mp_properties.reference_number})</span>
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-sand-100 pt-2.5">
                  <a href={`tel:${r.phone}`} className="rounded-lg bg-brand-50 px-3 py-1.5 text-[11.5px] font-semibold text-brand-700 hover:bg-brand-100">اتصال</a>
                  <a
                    href={`https://wa.me/${r.phone.replace(/[^0-9]/g, "").replace(/^0/, "966")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-[#25D366]/10 px-3 py-1.5 text-[11.5px] font-semibold text-[#128C7E] hover:bg-[#25D366]/20"
                  >
                    واتساب
                  </a>
                  {(["contacted", "closed", "spam"] as const).map((st) => (
                    <form key={st} action={updateInquiryAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={st} />
                      <button type="submit" className="rounded-lg border border-sand-200 px-3 py-1.5 text-[11.5px] font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700">
                        {STATUS[st].label}
                      </button>
                    </form>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
