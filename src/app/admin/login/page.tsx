import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "دخول الإدارة",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const s = await getSession();
  if (s) redirect("/admin");

  return (
    <div className="grid min-h-dvh place-items-center bg-ink-900 px-4 py-12" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <span
            className="mx-auto grid h-12 w-12 place-items-center rounded-xl text-white"
            style={{ background: "linear-gradient(145deg,#0f6b52,#0b5541)" }}
            aria-hidden="true"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.8V21h14V9.8" /><path d="M9.5 21v-6h5v6" />
            </svg>
          </span>
          <h1 className="mt-4 text-lg font-extrabold text-white">لوحة إدارة المكتب</h1>
          <p className="mt-1 text-[12.5px] text-white/50">الدخول مخصص للموظفين المصرّح لهم فقط</p>
        </div>

        <div className="rounded-[var(--radius-xl2)] bg-white p-6 shadow-lift">
          <LoginForm />
        </div>

        <p className="mt-5 text-center text-[12px] text-white/40">
          <Link href="/" className="hover:text-white/70">← العودة إلى الموقع</Link>
        </p>
      </div>
    </div>
  );
}
