import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Property, Media } from "@/lib/db";
import { getSession, atLeast } from "@/lib/auth";
import PropertyForm from "@/components/admin/PropertyForm";
import MediaManager from "@/components/admin/MediaManager";
import DangerZone from "@/components/admin/DangerZone";

export const dynamic = "force-dynamic";
export const metadata = { title: "تعديل عقار" };

export default async function EditPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, sp, session] = await Promise.all([params, searchParams, getSession()]);

  const { data: property } = await db().from("mp_properties").select("*").eq("id", id).maybeSingle();
  if (!property) notFound();

  const { data: media } = await db()
    .from("mp_property_media")
    .select("*")
    .eq("property_id", id)
    .order("display_order", { ascending: true });

  const p = property as Property;
  const canDelete = session ? atLeast(session.role, "manager") : false;
  const hasOwner = !!p.owner_phone;

  return (
    <div className="space-y-5">
      <nav aria-label="مسار التنقل" className="text-[12.5px] text-ink-500">
        <Link href="/admin/properties" className="hover:text-brand-700">العقارات</Link>
        <span className="mx-2 text-ink-300">/</span>
        <span className="text-ink-900">تعديل</span>
      </nav>

      {sp.created && (
        <p className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-[12.5px] text-brand-700">
          تم إنشاء العقار بنجاح. أضف الصور أدناه لإكمال العرض.
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">{p.title}</h1>
          <p className="mt-1 text-[12.5px] text-ink-500">
            المرجع <span className="font-semibold text-ink-700 tnum">{p.reference_number}</span>
            {" · "}آخر تحديث {new Date(p.updated_at).toLocaleString("ar-SA")}
          </p>
        </div>
        {p.status === "available" && (
          <Link href={`/property/${p.reference_number}`} target="_blank" className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-[12.5px] font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700">
            عرض الصفحة العامة ↗
          </Link>
        )}
      </div>

      {p.is_demo && (
        <p className="rounded-xl border border-gold-400/40 bg-gold-300/10 px-4 py-2.5 text-[12px] leading-relaxed text-ink-700">
          <strong className="font-bold">عقار ببيانات تجريبية.</strong> الصور أمثلة معمارية توضيحية وليست لعقار يملكه المكتب.
          استبدل البيانات والصور قبل الإطلاق التجاري.
        </p>
      )}

      <PropertyForm property={p} />

      <section className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
        <h2 className="text-[13px] font-bold text-ink-900">الصور والفيديو</h2>
        <p className="mt-1 text-[11.5px] text-ink-500">
          ارفع الملفات مباشرة (تُحفظ في تخزين دائم)، أو أضف رابطًا. رتّب الصور بترتيب ظهورها في المعرض.
        </p>
        <div className="mt-4">
          <MediaManager propertyId={p.id} initialMedia={(media ?? []) as Media[]} />
        </div>
      </section>

      {hasOwner && (
        <section className="rounded-[var(--radius-xl2)] border border-sand-200 bg-sand-50 p-5">
          <h2 className="text-[13px] font-bold text-ink-900">بيانات المالك (سرّية)</h2>
          <p className="mt-1.5 text-[12.5px] text-ink-700">
            {p.owner_name || "بدون اسم"} — <span dir="ltr" className="tnum">{p.owner_phone}</span>
          </p>
          <p className="mt-1 text-[11.5px] text-ink-500">لا تُعرض هذه البيانات للجمهور إلا إذا فُعّل الخيار في إعدادات المكتب.</p>
        </section>
      )}

      <DangerZone id={p.id} canDelete={canDelete} status={p.status} />
    </div>
  );
}
