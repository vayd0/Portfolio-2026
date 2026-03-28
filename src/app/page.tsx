import { sanity } from "@/lib/sanity";
import HorizontalScroll from "@/components/HorizontalScroll";
import { Smile } from "@/components/icons";
import AnimatedTitle from "@/components/AnimatedTitle";
import { Circle, Triangle, Arrow } from "@/components/shapes";
import ParallaxShape from "@/components/ParallaxShape";
import ProjectMockup from "@/components/ProjectMockup";
import ProjectTitle from "@/components/ProjectTitle";
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
          <ParallaxShape depthX={0.06} depthY={0.05} enterX={-500} enterY={80} enterRotation={-15} enterDelay={0} className="absolute top-1/2 -translate-y-1/2" style={{ left: -30, zIndex: 10 }}>
            <Circle />
          </ParallaxShape>
          <ParallaxShape depthX={0.18} depthY={0.14} enterX={350} enterY={-350} enterRotation={25} enterDelay={0.1} className="absolute top-0 right-0" style={{ marginTop: -60, marginRight: -60, zIndex: 10 }}>
            <Triangle />
          </ParallaxShape>
          <ParallaxShape depthX={0.12} depthY={0.09} enterX={280} enterY={300} enterRotation={-20} enterDelay={0.05} className="absolute bottom-0 right-0" style={{ marginBottom: -40, marginRight: -20, zIndex: 10 }}>
            <Arrow />
          </ParallaxShape>

          <ProjectMockup
            image={project.image}
            title={project.title}
            rotation={rotations[i]}
          />

          <div className="absolute bottom-8 left-12 z-10">
            <ProjectTitle title={project.title} className={styles.projectTitle} />
          </div>
        </div>
      ))}
    </HorizontalScroll>
  );
}
