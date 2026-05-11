import { sanity } from "@/lib/sanity";
import { slugify } from "@/lib/slugify";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

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
  github
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
  const project = projects.find((p) => slugify(p.title) === slug);
  if (!project) notFound();

  return (
    <main style={{
      minHeight: "100vh",
      padding: "clamp(32px, 6vw, 100px) clamp(24px, 6vw, 80px)",
      fontFamily: "Dudu, sans-serif",
      backgroundColor: "#ffffff",
      backgroundImage: "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
      backgroundSize: "120px 120px",
    }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "clamp(32px, 6vh, 72px)", fontSize: "1rem", color: "#000", textDecoration: "none", fontFamily: "Dudu, sans-serif" }}>
        ← Retour
      </Link>

      <h1 style={{ fontSize: "clamp(3rem, 8vw, 9rem)", lineHeight: 0.9, margin: "0 0 clamp(32px, 5vh, 64px)", fontWeight: 700 }}>
        {project.title}
      </h1>

      {project.image && (
        <div style={{ width: "100%", maxWidth: 900, aspectRatio: "16/9", position: "relative", marginBottom: "clamp(32px, 5vh, 64px)", borderRadius: 12, overflow: "hidden" }}>
          <img
            src={`/api/img?url=${encodeURIComponent(project.image)}`}
            alt={project.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      {project.description && (
        <p style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.5rem)", lineHeight: 1.6, maxWidth: 640, marginBottom: "clamp(32px, 5vh, 64px)", color: "#111" }}>
          {project.description}
        </p>
      )}

      {project.gallery && project.gallery.length > 0 && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: "clamp(32px, 5vh, 64px)" }}>
          {project.gallery.map((src, i) => (
            <div key={i} style={{ flex: "1 1 260px", maxWidth: 420, aspectRatio: "16/9", borderRadius: 8, overflow: "hidden" }}>
              <img
                src={`/api/img?url=${encodeURIComponent(src)}`}
                alt={`${project.title} ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", padding: "12px 28px", background: "linear-gradient(225deg, #92FF33, #E2FF55)", color: "#000", textDecoration: "none", borderRadius: 100, fontSize: "1rem", fontFamily: "Dudu, sans-serif" }}
          >
            Voir le projet ↗
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "1rem", color: "#000", textDecoration: "underline", fontFamily: "Dudu, sans-serif" }}
          >
            GitHub ↗
          </a>
        )}
      </div>
    </main>
  );
}
