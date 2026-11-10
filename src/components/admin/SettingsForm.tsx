"use client";

import { useActionState } from "react";
import type { OfficeSettings } from "@/lib/db";
import { saveSettingsAction, type ActionState } from "@/app/actions/admin";

const initial: ActionState = { ok: false, message: "" };

export default function SettingsForm({ settings }: { settings: OfficeSettings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, initial);
  return (
    <form action={action} className="space-y-5">
      <fieldset className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
        <legend className="px-1 text-[13px] font-bold text-ink-900">هوية المكتب</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <L>اسم المكتب</L>
            <input name="office_name" required defaultValue={settings.office_name} className={cls()} />
          </div>
          <div className="sm:col-span-2">
            <L>العبارة الترحيبية</L>
            <input name="tagline" defaultValue={settings.tagline ?? ""} className={cls()} placeholder="حياكم الله في مكتب معاذ الضحيان للعقارات" />
          </div>
          <div className="sm:col-span-2">
            <L>نبذة عن المكتب</L>
            <textarea name="about_text" rows={4} defaultValue={settings.about_text ?? ""} className={cls()} />
          </div>
          <div>
            <L>اللون الأساسي</L>
            <input name="brand_color" type="color" defaultValue={settings.brand_color ?? "#0f6b52"} className="mt-1 h-11 w-full rounded-xl border border-sand-200 bg-white px-1" />
          </div>
          <div>
            <L>اللون المميز</L>
            <input name="accent_color" type="color" defaultValue={settings.accent_color ?? "#c9a227"} className="mt-1 h-11 w-full rounded-xl border border-sand-200 bg-white px-1" />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
        <legend className="px-1 text-[13px] font-bold text-ink-900">بيانات التواصل العامة</legend>
        <p className="mt-2 text-[11.5px] text-ink-500">
          لا تُدخل بيانات غير مؤكدة — ستظهر مباشرة للجمهور على الموقع.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div><L>رقم الهاتف</L><input name="phone" dir="ltr" defaultValue={settings.phone ?? ""} className={cls()} placeholder="011 000 0000" /></div>
          <div><L>رقم واتساب (دولي)</L><input name="whatsapp" dir="ltr" defaultValue={settings.whatsapp ?? ""} className={cls()} placeholder="9665XXXXXXXX" /></div>
          <div><L>البريد الإلكتروني</L><input name="email" type="email" dir="ltr" defaultValue={settings.email ?? ""} className={cls()} /></div>
          <div><L>ساعات العمل</L><input name="working_hours" defaultValue={settings.working_hours ?? ""} className={cls()} placeholder="الأحد – الخميس، ٩ ص – ٥ م" /></div>
          <div className="sm:col-span-2"><L>العنوان</L><input name="address" defaultValue={settings.address ?? ""} className={cls()} /></div>
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-xl2)] border border-sand-200 bg-white p-5 shadow-soft">
        <legend className="px-1 text-[13px] font-bold text-ink-900">خصوصية المالك</legend>
        <label className="mt-3 flex items-start gap-2.5">
          <input type="checkbox" name="show_owner_phone" defaultChecked={settings.show_owner_phone} className="mt-0.5 h-4 w-4 rounded border-sand-300 accent-[var(--brand)]" />
          <span className="text-[12.5px] leading-relaxed text-ink-700">
            إظهار رقم جوال المالك على صفحة العقار العامة.
            <span className="block text-[11.5px] text-ink-500">
              الوضع الافتراضي هو الإخفاء حفاظًا على خصوصية الملاك. لا تفعّل هذا الخيار إلا بموافقة صريحة من المالك.
            </span>
          </span>
        </label>
      </fieldset>

      {state.message && (
        <p role="alert" className={`rounded-xl px-4 py-2.5 text-[13px] ${state.ok ? "border border-brand-200 bg-brand-50 text-brand-700" : "border border-red-200 bg-red-50 text-red-700"}`}>
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="rounded-xl bg-brand-600 px-6 py-3 text-[13.5px] font-bold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
      </button>
    </form>
  );
}

const cls = () =>
  "mt-1 w-full rounded-xl border border-sand-200 bg-sand-50/60 px-3 py-2.5 text-[13.5px] outline-none focus:border-brand-400 focus:bg-white";

function L({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-semibold text-ink-700">{children}</label>;
}
