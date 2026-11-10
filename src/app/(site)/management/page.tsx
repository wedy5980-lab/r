import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCategoryPage } from "@/components/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "إدارة الأملاك",
  description: "خدمات إدارة الأملاك: تأجير الوحدات، تحصيل الإيجارات، والصيانة الدورية.",
  alternates: { canonical: "/management" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const node = await buildCategoryPage("management", searchParams);
  if (!node) notFound();
  return node;
}
