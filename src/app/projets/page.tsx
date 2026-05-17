import { sanity } from "@/lib/sanity";
import ProjetsClient from "@/components/ProjetsClient";

export const revalidate = 60;

type Project = {
  _id: string;
  title: string;
  image?: string;
  gallery?: string[];
  description?: string;
  projectUrl?: string;
  github?: string;
  color?: string;
};

const query = `*[_type == "project"] | order(_createdAt asc) {
  _id,
  title,
  "image": mainImage.asset->url,
  "gallery": gallery[].asset->url,
  description,
  projectUrl,
  "github": repoUrl,
  color
}`;

export default async function ProjetsPage() {
  const projects = await sanity.fetch<Project[]>(query);

  return (
    <main className="min-h-screen">
      <ProjetsClient projects={projects} />
    </main>
  );
}
