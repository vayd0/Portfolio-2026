"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import HorizontalScroll from "@/components/HorizontalScroll";
import ProjectExpandedPanel from "@/components/ProjectExpandedPanel";
import AnimatedTitle from "@/components/AnimatedTitle";
import PhysicsBall, { PhysicsBallHandle } from "@/components/PhysicsBall";
import { Smile } from "@/components/icons";
import styles from "@/app/page.module.css";

const INTRO_RMIN = 14;
const INTRO_RMAX = 38;
const INTRO_COUNT = 12;
const INTRO_BOUNCE = 0.55;

function IntroFallingBalls() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    type B = { el: HTMLDivElement; r: number; x: number; y: number; vx: number; vy: number };
    const balls: B[] = [];

    const W = () => container.clientWidth || window.innerWidth;
    const H = () => container.clientHeight || window.innerHeight;

    const SVG_PATH = `M61.4815 22.391C60.5407 22.1574 53.6992 7.54216 45.2791 5.69266C38.9817 4.30939 33.4623 5.30856 30.6025 6.01179C26.216 7.09047 22.4468 13.1015 17.3733 20.3021C12.937 26.5986 10.9308 32.6691 9.5213 36.9888C7.86429 42.0671 8.81173 45.9168 11.1447 50.8572C12.9658 54.7136 16.8986 57.4312 19.0861 58.5907C21.7152 59.9843 29.426 60.745 38.1354 60.8894C40.3865 60.9267 42.0124 59.9959 45.6268 57.9011C48.4362 56.2729 53.018 53.1514 56.196 50.8491C61.1181 47.2832 62.9508 45.0298 63.5506 44.0264C64.0532 43.1859 64.2081 38.4971 64.5016 31.8524C64.7334 26.6033 60.2367 19.9901 56.9189 15.6433C53.5987 11.2935 49.9875 10.4204 40.009 8.97456C32.5372 7.89194 27.2898 8.84926 25.3091 9.22526C21.435 9.9607 18.3008 12.461 15.4173 14.886C13.3485 16.6257 12.0152 18.6852 10.8518 20.5876C9.10425 23.4455 7.44555 28.9458 5.87127 35.8375C4.46535 41.9921 5.10982 45.7516 5.41895 46.9561C6.53493 51.3042 13.1014 56.8219 15.6835 58.7855C17.3129 60.0246 19.2742 60.1818 23.2556 60.2205C24.9783 60.2373 28.347 59.3065 33.2946 57.7581C41.3019 55.252 45.0311 51.0712 47.6023 47.3709C49.1021 45.2124 49.1629 40.8076 48.8623 36.26C48.5574 31.6485 46.2659 27.5856 43.8193 23.7174C40.0915 17.8236 35.9795 16.2774 33.0364 15.0652C30.6557 14.0846 27.9113 14.8941 24.5518 16.4316C17.9833 19.4377 15.7445 24.0188 13.5501 29.2189C10.8357 35.6516 10.4252 42.7323 10.1865 46.8479C10.062 48.9935 10.4498 50.0913 11.0533 51.074C12.2953 53.0961 15.358 53.5752 19.2391 54.2031C22.7933 54.7782 26.4516 54.1613 31.4238 53.0131C40.6771 50.8764 46.7422 48.314 47.4627 47.565C48.1053 46.8968 48.3152 41.2239 48.6642 33.1975C48.8746 28.3596 45.1124 23.9334 42.4977 21.0751C40.9882 19.4251 30.8521 19.0838 24.3766 19.7631C18.8203 20.3459 16.2969 30.8204 15.1809 34.3019C13.8951 38.3129 14.5927 41.8453 15.0541 42.808C16.372 45.5576 25.0051 46.3066 32.8258 46.9387C35.9657 47.1924 39.2001 45.7521 43.0966 43.764C52.6862 38.8713 54.6767 35.1859 55.6254 33.4024C56.9157 30.9765 52.5346 26.8272 49.3631 23.6237C46.0275 20.2543 40.5177 20.6924 36.6843 21.1455C32.9873 21.5824 29.143 28.0755 26.3503 32.4872C25.4648 33.886 25.2151 35.2287 25.0197 36.3082C24.8124 37.4535 25.1622 38.4392 25.7105 39.1884C27.3103 41.3743 31.1738 42.6168 35.961 43.561C39.844 44.3269 43.0322 43.3837 44.4869 42.7627C45.8247 42.1917 46.669 41.1582 47.2986 40.3239C47.8524 39.59 47.8126 38.3061 47.5623 36.8669C47.0957 34.1834 42.7579 32.3839 37.6903 31.1411C34.1683 30.2774 31.4671 31.1243 30.4889 31.679C29.9995 31.9565 29.7458 32.548 29.6205 33.0382C29.4952 33.5284 29.5626 33.9817 29.8195 34.2949C30.3555 34.9487 31.3725 34.9319 32.2266 34.7622C33.3029 34.5484 34.0733 33.3905 34.6415 32.3785C34.9088 31.9024 34.9496 31.4104 34.8114 31.0195C34.6732 30.6286 34.3078 30.3301 33.8875 30.2625C33.4672 30.1948 33.0032 30.3671 32.1534 31.1609`;

    for (let i = 0; i < INTRO_COUNT; i++) {
      const r = INTRO_RMIN + Math.random() * (INTRO_RMAX - INTRO_RMIN);
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;width:${r * 2}px;height:${r * 2}px;pointer-events:none;`;
      el.innerHTML = `<svg width="${r * 2}" height="${r * 2}" viewBox="0 0 70 66" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${SVG_PATH}" stroke="#000000" stroke-width="10" stroke-linecap="round"/></svg>`;
      container.appendChild(el);
      balls.push({
        el, r,
        x: r + Math.random() * (W() - r * 2),
        y: -r - Math.random() * H() * 1.5,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2,
      });
    }

    const tick = () => {
      const w = W(), h = H();
      const containerRect = container.getBoundingClientRect();
      const surfaces = container.parentElement?.querySelectorAll<HTMLElement>("[data-intro-surface]") ?? [];

      for (const ball of balls) {
        const { r } = ball;
        ball.vy += 0.45;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y + r >= h) {
          ball.y = h - r;
          ball.vy *= -INTRO_BOUNCE;
          ball.vx *= 0.985;
          if (Math.abs(ball.vy) < 0.8) ball.vy = 0;
        }
        if (ball.y - r <= 0) { ball.y = r; ball.vy = Math.abs(ball.vy) * INTRO_BOUNCE; }
        if (ball.x - r <= 0) { ball.x = r; ball.vx = Math.abs(ball.vx) * INTRO_BOUNCE; }
        if (ball.x + r >= w) { ball.x = w - r; ball.vx = -Math.abs(ball.vx) * INTRO_BOUNCE; }

        surfaces.forEach(el => {
          const rect = el.getBoundingClientRect();
          const sr = {
            left: rect.left - containerRect.left,
            right: rect.right - containerRect.left,
            top: rect.top - containerRect.top,
            bottom: rect.bottom - containerRect.top,
          };
          const cx = Math.max(sr.left, Math.min(ball.x, sr.right));
          const cy = Math.max(sr.top, Math.min(ball.y, sr.bottom));
          const dx = ball.x - cx, dy = ball.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < r) {
            const nx = dx / dist, ny = dy / dist;
            ball.x = cx + nx * (r + 1);
            ball.y = cy + ny * (r + 1);
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * INTRO_BOUNCE;
            ball.vy = (ball.vy - 2 * dot * ny) * INTRO_BOUNCE;
          }
        });

        ball.el.style.left = `${ball.x - r}px`;
        ball.el.style.top = `${ball.y - r}px`;
      }

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], b = balls[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.r + b.r;
          if (dist < minDist && dist > 0) {
            const nx = dx / dist, ny = dy / dist;
            const overlap = minDist - dist;
            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;
            const dvx = b.vx - a.vx, dvy = b.vy - a.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot < 0) {
              a.vx += dot * nx * INTRO_BOUNCE;
              a.vy += dot * ny * INTRO_BOUNCE;
              b.vx -= dot * nx * INTRO_BOUNCE;
              b.vy -= dot * ny * INTRO_BOUNCE;
            }
          }
        }
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      balls.forEach(b => b.el.remove());
    };
  }, []);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }} />;
}


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
    circle:   { depthX: 0.06, depthY: 0.05, className: "absolute",                 style: { left: "15vw", top: "20vh" },                 mobileStyle: { left: "5vw", top: "8vh" } },
    triangle: { depthX: 0.18, depthY: 0.14, className: "absolute top-0 right-0",   style: { marginTop: "-25vh", marginRight: "2vw" },    mobileStyle: { marginTop: "-5vh", marginRight: "2vw" } },
    arrow:    { depthX: 0.12, depthY: 0.09, className: "absolute bottom-0",         style: { right: "15vw", marginBottom: "-15vh" },      mobileStyle: { right: "5vw", marginBottom: "-4vh" } },
  },
  {
    circle:   { depthX: 0.07, depthY: 0.06, className: "absolute top-0 left-0",    style: { marginTop: "-5vh", marginLeft: "2vw" },      mobileStyle: { marginTop: "10vh", marginLeft: "2vw" } },
    triangle: { depthX: 0.14, depthY: 0.11, className: "absolute",                 style: { left: "15vw", top: "40vh" },                 mobileStyle: { left: "5vw", top: "55vh" } },
    arrow:    { depthX: 0.10, depthY: 0.08, className: "absolute bottom-0",         style: { left: "55vw", marginBottom: "-20vh" },       mobileStyle: { left: "60vw", marginBottom: "-4vh" } },
  },
  {
    circle:   { depthX: 0.08, depthY: 0.06, className: "absolute bottom-0 left-0", style: { marginBottom: "-10vh", marginLeft: "2vw" }, mobileStyle: { marginBottom: "-3vh", marginLeft: "2vw" } },
    triangle: { depthX: 0.16, depthY: 0.12, className: "absolute top-0 right-0",   style: { marginTop: "-20vh", marginRight: "2vw" },   mobileStyle: { marginTop: "-4vh", marginRight: "2vw" } },
    arrow:    { depthX: 0.11, depthY: 0.09, className: "absolute top-0 left-0",    style: { marginTop: "-10vh", marginLeft: "2vw" }, flipY: true, mobileStyle: { marginTop: "8vh", marginLeft: "2vw" } },
  },
];

