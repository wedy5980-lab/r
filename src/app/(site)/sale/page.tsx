import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCategoryPage } from "@/components/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "البيع",
  description: "عقارات للبيع في المملكة العربية السعودية — فلل، أراضٍ، شقق، عمارات ومحلات.",
  alternates: { canonical: "/sale" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const node = await buildCategoryPage("sale", searchParams);
  if (!node) notFound();
  return node;
}
