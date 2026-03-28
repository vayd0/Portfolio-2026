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
};

const query = `*[_type == "project"] | order(_createdAt asc)[0...3] {
  _id,
  title,
  "image": mainImage.asset->url,
  "gallery": gallery[].asset->url,
  description,
  url,
  github
}`;

const rotations = [-6, 5, -4];

const shapeConfigs = [
  {
    circle:   { depthX: 0.06, depthY: 0.05, enterX: -500, enterY:  80, enterRotation: -15, enterDelay: 0    },
    triangle: { depthX: 0.18, depthY: 0.14, enterX:  350, enterY: -350, enterRotation:  25, enterDelay: 0.1  },
    arrow:    { depthX: 0.12, depthY: 0.09, enterX:  280, enterY:  300, enterRotation: -20, enterDelay: 0.05 },
  },
  {
    circle:   { depthX: 0.06, depthY: 0.05, enterX: -500, enterY:  80, enterRotation: -15, enterDelay: 0    },
    triangle: { depthX: 0.18, depthY: 0.14, enterX:  350, enterY: -350, enterRotation:  25, enterDelay: 0.1  },
    arrow:    { depthX: 0.12, depthY: 0.09, enterX:  280, enterY:  300, enterRotation: -20, enterDelay: 0.05 },
  },
  {
    circle:   { depthX: 0.06, depthY: 0.05, enterX: -500, enterY:  80, enterRotation: -15, enterDelay: 0    },
    triangle: { depthX: 0.18, depthY: 0.14, enterX:  350, enterY: -350, enterRotation:  25, enterDelay: 0.1  },
    arrow:    { depthX: 0.12, depthY: 0.09, enterX:  280, enterY:  300, enterRotation: -20, enterDelay: 0.05 },
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
