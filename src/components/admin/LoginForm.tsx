"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/actions/admin";

const initial: ActionState = { ok: false, message: "" };

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-[12px] font-semibold text-ink-700">البريد الإلكتروني</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          dir="ltr"
          className="mt-1 w-full rounded-xl border border-sand-200 bg-sand-50/60 px-3 py-2.5 text-[13.5px] outline-none focus:border-brand-400 focus:bg-white"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-[12px] font-semibold text-ink-700">كلمة المرور</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          dir="ltr"
          className="mt-1 w-full rounded-xl border border-sand-200 bg-sand-50/60 px-3 py-2.5 text-[13.5px] outline-none focus:border-brand-400 focus:bg-white"
        />
      </div>

      {state.message && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "جارٍ الدخول…" : "تسجيل الدخول"}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-ink-500">
        الجلسة تنتهي تلقائيًا بعد ٨ ساعات. تُسجَّل محاولات الدخول لأغراض الأمان.
      </p>
    </form>
  );
}
