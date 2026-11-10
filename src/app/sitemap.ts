import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { MAIN_CATEGORIES } from "@/lib/taxonomy";
import { listProperties } from "@/lib/properties";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.8 },
    ...MAIN_CATEGORIES.map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const all = await listProperties({ perPage: 48, sort: "newest" });
    const pages = all.totalPages > 1 ? all.totalPages : 1;
    const lists = [all];
    for (let p = 2; p <= Math.min(pages, 10); p++) {
      lists.push(await listProperties({ perPage: 48, sort: "newest", page: p }));
    }
    const props = lists.flatMap((l) => l.items);
    return [
      ...staticRoutes,
      ...props.map((p) => ({
        url: `${SITE_URL}/property/${p.reference_number}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
