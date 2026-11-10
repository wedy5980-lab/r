import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, atLeast } from "@/lib/auth";
import { logoutAction } from "@/app/actions/admin";
import AdminNav from "@/components/admin/AdminNav";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "مدير عام",
  manager: "مدير المكتب",
  editor: "محرر",
  viewer: "مطّلع",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-sand-100" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg text-white"
              style={{ background: "linear-gradient(145deg,var(--brand),var(--brand-deep,#0b5541))" }}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.8V21h14V9.8" /><path d="M9.5 21v-6h5v6" />
              </svg>
            </span>
            <div className="leading-tight">
              <p className="text-[13.5px] font-extrabold text-ink-900">لوحة الإدارة</p>
              <p className="text-[11px] text-ink-500">مكتب معاذ الضحيان للعقارات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden rounded-lg border border-sand-200 px-3 py-1.5 text-[12.5px] font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700 sm:block"
            >
              عرض الموقع ↗
            </Link>
            <div className="hidden text-left sm:block">
              <p className="text-[12.5px] font-bold text-ink-900">{session.name}</p>
              <p className="text-[11px] text-ink-500">{ROLE_LABEL[session.role] ?? session.role}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg bg-ink-900 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-ink-700"
              >
                خروج
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 lg:flex-row">
        <AdminNav role={session.role} canManage={atLeast(session.role, "manager")} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
