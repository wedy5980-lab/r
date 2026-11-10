import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCategoryPage } from "@/components/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المزادات",
  description: "المزادات العقارية المعلنة من المكتب. لا توجد مزادات حالياً.",
  alternates: { canonical: "/auctions" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const node = await buildCategoryPage("auctions", searchParams);
  if (!node) notFound();
  return node;
}
