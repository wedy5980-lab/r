import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCategoryPage } from "@/components/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الإيجار",
  description: "عقارات للإيجار — شقق، فلل، محلات ووحدات تجارية بأسعار إيجار واضحة.",
  alternates: { canonical: "/rent" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const node = await buildCategoryPage("rent", searchParams);
  if (!node) notFound();
  return node;
}
