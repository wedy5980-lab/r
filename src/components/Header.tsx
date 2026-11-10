"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MAIN_CATEGORIES } from "@/lib/taxonomy";

const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/sale", label: "البيع" },
  { href: "/rent", label: "الإيجار" },
  { href: "/management", label: "إدارة الأملاك" },
  { href: "/auctions", label: "المزادات" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function Header({ officeName }: { officeName: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the sheet on route change
  useEffect(() => setOpen(false), [pathname]);

  // lock scroll while the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass hairline shadow-soft" : "bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="container-x flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={officeName}>
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-soft"
            style={{ background: "linear-gradient(145deg,var(--brand),var(--brand-deep,#0b5541))" }}
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.8V21h14V9.8" />
              <path d="M9.5 21v-6h5v6" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold text-ink-900">مكتب معاذ الضحيان</span>
            <span className="block text-[11px] font-medium tracking-wide text-ink-500">للعقارات</span>
          </span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`relative rounded-lg px-3 py-2 text-[14px] font-semibold transition-colors ${
                isActive(item.href)
                  ? "text-brand-700"
                  : "text-ink-700 hover:bg-sand-100 hover:text-brand-700"
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-500" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-[13px] font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 sm:flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            بحث
          </Link>
          <Link
            href="/search"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-lift"
          >
            تصفّح العقارات
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-sand-200 text-ink-700 lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        id="mobile-nav"
        className={`fixed inset-x-0 top-[68px] z-40 origin-top overflow-y-auto bg-white pb-8 shadow-lift transition-all duration-300 lg:hidden ${
          open ? "visible max-h-[calc(100dvh-68px)] opacity-100" : "invisible max-h-0 opacity-0"
        }`}
      >
        <nav aria-label="التنقل للجوال" className="container-x flex flex-col gap-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors ${
                isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-sand-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-sand-200 pt-3">
            <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-300">التصنيفات</p>
            <div className="grid grid-cols-2 gap-2 px-4">
              {MAIN_CATEGORIES.flatMap((c) => c.subs.slice(0, 2).map((s) => ({ ...s, main: c }))).map((s) => (
                <Link
                  key={`${s.main.key}-${s.key}`}
                  href={`/${s.main.slug}?sub=${s.key}`}
                  className="rounded-lg border border-sand-200 px-3 py-2 text-[12.5px] text-ink-700 hover:border-brand-300 hover:text-brand-700"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
