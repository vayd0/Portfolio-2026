import { sanity } from "@/lib/sanity";
import HorizontalScroll from "@/components/HorizontalScroll";
import { Smile } from "@/components/icons";
import AnimatedTitle from "@/components/AnimatedTitle";
import ProjectExpandedPanel from "@/components/ProjectExpandedPanel";
import styles from "./page.module.css";

export const revalidate = 60;

type Project = {
  _id: string;
  title: string;
  image?: string;
  gallery?: string[];
  description?: string;
  url?: string;
  github?: string;
  projectUrl?: string;
};

const query = `*[_type == "project"] | order(_createdAt asc)[0...3] {
  _id,
  title,
  "image": mainImage.asset->url,
  "gallery": gallery[].asset->url,
  description,
  projectUrl,
  github
}`;

const rotations = [-6, 5, -4];

const shapeConfigs = [
  {
    circle:   { depthX: 0.06, depthY: 0.05, enterX: -150, enterY:  100, enterRotation: -10, enterDelay: 0,    className: "absolute",                         style: { left: "15vw", top: "20vh" } },
    triangle: { depthX: 0.18, depthY: 0.14, enterX:  300, enterY: -200, enterRotation:  20, enterDelay: 0.1,  className: "absolute top-0 right-0",           style: { marginTop: "-25vh", marginRight: "-8vw" } },
    arrow:    { depthX: 0.12, depthY: 0.09, enterX:  150, enterY:  200, enterRotation: -15, enterDelay: 0.05, className: "absolute bottom-0",                style: { right: "15vw", marginBottom: "-15vh" } },
  },
  {
    circle:   { depthX: 0.07, depthY: 0.06, enterX:  200, enterY: -150, enterRotation:  20, enterDelay: 0.05, className: "absolute top-0 right-0",           style: { marginTop: "-5vh", marginRight: "-5vw" } },
    triangle: { depthX: 0.14, depthY: 0.11, enterX: -200, enterY:  100, enterRotation: -25, enterDelay: 0,    className: "absolute",                         style: { left: "15vw", top: "40vh" } },
    arrow:    { depthX: 0.10, depthY: 0.08, enterX:  100, enterY:  300, enterRotation:  15, enterDelay: 0.1,  className: "absolute bottom-0",                style: { left: "55vw", marginBottom: "-20vh" } },
  },
  {
    circle:   { depthX: 0.08, depthY: 0.06, enterX: -200, enterY:  200, enterRotation: -25, enterDelay: 0.08, className: "absolute bottom-0 left-0",         style: { marginBottom: "-10vh", marginLeft: "-8vw" } },
    triangle: { depthX: 0.16, depthY: 0.12, enterX:  300, enterY: -200, enterRotation:  20, enterDelay: 0,    className: "absolute top-0 right-0",           style: { marginTop: "-20vh", marginRight: "-5vw" } },
    arrow:    { depthX: 0.11, depthY: 0.09, enterX: -200, enterY: -150, enterRotation:  15, enterDelay: 0.05, className: "absolute top-0 left-0",                   style: { marginTop: "-10vh", marginLeft: "-5vw" }, flipY: true },
  },
];

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
        <ProjectExpandedPanel
          key={project._id}
          project={project}
          rotation={rotations[i]}
          shapeConfig={shapeConfigs[i]}
        />
      ))}
    </HorizontalScroll>
  );
}
