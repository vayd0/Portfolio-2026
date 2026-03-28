import { sanity } from "@/lib/sanity";
import Card from "@/components/Card";
import FallIn from "@/components/FallIn";

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
    <main className="min-h-screen">
      <div className="flex flex-wrap justify-start gap-12 px-16 py-20">
        {projects.map((project, i) => (
          <FallIn key={project._id} delay={i * 0.05}>
            <div className="w-[380px] shrink-0">
              <Card
                title={project.title}
                image={project.image}
                color={project.color}
                index={i}
              />
            </div>
          </FallIn>
        ))}
      </div>
    </main>
  );
}
