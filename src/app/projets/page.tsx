import { sanity } from "@/lib/sanity";
import { slugify } from "@/lib/slugify";
import Card from "@/components/Card";
import FallIn from "@/components/FallIn";
import Link from "next/link";

export const revalidate = 60;

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
    <main className="min-h-screen overflow-x-hidden">
      <div className="flex flex-wrap justify-center gap-6 md:gap-12 px-4 md:px-16 pt-28 pb-12 md:py-20">
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
