import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/db";
import { SITE_URL, OFFICE_NAME } from "@/lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const name = s.office_name || OFFICE_NAME;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${name} | عقارات للبيع والإيجار وإدارة الأملاك`,
      template: `%s | ${name}`,
    },
    description:
      s.tagline ||
      "منصة عقارية لعرض العقارات للبيع والإيجار وإدارة الأملاك في المملكة العربية السعودية.",
    applicationName: name,
    openGraph: {
      type: "website",
      locale: "ar_SA",
      siteName: name,
      title: name,
      description: "عقارات للبيع والإيجار وإدارة الأملاك",
    },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const brand = s.brand_color || "#0f6b52";
  const accent = s.accent_color || "#c9a227";
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="theme-color" content={brand} />
        <style>{`:root{--brand:${brand};--accent:${accent};}`}</style>
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          تخطَّ إلى المحتوى
        </a>
        {children}
      </body>
    </html>
  );
}
