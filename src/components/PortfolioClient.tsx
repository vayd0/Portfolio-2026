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
    triangle: { depthX: 0.16, depthY: 0.12, className: "absolute top-0 right-0",   style: { marginTop: "-20vh", marginRight: "18vw" },   mobileStyle: { marginTop: "-4vh", marginRight: "2vw" } },
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
            <svg width="74" height="82" viewBox="0 0 74 82" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", bottom: "clamp(80px, 15vh, 160px)", left: "clamp(20px, 3vw, 48px)", width: "clamp(50px, 6vw, 80px)", height: "auto", pointerEvents: "none", zIndex: 2 }}>
              <path d="M15.3004 65.2924C15.3004 65.2168 15.3004 65.1412 15.2813 62.1689C15.2621 59.1965 15.2239 53.3297 14.2247 44.6476C13.2255 35.9655 11.2664 24.646 10.0269 18.1289C8.51915 10.201 7.6419 8.39447 7.50531 7.71858C7.45487 7.46897 7.94398 7.43278 8.35184 7.6128C9.29336 8.02835 10.0894 8.9345 19.1735 13.4974C27.7802 17.8204 44.6669 25.8857 54.0469 30.527C63.427 35.1683 64.831 36.0559 65.3933 36.5606C65.9557 37.0653 65.6339 37.1603 57.6803 42.7884C49.7267 48.4165 34.151 59.5749 25.4129 65.8091C16.6748 72.0432 15.2464 73.015 13.6783 73.7754" stroke="#000000" strokeWidth="15" strokeLinecap="round"/>
              <path d="M20.3594 20.1783V24.2734C20.3594 28.3418 20.3594 36.465 20.3809 40.3968C20.4023 44.3286 20.4453 43.823 20.5596 43.3075C21.0575 41.0617 22.8332 39.3583 26.2548 36.3463C29.006 33.9245 34.0211 29.9249 36.7498 27.7836C39.4786 25.6424 39.821 25.541 39.9918 25.7132C40.1626 25.8855 40.1514 26.3344 38.2154 30.5609C36.2794 34.7874 32.4189 42.7778 29.4774 48.4927C25.7276 55.7781 23.5013 59.4589 22.7018 60.7587M22.7018 60.7587C22.5114 61.0682 22.4019 61.2427 22.372 61.2987C22.4027 61.1832 22.4645 61.038 22.7018 60.7587ZM22.7018 60.7587C23.2219 60.1467 24.5857 58.8908 28.3149 55.8923C33.4484 51.8342 43.409 44.0358 53.7808 35.8944M8.2655 6.95392L8.25406 11.4315C8.24261 15.8788 8.21977 24.7576 8.88356 34.5357C9.5474 44.3145 10.8986 54.7245 11.6514 60.9931C12.5175 69.0733 12.7029 71.4182 12.8592 72.368C12.9469 72.8395 13.0515 73.2896 13.2584 74.9816" stroke="#000000" strokeWidth="10" strokeLinecap="round"/>
            </svg>
            <div className={styles.introGroup}>
              <h3 data-intro-surface className={styles.introText}>Bonjour <Smile />, je m'appelle </h3>
              {copy === 0 && <h1 style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Théo Heck</h1>}
              <div style={{ position: "relative", display: "inline-block" }}>
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
                <svg width="166" height="160" viewBox="0 0 166 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", bottom: "-40px", right: "-20px", width: "clamp(70px, 9vw, 120px)", height: "auto", pointerEvents: "none" }}>
                  <path d="M66.6868 53.3605C66.9766 52.0353 68.6923 47.1885 69.9162 44.0355C70.3661 42.8766 70.9055 41.7755 73.9384 37.788C76.5887 34.3036 81.6259 27.9536 85.6911 22.5526C92.8668 13.019 95.9816 8.02102 96.269 7.54549C96.6495 6.91601 96.6847 12.9575 97.8036 22.0093C99.1847 33.1825 101.585 41.766 101.969 46.371C102.455 52.1995 102.41 56.5253 103.013 59.6769C103.458 62.0019 108.239 61.8508 112.931 64.1088C114.182 64.7108 115.398 65.1512 120.856 66.4523C126.315 67.7534 135.992 69.8738 141.498 71.035C149.628 72.7497 152.86 72.3134 157.481 72.1364C158.098 72.1128 157.739 72.7171 156.674 73.1752C151.678 75.3236 148.208 76.3051 139.006 81.7005C131.151 86.3062 122.916 90.8646 117.096 93.7998C113.497 95.6151 109.518 96.7896 105.429 98.9784C103.905 99.7947 105.592 101.986 108.18 117.736C109.975 128.663 110.692 137.219 110.367 141.662C109.926 147.688 109.728 149.694 109.252 151.361C108.612 153.6 103.232 145.69 94.6084 137.855C89.0623 132.816 81.5399 125.188 77.3821 121.029C72.7613 116.301 71.6602 114.701 70.506 112.946C69.9759 112.207 69.5587 111.773 69.1289 111.326M66.6741 53.7891C65.656 53.5873 63.1318 53.0294 60.0148 52.0553C59.1492 51.7849 58.4001 51.6059 53.7674 50.5098C49.1347 49.4137 40.6369 47.4198 32.4863 45.9952C24.3358 44.5707 16.79 43.7761 12.7373 43.3728C8.68465 42.9695 8.35368 42.9816 8.05976 43.0828C7.76585 43.184 7.51903 43.3738 7.50464 43.5834C7.3461 45.8937 12.3599 47.4189 16.2766 51.3671C19.6824 54.8003 25.8053 61.2952 31.0241 66.6681C36.2429 72.041 40.3306 76.1358 43.0771 79.0401C49.0461 85.352 49.852 86.6134 50.2483 87.1503C50.6435 87.6857 49.3225 89.4226 46.8564 92.5966C43.4183 97.0218 40.6682 101.292 38.7784 104.356C37.8302 105.893 36.7365 107.288 35.2785 109.717C31.8367 115.451 29.9452 119.461 28.5229 122.437C27.295 125.006 24.8827 129.65 23.2363 132.561C21.5898 135.473 20.7422 136.493 20.5937 136.787C20.4453 137.082 21.0217 136.62 23.64 135.047C26.2584 133.474 30.9013 130.804 33.6611 129.155L33.68 129.144C37.2152 127.033 40.3153 125.181 44.1715 123.26C46.0783 122.31 47.287 122.069 48.5155 121.784C49.4539 121.566 53.4255 119.541 59.1925 116.502C62.0512 114.926 64.0663 113.833 66.2226 112.737L66.286 112.704C67.0761 112.304 67.3983 112.14 68.3311 111.59M108.889 125.485C107.998 125.705 100.17 129.163 94.5896 131.442C93.8974 131.724 93.2827 131.65 92.9674 131.452C91.639 130.617 91.2998 129.136 90.1424 127.83C88.6371 126.131 90.3799 122.797 92.3651 117.613C93.8802 113.655 96.9837 107.23 101.083 100.165C105.182 93.0994 110.326 85.6456 113.806 80.879C118.749 74.1095 121.747 70.8677 123.479 68.4702C124.134 67.563 124.286 67.2487 124.235 66.9854C124.183 66.7222 123.911 66.5105 123.52 66.5803C122.545 66.7545 121.258 68.3638 113.859 74.9648C107.424 80.7064 95.0961 90.7892 87.4572 97.5806C79.8183 104.372 77.1271 107.435 74.8458 109.407C68.8772 114.566 66.0542 114.566 65.6396 114.439C65.3751 114.358 65.5887 113.563 66.5436 111.473C67.4986 109.383 69.3388 105.848 74.2492 99.2225C79.1597 92.597 87.0847 82.9879 91.3461 77.6958C95.6076 72.4036 95.9654 71.7195 97.2822 69.6715C100.804 64.1937 103.544 59.979 103.541 59.0046C103.539 58.5941 102.134 59.1432 101.361 59.4067C100.587 59.6703 100.129 59.8334 90.3522 68.4105C80.5751 76.9876 61.4927 93.9737 51.5648 102.855C41.7304 111.653 41.4464 111.993 40.7321 112.847L40.7116 112.872C39.9813 113.745 38.7219 115.222 37.9751 115.74C37.2283 116.259 37.0324 115.773 36.9723 115.285C36.9123 114.796 36.9941 114.319 37.4515 113.007C37.909 111.695 38.7396 109.563 48.6099 96.5678C58.4803 83.573 77.3651 59.7798 87.1399 47.3692C96.9147 34.9585 97.0073 34.6513 96.7364 34.4864C94.7751 33.2927 89.4219 35.8196 82.6187 39.3067C80.7989 40.2395 79.1498 41.7346 73.4351 46.9244C67.7205 52.1142 58.0964 61.1371 51.8281 66.6325C45.5597 72.128 42.9387 73.8224 41.3012 74.8178C40.6526 75.2121 40.2574 75.3795 40.0326 75.4108M40.0326 75.4108C39.982 75.4178 39.94 75.418 39.9058 75.4123M40.0326 75.4108C40.9768 73.6354 39.7557 74.8341 39.7779 75.2735M40.0326 75.4108C40.0263 75.4226 40.0199 75.4346 40.0134 75.4468C39.9978 75.4757 39.9605 75.4615 39.9058 75.4123M39.9058 75.4123C39.819 75.3979 39.7815 75.3461 39.7779 75.2735M39.9058 75.4123C39.8701 75.3802 39.827 75.3332 39.7779 75.2735M39.7779 75.2735C39.1578 74.5209 37.5645 71.752 37.5134 71.4468C37.3918 70.7215 35.4267 72.4441 38.0964 66.9247C39.8932 63.6576 42.5873 59.4442 44.0785 57.034C45.5697 54.6237 45.7765 54.1442 46.4297 53.3722" stroke="#000000" stroke-width="15" stroke-linecap="round"/>
                  <path d="M69.2114 60.1583C67.0001 60.1158 62.1738 60.2719 61.3081 61.1711C58.5035 64.0843 58.8486 65.744 58.8304 67.3628C58.8199 68.2962 59.3013 68.9888 59.6369 69.3601C60.3853 70.188 62.3749 69.835 64.2552 70.0801C65.7106 70.2698 69.0687 68.3403 70.858 67.0517C71.8117 66.3648 70.0345 61.7233 69.0795 59.3162C68.8535 58.7466 68.1119 58.5495 67.3766 58.4378C65.5427 58.159 62.262 59.8157 58.4592 62.1743C56.0321 63.6796 54.9208 65.7052 54.5927 66.7204C54.0807 68.3044 56.1885 70.4435 57.1147 71.2497C58.1303 72.1337 61.4554 71.9887 64.0412 71.8129C66.3233 71.6578 68.7428 69.5207 70.0182 68.4387C70.5112 68.0205 70.773 67.5099 71.0075 67.0088C71.5596 65.8288 70.2248 63.5582 69.0973 61.5172C68.7884 60.9579 68.4736 60.5684 67.7643 60.2398C64.7279 58.8331 61.9117 59.9625 60.7462 60.3174C58.2695 61.0716 56.0227 64.42 55.4866 65.3986C54.2348 67.6832 55.4071 71.4485 55.9034 72.6465C56.0175 72.922 56.3128 73.081 56.6163 73.1731C57.2853 73.2506 58.5488 72.964 60.1325 72.5165C60.8293 72.3404 61.3091 72.2678 62.3606 72.0176" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  <path d="M96.1844 61.0771C95.0072 62.0217 92.4128 64.9101 91.6418 66.4834C91.157 67.4726 91.2128 68.9841 91.2579 70.5203C91.3785 74.6242 94.1747 79.652 95.0161 80.5648C96.6755 82.365 101.144 80.6836 103.247 80.176C105.129 79.7218 106.376 78.0822 108.779 73.841C110.157 71.408 109.606 69.593 109.063 67.9281C108.415 65.9462 107.049 63.9768 105.581 61.9724C103.649 59.3349 101.558 57.9499 100.449 57.594C98.428 56.9454 94.1676 58.5457 90.2379 60.3326C88.9493 60.9185 88.4851 61.8275 88.2442 62.368C88.1031 62.6847 88.0219 63.1266 87.967 65.5866C87.9122 68.0466 87.9113 72.5213 87.938 75.0961C87.9806 79.2073 88.779 80.614 89.6093 81.4526C91.086 82.9441 96.1421 82.6331 98.9118 82.3222C101.118 82.0746 104.443 78.1217 106.968 74.9301C107.453 74.3173 107.47 73.7009 107.488 73.0873C107.505 72.5211 107.209 71.8466 106.194 69.9992C103.986 65.9831 101.788 63.0421 100.881 62.1267C99.3041 60.5369 97.2545 59.9689 92.9539 59.5488C91.6683 59.4231 91.0179 59.6339 90.5325 59.8691C89.651 60.2963 89.5865 61.3123 89.3063 64.7168C89.048 67.8565 88.7839 73.88 88.6673 77.3011C88.529 81.3606 88.9808 82.5681 89.497 83.591C89.9775 84.5432 90.8876 85.195 91.8282 85.801C93.9404 87.1617 98.4996 86.2292 101.638 84.5079C102.94 83.7939 103.452 82.3361 103.987 81.3623C104.456 80.5101 104.615 78.4532 104.366 74.2314C104.208 71.5709 103.252 67.9276 102.726 65.7318C102.045 62.8899 101.486 61.9397 100.997 61.3854C99.6797 61.0082 98.9538 61.1011 98.4744 61.2501C98.2302 61.3398 97.984 61.458 97.7303 61.5797" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  <path d="M57.8712 88.1357C57.9978 88.8696 60.5929 93.6436 63.2638 97.1389C64.8756 99.2482 66.8612 100.026 70.4213 100.875C73.4547 101.599 76.6625 100.772 78.8957 100.252C81.3656 99.6778 83.0426 98.1693 85.6911 95.4562C86.2203 94.9141 86.3043 94.6693 85.6897 95.0842C83.6585 96.4552 81.7622 97.973 79.8821 98.8991C74.1298 101.732 71.8672 101.606 69.9813 101.503C69.0414 101.452 67.1404 100.125 64.5694 98.3899C62.7361 97.1526 61.5248 95.8373 60.1803 93.9866C58.198 91.2578 57.1116 87.9834 56.4425 86.1441C56.2426 85.5948 56.1962 85.877 56.2251 86.2543C56.3552 87.9537 57.0674 89.423 62.057 95.3595C64.498 98.2637 67.0009 98.9154 69.0546 99.295C70.044 99.3474 70.9623 99.3003 72.4189 98.8203C73.4562 98.3979 75.0988 97.6125 76.7912 96.8032" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
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
              mockupOffsetY={i === 1 ? 40 : 0}
              annotationPosition={i === 1 ? "bottom" : "top"}
            />
          )),
        ])}
      </HorizontalScroll>
    </>
  );
}
