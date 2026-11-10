import type { Metadata } from "next";

/**
 * Admin section metadata only. Route protection lives in the (dashboard)
 * group layout so that /admin/login can render for unauthenticated visitors.
 */
export const metadata: Metadata = {
  title: { default: "لوحة الإدارة", template: "%s | لوحة الإدارة" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
