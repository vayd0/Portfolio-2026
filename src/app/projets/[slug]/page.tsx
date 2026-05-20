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
    title: `${project.title} — Théo Heck`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Théo Heck`,
      description: project.description,
      images: project.image ? [{ url: project.image }] : [],
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

  return (
    <main style={{ height: "100%", overflow: "hidden" }}>
      <ProjetDetailClient project={project} palette={palette} />
    </main>
  );
}
