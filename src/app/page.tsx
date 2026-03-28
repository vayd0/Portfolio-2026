import { sanity } from "@/lib/sanity";
import HorizontalScroll from "@/components/HorizontalScroll";
import { Smile } from "@/components/icons";
import AnimatedTitle from "@/components/AnimatedTitle";
import { Circle, Triangle, Arrow } from "@/components/shapes";
import styles from "./page.module.css";

export const revalidate = 60;

type Project = {
  _id: string;
  title: string;
  image?: string;
};

const query = `*[_type == "project"] | order(_createdAt asc)[0...3] {
  _id,
  title,
  "image": image.asset->url
}`;

const rotations = [-6, 5, -4];

export default async function Home() {
  const projects = await sanity.fetch<Project[]>(query);

  return (
    <HorizontalScroll>
      <div className={styles.introCard}>
        <div className={styles.introGroup}>
          <h3 className={styles.introText}>Bonjour <Smile />, je m'appelle </h3>
          <AnimatedTitle className={styles.bigText}>Théo</AnimatedTitle>
          <h3 className={styles.introText}>Et j'aime créer des choses</h3>
        </div>
      </div>

      {projects.map((project, i) => (
        <div
          key={project._id}
          className="relative shrink-0 overflow-hidden bg-white flex items-center justify-center"
          style={{ width: "100dvw", height: "100dvh" }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3">
            <Circle />
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4">
            <Triangle />
          </div>
          <div className="absolute bottom-0 right-0 translate-y-1/4">
            <Arrow />
          </div>

          <div
            className="relative z-10"
            style={{
              transform: `rotate(${rotations[i]}deg)`,
              border: "3px solid #44aaff",
              width: 640,
              aspectRatio: "16/9",
              overflow: "hidden",
            }}
          >
            {project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </div>

          <div className="absolute bottom-8 left-12 z-10">
            <span className={styles.projectTitle}>{project.title}</span>
          </div>
        </div>
      ))}
    </HorizontalScroll>
  );
}
