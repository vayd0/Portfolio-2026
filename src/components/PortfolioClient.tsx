"use client";

import { useRef } from "react";
import HorizontalScroll from "@/components/HorizontalScroll";
import ProjectExpandedPanel from "@/components/ProjectExpandedPanel";
import AnimatedTitle from "@/components/AnimatedTitle";
import PhysicsBall, { PhysicsBallHandle } from "@/components/PhysicsBall";
import { Smile } from "@/components/icons";
import styles from "@/app/page.module.css";

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

const rotations = [-6, 5, -4];

const shapeConfigs = [
  {
    circle:   { depthX: 0.06, depthY: 0.05, enterX: -150, enterY:  100, enterRotation: -10, enterDelay: 0,    className: "absolute",                 style: { left: "15vw", top: "20vh" },                 mobileStyle: { left: "5vw", top: "8vh" } },
    triangle: { depthX: 0.18, depthY: 0.14, enterX:  300, enterY: -200, enterRotation:  20, enterDelay: 0.1,  className: "absolute top-0 right-0",   style: { marginTop: "-25vh", marginRight: "-8vw" },    mobileStyle: { marginTop: "-5vh", marginRight: "-5vw" } },
    arrow:    { depthX: 0.12, depthY: 0.09, enterX:  150, enterY:  200, enterRotation: -15, enterDelay: 0.05, className: "absolute bottom-0",         style: { right: "15vw", marginBottom: "-15vh" },      mobileStyle: { right: "5vw", marginBottom: "-4vh" } },
  },
  {
    circle:   { depthX: 0.07, depthY: 0.06, enterX:  200, enterY: -150, enterRotation:  20, enterDelay: 0.05, className: "absolute top-0 right-0",   style: { marginTop: "-5vh", marginRight: "-5vw" },     mobileStyle: { marginTop: "10vh", marginRight: "-4vw" } },
    triangle: { depthX: 0.14, depthY: 0.11, enterX: -200, enterY:  100, enterRotation: -25, enterDelay: 0,    className: "absolute",                 style: { left: "15vw", top: "40vh" },                 mobileStyle: { left: "5vw", top: "55vh" } },
    arrow:    { depthX: 0.10, depthY: 0.08, enterX:  100, enterY:  300, enterRotation:  15, enterDelay: 0.1,  className: "absolute bottom-0",         style: { left: "55vw", marginBottom: "-20vh" },       mobileStyle: { left: "60vw", marginBottom: "-4vh" } },
  },
  {
    circle:   { depthX: 0.08, depthY: 0.06, enterX: -200, enterY:  200, enterRotation: -25, enterDelay: 0.08, className: "absolute bottom-0 left-0", style: { marginBottom: "-10vh", marginLeft: "-8vw" }, mobileStyle: { marginBottom: "-3vh", marginLeft: "-4vw" } },
    triangle: { depthX: 0.16, depthY: 0.12, enterX:  300, enterY: -200, enterRotation:  20, enterDelay: 0,    className: "absolute top-0 right-0",   style: { marginTop: "-20vh", marginRight: "-5vw" },   mobileStyle: { marginTop: "-4vh", marginRight: "-4vw" } },
    arrow:    { depthX: 0.11, depthY: 0.09, enterX: -200, enterY: -150, enterRotation:  15, enterDelay: 0.05, className: "absolute top-0 left-0",    style: { marginTop: "-10vh", marginLeft: "-5vw" }, flipY: true, mobileStyle: { marginTop: "8vh", marginLeft: "-4vw" } },
  },
];

const COPIES = [0, 1, 2];

export default function PortfolioClient({ projects }: { projects: Project[] }) {
  const loopEvery = projects.length + 1;
  const overlayRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<PhysicsBallHandle>(null);
  const spawnBall = () => ballRef.current?.spawn();

  return (
    <>
      <div ref={overlayRef} style={{ position: "absolute", inset: 0, background: "linear-gradient(225deg, #0AE448, #C5FF33 50%, #D2FF5E)", zIndex: 999, display: "none", pointerEvents: "none" }} />
      <PhysicsBall ref={ballRef} />
      <HorizontalScroll loopEvery={loopEvery}>
        {COPIES.flatMap((copy) => [
          <div key={`intro-${copy}`} className={styles.introCard}>
            <div className={styles.introGroup}>
              <h3 className={styles.introText}>Bonjour <Smile />, je m'appelle </h3>
              <AnimatedTitle
                className={styles.bigText}
                wheelStretch={copy === 0}
                gradient="linear-gradient(225deg, #0AE448, #C5FF33 50%, #D2FF5E)"
                stroke="2px #000000"
              >
                Théo
              </AnimatedTitle>
              <h3 className={styles.introText}>Et j'aime créer des choses</h3>
            </div>
          </div>,
          ...projects.map((project, i) => (
            <ProjectExpandedPanel
              key={`${project._id}-${copy}`}
              project={project}
              rotation={rotations[i % rotations.length]}
              shapeConfig={shapeConfigs[i % shapeConfigs.length]}
              overlayRef={overlayRef}
              spawnBall={spawnBall}
            />
          )),
        ])}
      </HorizontalScroll>
    </>
  );
}
