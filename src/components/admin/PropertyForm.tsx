"use client";

import { useActionState, useState } from "react";
import type { Property } from "@/lib/db";
import { MAIN_CATEGORIES, mainCategory } from "@/lib/taxonomy";
import {
  createPropertyAction,
  updatePropertyAction,
  type ActionState,
} from "@/app/actions/admin";

const initial: ActionState = { ok: false, message: "" };

export default function PropertyForm({ property }: { property?: Property }) {
  const action = property ? updatePropertyAction : createPropertyAction;
  const [state, formAction, pending] = useActionState(action, initial);

  const [cat, setCat] = useState(property?.main_category ?? "sale");
  const subs = mainCategory(cat)?.subs ?? [];
  const err = (k: string) => state.errors?.[k];

  return (
    <form action={formAction} className="space-y-6">
      {property && <input type="hidden" name="id" value={property.id} />}

      <Section title="البيانات الأساسية">
        <div className="sm:col-span-2">
          <Field label="عنوان العقار" htmlFor="title" error={err("title")} required>
            <input id="title" name="title" required maxLength={200} defaultValue={property?.title ?? ""} className={cls(err("title"))} placeholder="مثال: فلة حديثة بحي النرجس" />
          </Field>
        </div>

        <Field label="التصنيف الرئيسي" htmlFor="main_category" error={err("main_category")} required>
          <select
            id="main_category"
            name="main_category"
            defaultValue={property?.main_category ?? "sale"}
            onChange={(e) => setCat(e.target.value)}
            className={cls(err("main_category"))}
          >
            {MAIN_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </Field>

        <Field label="النوع الفرعي" htmlFor="subcategory" error={err("subcategory")}>
          <select id="subcategory" name="subcategory" defaultValue={property?.subcategory ?? ""} className={cls()} disabled={!subs.length}>
            <option value="">{subs.length ? "— بدون تحديد —" : "لا توجد أنواع لهذا التصنيف"}</option>
            {subs.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </Field>

        <Field label="الحالة" htmlFor="status" error={err("status")} required>
          <select id="status" name="status" defaultValue={property?.status ?? "available"} className={cls()}>
            <option value="available">متاح</option>
            <option value="sold">تم البيع</option>
            <option value="rented">مؤجر</option>
            <option value="unavailable">غير متاح</option>
            <option value="archived">مؤرشف</option>
          </select>
        </Field>

        <Field label="رقم المرجع (اختياري)" htmlFor="reference_number" error={err("reference_number")}>
          <input id="reference_number" name="reference_number" dir="ltr" defaultValue={property?.reference_number ?? ""} className={cls()} placeholder="يُولَّد تلقائيًا" disabled={!!property} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="الوصف" htmlFor="description" error={err("description")}>
            <textarea id="description" name="description" rows={5} maxLength={5000} defaultValue={property?.description ?? ""} className={cls()} placeholder="تفاصيل العقار، التشطيب، المرافق، الموقع…" />
          </Field>
        </div>
      </Section>

      <Section title="الموقع">
        <Field label="المدينة" htmlFor="city" error={err("city")}>
          <input id="city" name="city" defaultValue={property?.city ?? ""} className={cls()} placeholder="الرياض" />
        </Field>
        <Field label="الحي" htmlFor="neighborhood" error={err("neighborhood")}>
          <input id="neighborhood" name="neighborhood" defaultValue={property?.neighborhood ?? ""} className={cls()} placeholder="حي النرجس" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="العنوان التفصيلي (اختياري)" htmlFor="address" error={err("address")}>
            <input id="address" name="address" defaultValue={property?.address ?? ""} className={cls()} placeholder="لا يظهر للعامة" />
          </Field>
        </div>
      </Section>

      <Section title="المواصفات والسعر">
        <Field label="المساحة (م²)" htmlFor="area" error={err("area")}>
          <input id="area" name="area" type="number" min="0" step="0.01" defaultValue={property?.area ?? ""} className={cls()} />
        </Field>
        <Field label="عرض الشارع (م)" htmlFor="street_width" error={err("street_width")}>
          <input id="street_width" name="street_width" type="number" min="0" step="0.01" defaultValue={property?.street_width ?? ""} className={cls()} />
        </Field>
        <Field label="السعر (ر.س)" htmlFor="price" error={err("price")}>
          <input id="price" name="price" type="number" min="0" step="1" defaultValue={property?.price ?? ""} className={cls()} />
        </Field>
        <Field label="نوع السعر" htmlFor="price_type" error={err("price_type")}>
          <select id="price_type" name="price_type" defaultValue={property?.price_type ?? "total"} className={cls()}>
            <option value="total">إجمالي</option>
            <option value="per_year">سنوي</option>
            <option value="per_month">شهري</option>
            <option value="per_day">يومي</option>
            <option value="negotiable">قابل للتفاوض</option>
          </select>
        </Field>
        <Field label="غرف النوم" htmlFor="bedrooms" error={err("bedrooms")}>
          <input id="bedrooms" name="bedrooms" type="number" min="0" defaultValue={property?.bedrooms ?? ""} className={cls()} />
        </Field>
        <Field label="دورات المياه" htmlFor="bathrooms" error={err("bathrooms")}>
          <input id="bathrooms" name="bathrooms" type="number" min="0" defaultValue={property?.bathrooms ?? ""} className={cls()} />
        </Field>
        <Field label="عدد الأدوار" htmlFor="floors" error={err("floors")}>
          <input id="floors" name="floors" type="number" min="0" defaultValue={property?.floors ?? ""} className={cls()} />
        </Field>
        <Field label="مدة الإيجار (نص حر)" htmlFor="rental_period" error={err("rental_period")}>
          <input id="rental_period" name="rental_period" defaultValue={property?.rental_period ?? ""} className={cls()} placeholder="سنة / ٦ أشهر…" />
        </Field>
      </Section>

      <Section title="بيانات المالك — سرّية">
        <p className="sm:col-span-2 rounded-lg bg-sand-100 px-3 py-2 text-[11.5px] leading-relaxed text-ink-500">
          هذه الحقول مخفية عن الجمهور دائمًا. لا تظهر إلا في لوحة الإدارة، وفقط إن فعّلت خيار
          «إظهار جوال المالك» في إعدادات المكتب.
        </p>
        <Field label="اسم المالك" htmlFor="owner_name" error={err("owner_name")}>
          <input id="owner_name" name="owner_name" defaultValue={property?.owner_name ?? ""} className={cls()} />
        </Field>
        <Field label="جوال المالك" htmlFor="owner_phone" error={err("owner_phone")}>
          <input id="owner_phone" name="owner_phone" dir="ltr" defaultValue={property?.owner_phone ?? ""} className={cls()} placeholder="05XXXXXXXX" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="ملاحظات داخلية" htmlFor="internal_notes" error={err("internal_notes")}>
            <textarea id="internal_notes" name="internal_notes" rows={3} defaultValue={property?.internal_notes ?? ""} className={cls()} />
          </Field>
        </div>
      </Section>

      <Section title="العرض">
        <label className="flex items-center gap-2.5 text-[13px] font-semibold text-ink-700">
          <input type="checkbox" name="is_featured" defaultChecked={property?.is_featured ?? false} className="h-4 w-4 rounded border-sand-300 accent-[var(--brand)]" />
          عقار مميز (يظهر أولًا في القوائم)
        </label>
      </Section>

      {!property && (
        <Section title="روابط الصور (اختياري)">
          <p className="sm:col-span-2 text-[11.5px] leading-relaxed text-ink-500">
            أضف رابطًا لكل سطر (https فقط أو مسار داخلي يبدأ بـ /). يمكنك رفع الصور وترتيبها بعد الحفظ من صفحة العقار.
          </p>
          <div className="sm:col-span-2">
            <label htmlFor="media_urls" className="block text-[12px] font-semibold text-ink-700">روابط الوسائط</label>
            <textarea id="media_urls" name="media_urls" rows={3} className={cls()} placeholder="https://…/image.jpg" />
          </div>
        </Section>
      )}

      {state.message && (
        <p
          role="alert"
          className={`rounded-xl px-4 py-2.5 text-[13px] ${
            state.ok && !state.errors ? "border border-brand-200 bg-brand-50 text-brand-700" : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="rounded-xl bg-brand-600 px-6 py-3 text-[13.5px] font-bold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending ? "جارٍ الحفظ…" : property ? "حفظ التغييرات" : "إنشاء العقار"}
        </button>
      </div>
    </form>
  );
}

const cls = (error?: string) =>
  `mt-1 w-full rounded-xl border bg-sand-50/60 px-3 py-2.5 text-[13.5px] outline-none transition-colors focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${
    error ? "border-red-300 focus:border-red-400" : "border-sand-200 focus:border-brand-400"
  }`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
      <legend className="px-1 text-[13px] font-bold text-ink-900">{title}</legend>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label, htmlFor, error, required, children,
}: {
  label: string; htmlFor: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[12px] font-semibold text-ink-700">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11.5px] text-red-600">{error}</p>}
    </div>
  );
}