const COPIES = [0, 1, 2];

export default function PortfolioClient({ projects }: { projects: Project[] }) {
  const loopEvery = projects.length + 1;
  const overlayRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<PhysicsBallHandle>(null);
  const spawnBall = () => ballRef.current?.spawn();
  const setBallBlack = (black: boolean) => ballRef.current?.setBlack(black);

  return (
    <>
      <div ref={overlayRef} className="with-grain" style={{ position: "absolute", inset: 0, background: "linear-gradient(225deg, #92FF33, #E2FF55)", zIndex: 999, display: "none", pointerEvents: "none" }} />
      <PhysicsBall ref={ballRef} />
      <HorizontalScroll loopEvery={loopEvery}>
        {COPIES.flatMap((copy) => [
          <div key={`intro-${copy}`} className={styles.introCard}>
            <div className={styles.introGroup}>
              <h3 data-intro-surface className={styles.introText}>Bonjour <Smile />, je m'appelle </h3>
              {copy === 0 && <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Théo Heck</h1>}
              <div data-intro-surface>
                <AnimatedTitle
                  className={styles.bigText}
                  wheelStretch={true}
                  gradient="linear-gradient(225deg, #92FF33, #E2FF55)"
                  stroke="2px #000000"
                >
                  Théo
                </AnimatedTitle>
              </div>
              <h3 data-intro-surface className={styles.introText}>Et j'aime créer des choses</h3>
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
              setBallBlack={setBallBlack}
              titlePosition={i === 1 ? "top-right" : "bottom-left"}
              palette={i % 3 as 0 | 1 | 2}
            />
          )),
        ])}
      </HorizontalScroll>
    </>
  );
}
