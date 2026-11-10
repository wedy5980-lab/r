"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";

const initial: InquiryState = { ok: false, message: "" };

export default function InquiryForm({ propertyRef }: { propertyRef?: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);

  if (state.ok) {
    return (
      <div className="rounded-[var(--radius-xl2)] border border-brand-200 bg-brand-50 p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        </div>
        <p className="mt-4 font-bold text-ink-900">{state.message}</p>
      </div>
    );
  }

  const err = (k: string) => state.errors?.[k];

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="property_id" value="" />
      {propertyRef && (
        <p className="rounded-xl bg-sand-100 px-4 py-2.5 text-[12.5px] text-ink-700">
          استفسار بخصوص العقار رقم <span className="font-bold tnum">{propertyRef}</span>
        </p>
      )}

      {/* honeypot — hidden from users and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">الموقع</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="الاسم" htmlFor="name" error={err("name")} required>
          <input id="name" name="name" required maxLength={100} autoComplete="name" className={cls(err("name"))} placeholder="الاسم الكامل" />
        </Field>
        <Field label="رقم الجوال" htmlFor="phone" error={err("phone")} required>
          <input id="phone" name="phone" required maxLength={20} inputMode="tel" dir="ltr" autoComplete="tel" className={cls(err("phone"))} placeholder="05XXXXXXXX" />
        </Field>
      </div>

      <Field label="البريد الإلكتروني (اختياري)" htmlFor="email" error={err("email")}>
        <input id="email" name="email" type="email" maxLength={160} dir="ltr" autoComplete="email" className={cls(err("email"))} placeholder="name@example.com" />
      </Field>

      <Field label="رسالتك" htmlFor="message" error={err("message")}>
        <textarea id="message" name="message" rows={4} maxLength={2000} className={cls(err("message"))} placeholder="اكتب تفاصيل استفسارك…" />
      </Field>

      {state.message && !state.ok && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 px-5 py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "جارٍ الإرسال…" : "إرسال الاستفسار"}
      </button>
      <p className="text-center text-[11.5px] leading-relaxed text-ink-500">
        بإرسالك النموذج فإنك توافق على معالجة بياناتك للتواصل بشأن استفسارك فقط.
      </p>
    </form>
  );
}

const cls = (error?: string) =>
  `mt-1 w-full rounded-xl border bg-sand-50/60 px-3 py-2.5 text-[13.5px] outline-none transition-colors focus:bg-white ${
    error ? "border-red-300 focus:border-red-400" : "border-sand-200 focus:border-brand-400"
  }`;

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
