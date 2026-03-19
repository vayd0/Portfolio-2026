import Card from "@/components/Card";
import HorizontalScroll from "@/components/HorizontalScroll";
import FallIn from "@/components/FallIn";

const projects = [
  { title: "Projet Alpha" },
  { title: "Studio Branding" },
  { title: "Motion Design" },
  { title: "Web App" },
  { title: "Visual Identity" },
  { title: "Creative Dev" },
];

export default function Home() {
  return (
    <HorizontalScroll>
      <div className="flex flex-row items-center gap-12 px-16 py-20">
        {projects.map((project, i) => (
          <FallIn key={i} delay={i * 0.05}>
            <div className="w-[380px] shrink-0">
              <Card title={project.title} index={i} />
            </div>
          </FallIn>
        ))}
      </div>
    </HorizontalScroll>
  );
}
