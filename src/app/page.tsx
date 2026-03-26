import Card from "@/components/Card";
import HorizontalScroll from "@/components/HorizontalScroll";
import FallIn from "@/components/FallIn";
import { Smile } from "@/components/icons";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import splitText from "gsap/SplitText";
import styles from "./page.module.css";
gsap.registerPlugin(splitText);

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
      <div className={styles.introCard}>
        <div>
          <h3 className={styles.introText}>Bonjour <Smile />, je m'appelle </h3>
          <h1 className={styles.bigText}>Théo</h1>
          <h3 className={styles.introText}>Et j'aime crée des choses</h3>
        </div>
      </div>
      <section className="flex flex-row items-center gap-12 px-16 py-20">
        {projects.map((project, i) => (
          <FallIn key={i} delay={i * 0.05}>
            <div className="w-[380px] shrink-0">
              <Card title={project.title} index={i} />
            </div>
          </FallIn>
        ))}
      </section>
    </HorizontalScroll>
  );
}
