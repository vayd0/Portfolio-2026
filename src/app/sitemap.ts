import type { MetadataRoute } from "next";
import { sanity } from "@/lib/sanity";
import { slugify } from "@/lib/slugify";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await sanity.fetch<{ title: string }[]>(
    `*[_type == "project"] | order(_createdAt asc) { title }`
  );

  const projectUrls: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `https://www.theoheck.fr/projets/${slugify(p.title)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: "https://www.theoheck.fr", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://www.theoheck.fr/projets", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    ...projectUrls,
  ];
}
