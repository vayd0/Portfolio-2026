"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { type Palette } from "./shapes";
import BrowserFrame from "./BrowserFrame";

gsap.registerPlugin(Draggable);

type Project = {
  _id: string;
  title: string;
  image?: string;
  gallery?: string[];
  description?: string;
  projectUrl?: string;
  github?: string;
};

interface Props {
  project: Project;
  palette: Palette;
}

const SCATTER = [
  { rx: 0.52, ry: 0.05, rot: -7 },
  { rx: 0.67, ry: 0.42, rot: 5 },
  { rx: 0.56, ry: 0.25, rot: -3 },
];
const imgSrc = (url: string) => `/api/img?url=${encodeURIComponent(url)}`;

export default function ProjetDetailClient({ project, palette }: Props) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const annotationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const proxy = { r: 0 };
    gsap.to(proxy, {
      r: 200, duration: 0.8, ease: "power3.inOut",
      onUpdate: () => { el.style.clipPath = `circle(${proxy.r}vmax at 50% 50%)`; },
      onComplete: () => {
        el.style.clipPath = "none";
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const gallery = galleryRefs.current.filter(Boolean);

        gsap.set(titleRef.current, { y: 80, opacity: 0 });
        gsap.set(imgRef.current, { scale: 0.93, opacity: 0 });
        gsap.set(descRef.current, { y: 28, opacity: 0 });
        gsap.set(linksRef.current, { y: 28, opacity: 0 });
        gsap.set(annotationRef.current, { opacity: 0, scale: 0.85 });
        gsap.set(gallery, {
          x: (i: number) => (SCATTER[i % SCATTER.length].rx) * w,
          y: (i: number) => (SCATTER[i % SCATTER.length].ry) * h - h * 0.6,
          opacity: 0,
          rotation: 0,
        });

        const tl = gsap.timeline();
        tl.to(titleRef.current, { y: 0, opacity: 1, duration: 0.85, ease: "elastic.out(1, 0.45)" })
          .to(imgRef.current, { scale: 1, opacity: 1, duration: 0.65, ease: "power3.out" }, 0.1)
          .to(gallery, {
            x: (i: number) => (SCATTER[i % SCATTER.length].rx) * w,
            y: (i: number) => (SCATTER[i % SCATTER.length].ry) * h,
            opacity: 1,
            rotation: (i: number) => SCATTER[i % SCATTER.length].rot,
            stagger: 0.12,
            duration: 0.95,
            ease: "elastic.out(1, 0.45)",
          }, 0.15)
          .to(descRef.current, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 0.3)
          .to(linksRef.current, { y: 0, opacity: 1, duration: 0.75, ease: "elastic.out(1, 0.5)" }, 0.4)
          .to(annotationRef.current, { opacity: 1, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, 0.55)
          .call(() => {
            Draggable.create(gallery, {
              type: "x,y",
              onPress() { gsap.to(this.target, { scale: 1.04, zIndex: 20, duration: 0.2, ease: "power2.out" }); },
              onRelease() { gsap.to(this.target, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.45)" }); },
            });
          });
      },
    });
  }, []);

  return (
    <div ref={containerRef} className="relative md:h-full md:overflow-hidden" style={{ background: "#fff" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, backgroundImage: "radial-gradient(circle, #bbb 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {project.description && (
        <div
          ref={descRef}
          className="hidden md:block"
          style={{ position: "absolute", bottom: 10, left: 10, zIndex: 10, background: "#000", maxWidth: "min(55%, 600px)", borderRadius: 20 }}
        >
          <p style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 500, fontSize: "clamp(1rem, 1.4vw, 1.5rem)", lineHeight: 1.6, color: "#fff", margin: 0, padding: "clamp(14px, 2vw, 28px) clamp(18px, 2.5vw, 36px)" }}>
            {project.description}
          </p>
        </div>
      )}

      {project.gallery && project.gallery.slice(0, 3).map((src, gi) => (
        <div
          key={gi}
          ref={(el) => { galleryRefs.current[gi] = el; }}
          className="hidden md:block"
          style={{ position: "absolute", top: 0, left: 0, width: "clamp(200px, 22vw, 320px)", zIndex: 5, cursor: "grab" }}
        >
          <BrowserFrame src={imgSrc(src)} alt={`${project.title} ${gi + 1}`} />
        </div>
      ))}

      <div
        className="relative md:absolute md:inset-0 md:overflow-hidden overflow-y-auto flex flex-col"
        style={{ zIndex: 2, paddingTop: "clamp(110px, 12vw, 160px)", paddingBottom: "clamp(20px, 3.5vw, 52px)", paddingLeft: "clamp(24px, 4vw, 64px)", paddingRight: "clamp(24px, 4vw, 64px)" }}
      >
        <button
          onClick={() => router.back()}
          className="self-start flex items-center shrink-0"
          style={{ background: "none", border: "none", fontFamily: "Fat, sans-serif", fontSize: "clamp(1rem, 1.5vw, 1.6rem)", cursor: "pointer", color: "#000", marginBottom: "clamp(12px, 2vh, 28px)", padding: 0, gap: 10 }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { x: -10, duration: 0.5, ease: "elastic.out(1, 0.4)" })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" })}
        >
          <svg width="32" height="26" viewBox="0 0 59 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M55.5568 2.5C55.5407 2.5 52.9056 2.52888 47.5125 3.03353C44.7177 3.29505 41.9197 4.43108 39.6653 5.38834C37.411 6.34561 35.8143 7.31043 34.1679 8.44873C32.5215 9.58703 30.8738 10.8696 28.5491 13.254C26.2244 15.6384 23.2727 19.0858 21.1584 21.9017C19.044 24.7176 17.8565 26.7975 16.5126 29.726C15.1688 32.6545 13.7046 36.3685 12.6701 39.4799C11.6356 42.5913 11.0751 44.9876 10.7732 46.3961C10.4713 47.8047 10.4449 48.1529 10.4194 48.5227" stroke="black" strokeWidth="5" strokeLinecap="round"/>
            <path d="M2.5 29.7616C2.52324 30.187 2.71249 31.5564 3.96054 35.1196C5.01472 38.1292 7.13216 43.503 8.22955 46.3453C9.32694 49.1876 9.39351 49.3163 9.49381 49.2462C9.83324 49.0093 10.1496 48.366 13.3893 46.2884C16.3414 44.4676 21.9496 41.0905 24.9457 39.3102C27.9417 37.5299 28.1558 37.4486 28.4467 37.357" stroke="black" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          RETOUR
        </button>

        <div
          ref={titleRef}
          className="hidden md:block"
          style={{ position: "absolute", bottom: "clamp(16px, 2.5vh, 36px)", right: "clamp(24px, 4vw, 64px)", zIndex: 3, fontFamily: "Fat, sans-serif", fontStyle: "italic", fontSize: "clamp(3rem, 8vw, 9rem)", lineHeight: 0.88, fontWeight: 400, textTransform: "uppercase", transform: "rotate(-1.5deg)", transformOrigin: "right bottom", userSelect: "none", wordBreak: "break-word", textAlign: "right", pointerEvents: "none" }}
        >
          {project.title}
        </div>
        <div
          className="shrink-0 md:hidden"
          style={{ fontFamily: "Fat, sans-serif", fontStyle: "italic", fontSize: "clamp(3rem, 8vw, 9rem)", lineHeight: 0.88, fontWeight: 400, textTransform: "uppercase", transform: "rotate(-1.5deg)", transformOrigin: "left center", userSelect: "none", marginBottom: "clamp(16px, 2.5vh, 36px)", wordBreak: "break-word" }}
        >
          {project.title}
        </div>

        <div className="flex-1 flex flex-col min-h-0" style={{ gap: "clamp(12px, 1.8vh, 24px)" }}>
          {project.image && (
            <div ref={imgRef} className="shrink-0" style={{ maxWidth: "min(52%, 560px)" }}>
              <BrowserFrame src={imgSrc(project.image)} alt={project.title} />
            </div>
          )}
          {project.description && (
            <p className="shrink-0 md:hidden" style={{ fontFamily: "Dudu, sans-serif", fontSize: "clamp(0.9rem, 1.2vw, 1.3rem)", lineHeight: 1.55, color: "#111", margin: 0 }}>
              {project.description}
            </p>
          )}
          {project.gallery && project.gallery.length > 0 && (
            <div className="flex flex-col md:hidden" style={{ gap: "clamp(10px, 1.5vh, 20px)" }}>
              {project.gallery.slice(0, 3).map((src, gi) => (
                <div key={gi} className="w-full">
                  <BrowserFrame src={imgSrc(src)} alt={`${project.title} ${gi + 1}`} />
                </div>
              ))}
            </div>
          )}
          <div ref={linksRef} className="shrink-0 flex flex-wrap items-center" style={{ gap: 12 }}>
            {project.projectUrl && (
              <div style={{ position: "relative" }}>
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700, fontSize: "0.95rem", padding: "10px 24px", borderRadius: 100, background: "#000", color: "#fff", textDecoration: "none", letterSpacing: "0.02em", display: "inline-block" }}
                  onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, duration: 0.5, ease: "elastic.out(1, 0.4)" })}
                  onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" })}
                >
                  Voir le projet ↗
                </a>
                <div ref={annotationRef} style={{ position: "absolute", right: -80, top: "calc(100% + 6px)", display: "flex", alignItems: "flex-start", gap: 6, transform: "rotate(-5deg)", pointerEvents: "none", userSelect: "none" }}>
                  <svg width="28" height="24" viewBox="0 0 59 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg) scaleX(-1)" }}>
                    <path d="M55.5568 2.5C55.5407 2.5 52.9056 2.52888 47.5125 3.03353C44.7177 3.29505 41.9197 4.43108 39.6653 5.38834C37.411 6.34561 35.8143 7.31043 34.1679 8.44873C32.5215 9.58703 30.8738 10.8696 28.5491 13.254C26.2244 15.6384 23.2727 19.0858 21.1584 21.9017C19.044 24.7176 17.8565 26.7975 16.5126 29.726C15.1688 32.6545 13.7046 36.3685 12.6701 39.4799C11.6356 42.5913 11.0751 44.9876 10.7732 46.3961C10.4713 47.8047 10.4449 48.1529 10.4194 48.5227" stroke="black" strokeWidth="5" strokeLinecap="round"/>
                    <path d="M2.5 29.7616C2.52324 30.187 2.71249 31.5564 3.96054 35.1196C5.01472 38.1292 7.13216 43.503 8.22955 46.3453C9.32694 49.1876 9.39351 49.3163 9.49381 49.2462C9.83324 49.0093 10.1496 48.366 13.3893 46.2884C16.3414 44.4676 21.9496 41.0905 24.9457 39.3102C27.9417 37.5299 28.1558 37.4486 28.4467 37.357" stroke="black" strokeWidth="5" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontFamily: "Dudu, sans-serif", fontSize: "clamp(1rem, 1.3vw, 1.3rem)", color: "#555", marginTop: 4, marginLeft: -18, display: "inline-block", transform: "rotate(28deg)", WebkitTextStroke: "0.5px #333" }}>c&apos;est par ici !</span>
                </div>
              </div>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 500, fontSize: "0.95rem", color: "#000", textDecoration: "underline", textUnderlineOffset: 3 }}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { x: 4, duration: 0.4, ease: "elastic.out(1, 0.4)" })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" })}
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
