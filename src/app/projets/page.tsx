import { sanity } from "@/lib/sanity";
import { slugify } from "@/lib/slugify";
import Card from "@/components/Card";
import FallIn from "@/components/FallIn";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projets",
  description: "Découvrez les projets créatifs de Théo Heck : design interactif, développement web et expériences digitales.",
  alternates: { canonical: "/projets" },
  openGraph: {
    title: "Projets — Théo Heck",
    description: "Découvrez les projets créatifs de Théo Heck : design interactif, développement web et expériences digitales.",
    url: "https://www.theoheck.fr/projets",
    locale: "fr_FR",
  },
};

type Project = {
  _id: string;
  title: string;
  image?: string;
  color?: string;
};

const query = `*[_type == "project"] | order(_createdAt asc) {
  _id,
  title,
  "image": mainImage.asset->url,
  color
}`;

export default async function ProjetsPage() {
  const projects = await sanity.fetch<Project[]>(query);

  return (
    <main className="h-full flex items-center" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.18) 0.85px, transparent 0.85px)", backgroundSize: "22px 22px" }}>
      <div className="flex flex-wrap justify-center gap-6 md:gap-12 px-4 md:px-16 py-24 md:py-12 w-full">
        {projects.map((project, i) => (
          <div key={project._id} className="w-[82vw] md:w-[30vw] md:max-w-[440px] shrink-0">
            <FallIn delay={i * 0.05}>
              <Link href={`/projets/${slugify(project.title)}`} style={{ textDecoration: "none" }}>
                <Card title={project.title} image={project.image} color={project.color} index={i} />
              </Link>
            </FallIn>
          </div>
        ))}
      </div>
    </main>
  );
}
