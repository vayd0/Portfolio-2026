import { sanity } from "@/lib/sanity";
import { slugify } from "@/lib/slugify";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjetDetailClient from "@/components/ProjetDetailClient";

export const revalidate = 60;

type Project = {
  _id: string;
  title: string;
  image?: string;
  gallery?: string[];
  description?: string;
  projectUrl?: string;
  github?: string;
};

const query = `*[_type == "project"] | order(_createdAt asc) {
  _id,
  title,
  "image": mainImage.asset->url,
  "gallery": gallery[].asset->url,
  description,
  projectUrl,
  "github": repoUrl
}`;

async function getProjects() {
  return sanity.fetch<Project[]>(query);
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: slugify(p.title) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => slugify(p.title) === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projets/${slug}` },
    openGraph: {
      title: `${project.title} — Théo Heck`,
      description: project.description,
      url: `https://www.theoheck.fr/projets/${slug}`,
      locale: "fr_FR",
      images: project.image ? [{ url: project.image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Théo Heck`,
      description: project.description,
      images: project.image ? [project.image] : [],
    },
  };
}

export default async function ProjetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getProjects();
  const index = projects.findIndex((p) => slugify(p.title) === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const palette = (index % 3) as 0 | 1 | 2;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `https://www.theoheck.fr/projets/${slug}`,
    author: { "@type": "Person", name: "Théo Heck", url: "https://www.theoheck.fr" },
    ...(project.image ? { image: project.image } : {}),
  };

  const safeJsonLd = JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .split(" ").join("\\u2028")
    .split(" ").join("\\u2029");

  return (
    <main style={{ height: "100%", overflow: "hidden" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd }} />
      <ProjetDetailClient project={project} palette={palette} />
    </main>
  );
}
