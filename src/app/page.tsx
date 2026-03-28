import { sanity } from "@/lib/sanity";
import HorizontalScroll from "@/components/HorizontalScroll";
import { Smile } from "@/components/icons";
import AnimatedTitle from "@/components/AnimatedTitle";
import { Circle, Triangle, Arrow } from "@/components/shapes";
import ParallaxShape from "@/components/ParallaxShape";
import ProjectMockup from "@/components/ProjectMockup";
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
  "image": mainImage.asset->url
}`;

const rotations = [-6, 5, -4];

export default async function Home() {
  const projects = await sanity.fetch<Project[]>(query);

  return (
    <HorizontalScroll>
      <div className={styles.introCard}>
        <div className={styles.introGroup}>
          <h3 className={styles.introText}>Bonjour <Smile />, je m'appelle </h3>
          <AnimatedTitle className={styles.bigText} wheelStretch gradient="linear-gradient(225deg, #A8CC00, #CCDD59 50%, #F0FF8A)" stroke="2px #202020">Théo</AnimatedTitle>
          <h3 className={styles.introText}>Et j'aime créer des choses</h3>
        </div>
      </div>

      {projects.map((project, i) => (
        <div
          key={project._id}
          className="relative shrink-0 bg-white flex items-center justify-center"
          style={{ width: "100dvw", height: "100dvh" }}
        >
          <ParallaxShape depthX={0.03} depthY={0.025} className="absolute top-1/2 -translate-y-1/2" style={{ left: -30, zIndex: 10 }}>
            <Circle />
          </ParallaxShape>
          <ParallaxShape depthX={0.09} depthY={0.07} className="absolute top-0 right-0" style={{ marginTop: -60, marginRight: -60, zIndex: 10 }}>
            <Triangle />
          </ParallaxShape>
          <ParallaxShape depthX={0.06} depthY={0.05} className="absolute bottom-0 right-0" style={{ marginBottom: -40, marginRight: -20, zIndex: 10 }}>
            <Arrow />
          </ParallaxShape>

          <ProjectMockup
            image={project.image}
            title={project.title}
            rotation={rotations[i]}
          />

          <div className="absolute bottom-8 left-12 z-10">
            <span className={styles.projectTitle}>{project.title}</span>
          </div>
        </div>
      ))}
    </HorizontalScroll>
  );
}
