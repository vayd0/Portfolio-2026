"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import ProjectMockup from "@/components/ProjectMockup";
import ProjectTitle from "@/components/ProjectTitle";
import ParallaxShape from "@/components/ParallaxShape";
import { Circle, Triangle, Arrow } from "@/components/shapes";
import styles from "@/app/page.module.css";

interface Props {
  project: {
    _id: string;
    title: string;
    image?: string;
    gallery?: string[];
    description?: string;
    url?: string;
    github?: string;
  };
  rotation: number;
  shapeConfig: {
    circle: { depthX: number; depthY: number; enterX: number; enterY: number; enterRotation: number; enterDelay: number };
    triangle: { depthX: number; depthY: number; enterX: number; enterY: number; enterRotation: number; enterDelay: number };
    arrow: { depthX: number; depthY: number; enterX: number; enterY: number; enterRotation: number; enterDelay: number };
  };
}

export default function ProjectExpandedPanel({ project, rotation, shapeConfig }: Props) {
  const [open, setOpen] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const mockupWrapRef = useRef<HTMLDivElement>(null);
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const closePanel = () => {
    if (!open) return;
    const gallery = galleryRefs.current.filter(Boolean);
    const tl = gsap.timeline({ onComplete: () => setOpen(false) });
    tl
      .to(linksRef.current, { opacity: 0, y: 20, duration: 0.15, ease: "power2.in" }, 0)
      .to(descRef.current, { opacity: 0, y: 10, duration: 0.15, ease: "power2.in" }, 0)
      .to([...gallery].reverse(), { opacity: 0, scale: 0.7, y: -40, stagger: 0.05, duration: 0.2, ease: "power3.in" }, 0)
      .to(rightRef.current, { width: 0, duration: 0.4, ease: "power3.in" }, 0.1)
      .to(leftRef.current, { width: "100dvw", duration: 0.65, ease: "elastic.out(1, 0.5)" }, 0.15)
      .to(mockupWrapRef.current, { scaleX: 1.06, scaleY: 0.88, duration: 0.1, ease: "power3.in" }, 0.15)
      .to(mockupWrapRef.current, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.45)" }, 0.25);
  };

  useEffect(() => {
    if (!open) return;

    const gallery = galleryRefs.current.filter(Boolean);
    const galleryRotations = [-12, 6, -4];

    gsap.set(gallery, { opacity: 0, scale: 0.4, y: -100, rotation: 0 });
    gsap.set(descRef.current, { opacity: 0, y: 40 });
    gsap.set(linksRef.current, { opacity: 0, y: 30 });

    const tl = gsap.timeline();
    tl
      .to(mockupWrapRef.current, { scaleY: 0.85, scaleX: 1.08, duration: 0.12, ease: "power3.in" })
      .to(mockupWrapRef.current, { scaleY: 1.12, scaleX: 0.92, duration: 0.14, ease: "power2.out" })
      .to(mockupWrapRef.current, { scaleY: 1, scaleX: 1, duration: 0.9, ease: "elastic.out(1, 0.38)" })
      .to(leftRef.current, { width: "42vw", duration: 0.8, ease: "elastic.out(1, 0.45)" }, 0)
      .to(rightRef.current, { width: "58vw", duration: 0.9, ease: "elastic.out(1, 0.42)" }, 0.1)
      .to(gallery, {
        opacity: 1,
        scale: 1,
        y: 0,
        rotation: (i) => galleryRotations[i] ?? 0,
        stagger: 0.1,
        duration: 1.0,
        ease: "elastic.out(1, 0.45)",
      }, "-=0.5")
      .to(descRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.4")
      .to(linksRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" }, "-=0.3");
  }, [open]);

  return (
    <div
      className="relative shrink-0 bg-white flex"
      style={{ width: "100dvw", height: "100dvh" }}
    >
      <ParallaxShape depthX={shapeConfig.circle.depthX} depthY={shapeConfig.circle.depthY} enterX={shapeConfig.circle.enterX} enterY={shapeConfig.circle.enterY} enterRotation={shapeConfig.circle.enterRotation} enterDelay={shapeConfig.circle.enterDelay} className="absolute top-1/2 -translate-y-1/2" style={{ left: -30, zIndex: 2 }}>
        <Circle />
      </ParallaxShape>
      <ParallaxShape depthX={shapeConfig.triangle.depthX} depthY={shapeConfig.triangle.depthY} enterX={shapeConfig.triangle.enterX} enterY={shapeConfig.triangle.enterY} enterRotation={shapeConfig.triangle.enterRotation} enterDelay={shapeConfig.triangle.enterDelay} className="absolute top-0 right-0" style={{ marginTop: -60, marginRight: -60, zIndex: 10 }}>
        <Triangle />
      </ParallaxShape>
      <ParallaxShape depthX={shapeConfig.arrow.depthX} depthY={shapeConfig.arrow.depthY} enterX={shapeConfig.arrow.enterX} enterY={shapeConfig.arrow.enterY} enterRotation={shapeConfig.arrow.enterRotation} enterDelay={shapeConfig.arrow.enterDelay} className="absolute bottom-0 right-0" style={{ marginBottom: -40, marginRight: -20, zIndex: 10 }}>
        <Arrow />
      </ParallaxShape>

      <div
        ref={leftRef}
        style={{
          width: "100dvw",
          height: "100%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div
          ref={mockupWrapRef}
          onClick={open ? closePanel : () => setOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <ProjectMockup image={project.image} title={project.title} rotation={rotation} />
        </div>

        <div
          className="absolute bottom-8 left-12"
          style={{ zIndex: 10 }}
          onClick={open ? closePanel : () => setOpen(true)}
        >
          <ProjectTitle title={project.title} className={styles.projectTitle} />
        </div>
      </div>

      <div
        ref={rightRef}
        style={{
          width: 0,
          height: "100%",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "58vw",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 4vw",
          }}
        >
          <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
            {(project.gallery ?? []).slice(0, 3).map((src, i) => (
              <div
                key={src}
                ref={(el) => { galleryRefs.current[i] = el; }}
                style={{
                  width: "30%",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img src={src} alt={`${project.title} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
              </div>
            ))}
          </div>

          <div ref={descRef} style={{ fontFamily: "Dudu, sans-serif", fontSize: "clamp(1rem, 1.4vw, 1.6rem)", lineHeight: 1.5, maxWidth: 480, marginBottom: 32 }}>
            {project.description}
          </div>

          <div ref={linksRef} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "Dudu, sans-serif",
                  fontSize: "clamp(0.9rem, 1.2vw, 1.4rem)",
                  border: "2px solid #202020",
                  borderRadius: 999,
                  padding: "8px 24px",
                  textDecoration: "none",
                  color: "#202020",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Visiter ↗
              </a>
            )}
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: "#202020" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
