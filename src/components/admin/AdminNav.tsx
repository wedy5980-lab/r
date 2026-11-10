"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "نظرة عامة", icon: "M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-4H4v4Zm10-13h6V4h-6v3Z" },
  { href: "/admin/properties", label: "العقارات", icon: "M3 10.5 12 3l9 7.5M5 9.8V21h14V9.8" },
  { href: "/admin/properties/new", label: "إضافة عقار", icon: "M12 5v14M5 12h14" },
  { href: "/admin/inquiries", label: "الاستفسارات", icon: "M4 5h16v12H8l-4 4V5Z" },
  { href: "/admin/settings", label: "بيانات المكتب", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3-2 .5-.6 1.5 1.1 1.7-1.7 1.7-1.7-1.1-1.5.6-.5 2h-2.2l-.5-2-1.5-.6-1.7 1.1L5.9 15l1.1-1.7-.6-1.5-2-.5v-2.2l2-.5.6-1.5L5.9 5.4 7.6 3.7l1.7 1.1 1.5-.6.5-2h2.2l.5 2 1.5.6 1.7-1.1 1.7 1.7-1.1 1.7.6 1.5 2 .5V12Z" },
  { href: "/admin/audit", label: "سجل النشاط", icon: "M4 5h16M4 12h16M4 19h10" },
];

export default function AdminNav({ role, canManage }: { role: string; canManage: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="تنقل لوحة الإدارة" className="lg:w-60 lg:shrink-0">
      <ul className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {ITEMS.map((i) => {
          const isNewBtn = i.href === "/admin/properties/new";
          const active = pathname === i.href || (i.href !== "/admin" && pathname.startsWith(i.href) && !isNewBtn);
          if (i.href === "/admin/settings" && !canManage) return null;
          return (
            <li key={i.href} className="shrink-0 lg:w-full">
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                  isNewBtn
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : active
                      ? "bg-white text-brand-700 shadow-soft"
                      : "text-ink-700 hover:bg-white/70"
                }`}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={i.icon} />
                </svg>
                <span className="whitespace-nowrap">{i.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
