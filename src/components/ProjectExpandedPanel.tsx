"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import ProjectMockup from "@/components/ProjectMockup";
import ProjectTitle from "@/components/ProjectTitle";
import ParallaxShape from "@/components/ParallaxShape";
import { Circle, Triangle, Arrow, ArrowDraw, drawCircle } from "@/components/shapes";
import styles from "@/app/page.module.css";

interface Props {
  project: {
    _id: string;
    title: string;
    image?: string;
    gallery?: string[];
    description?: string;
    url?: string;
    projectUrl?: string;
    github?: string;
  };
  rotation: number;
  shapeConfig: {
    circle: { depthX: number; depthY: number; enterX: number; enterY: number; enterRotation: number; enterDelay: number; className: string; style: React.CSSProperties; mobileStyle?: React.CSSProperties };
    triangle: { depthX: number; depthY: number; enterX: number; enterY: number; enterRotation: number; enterDelay: number; className: string; style: React.CSSProperties; mobileStyle?: React.CSSProperties };
    arrow: { depthX: number; depthY: number; enterX: number; enterY: number; enterRotation: number; enterDelay: number; className: string; style: React.CSSProperties; mobileStyle?: React.CSSProperties; flipY?: boolean };
  };
}

function VisitButton({ href }: { href: string }) {
  const btnRef = useRef<HTMLAnchorElement>(null);

  const onEnter = () => {
    gsap.to(btnRef.current, { scale: 1.12, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };

  const onLeave = () => {
    gsap.to(btnRef.current, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <a
      ref={btnRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ position: "relative", display: "inline-flex", textDecoration: "none", color: "#000000", cursor: "pointer" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {drawCircle()}
      <span style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontFamily: "Dudu, sans-serif",
        fontSize: "clamp(1rem, 1.3vw, 1.5rem)",
      }}>
        Visiter <ArrowDraw />
      </span>
    </a>
  );
}

export default function ProjectExpandedPanel({ project, rotation, shapeConfig }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const mockupWrapRef = useRef<HTMLDivElement>(null);
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRef = useRef<HTMLDivElement>(null);
  const descWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const linksRef = useRef<HTMLDivElement>(null);

  const isMobile = () => window.innerWidth < 768;

  const closePanel = () => {
    if (!open) return;
    if (rightRef.current) rightRef.current.style.overflow = "hidden";
    const gallery = galleryRefs.current.filter(Boolean);
    const tl = gsap.timeline({ onComplete: () => setOpen(false) });
    const descWords = descWordRefs.current.filter(Boolean);

    if (isMobile()) {
      tl
        .to(linksRef.current, { opacity: 0, y: 20, duration: 0.15, ease: "power2.in" }, 0)
        .to(descWords, { y: "115%", stagger: { each: 0.012, from: "end" }, duration: 0.22, ease: "power3.in" }, 0)
        .to([...gallery].reverse(), { opacity: 0, scale: 0.7, y: -40, stagger: 0.05, duration: 0.2, ease: "power3.in" }, 0)
        .to(rightRef.current, { height: 0, duration: 0.4, ease: "power3.in" }, 0.1)
        .to(leftRef.current, { height: "100dvh", duration: 0.65, ease: "elastic.out(1, 0.5)" }, 0.15);
    } else {
      tl
        .to(linksRef.current, { opacity: 0, y: 20, duration: 0.15, ease: "power2.in" }, 0)
        .to(descWords, { y: "115%", stagger: { each: 0.012, from: "end" }, duration: 0.22, ease: "power3.in" }, 0)
        .to([...gallery].reverse(), { opacity: 0, scale: 0.7, y: -40, stagger: 0.05, duration: 0.2, ease: "power3.in" }, 0)
        .to(rightRef.current, { width: 0, duration: 0.4, ease: "power3.in" }, 0.1)
        .to(leftRef.current, { width: "100dvw", duration: 0.65, ease: "elastic.out(1, 0.5)" }, 0.15)
        .to(mockupWrapRef.current, { scaleX: 1.06, scaleY: 0.88, duration: 0.1, ease: "power3.in" }, 0.15)
        .to(mockupWrapRef.current, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.45)" }, 0.25);
    }
  };

  useEffect(() => {
    if (!panelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting && open) closePanel(); },
      { threshold: 0.4 }
    );
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mobile = isMobile();
    const gallery = galleryRefs.current.filter(Boolean);
    const galleryRotations = [-12, 6, -4];
    const descWords = descWordRefs.current.filter(Boolean);

    gsap.set(gallery, { opacity: 0, scale: 0.4, y: -100, rotation: 0 });
    gsap.set(descWords, { y: "115%" });
    gsap.set(linksRef.current, { opacity: 0, y: 30 });

    const tl = gsap.timeline();

    if (mobile) {
      tl
        .to(mockupWrapRef.current, { scaleY: 0.85, scaleX: 1.08, duration: 0.12, ease: "power3.in" })
        .to(mockupWrapRef.current, { scaleY: 1.12, scaleX: 0.92, duration: 0.14, ease: "power2.out" })
        .to(mockupWrapRef.current, { scaleY: 1, scaleX: 1, duration: 0.9, ease: "elastic.out(1, 0.38)" })
        .to(leftRef.current, { height: "42dvh", duration: 0.7, ease: "elastic.out(1, 0.45)" }, 0)
        .to(rightRef.current, { height: "50dvh", duration: 0.6, ease: "power3.out", onComplete: () => { if (rightRef.current) rightRef.current.style.overflow = "visible"; } }, 0.1)
        .to(gallery, {
          opacity: 1, scale: 1, y: 0,
          rotation: (i) => galleryRotations[i] ?? 0,
          stagger: 0.1, duration: 0.8, ease: "elastic.out(1, 0.45)",
        }, "-=0.3")
        .to(descWords, { y: "0%", stagger: 0.022, duration: 0.65, ease: "power4.out" }, "-=0.4")
        .to(linksRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" }, "-=0.3");
    } else {
      tl
        .to(mockupWrapRef.current, { scaleY: 0.85, scaleX: 1.08, duration: 0.12, ease: "power3.in" })
        .to(mockupWrapRef.current, { scaleY: 1.12, scaleX: 0.92, duration: 0.14, ease: "power2.out" })
        .to(mockupWrapRef.current, { scaleY: 1, scaleX: 1, duration: 0.9, ease: "elastic.out(1, 0.38)" })
        .to(leftRef.current, { width: "42vw", duration: 0.8, ease: "elastic.out(1, 0.45)" }, 0)
        .to(rightRef.current, { width: "58vw", duration: 0.9, ease: "elastic.out(1, 0.42)", onComplete: () => { if (rightRef.current) rightRef.current.style.overflow = "visible"; } }, 0.1)
        .to(gallery, {
          opacity: 1, scale: 1, y: 0,
          rotation: (i) => galleryRotations[i] ?? 0,
          stagger: 0.1, duration: 1.0, ease: "elastic.out(1, 0.45)",
        }, "-=0.5")
        .to(descWords, { y: "0%", stagger: 0.022, duration: 0.65, ease: "power4.out" }, "-=0.4")
        .to(linksRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" }, "-=0.3");
    }
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="relative shrink-0 flex flex-col md:flex-row panel-height"
      style={{ width: "100dvw", position: "relative", zIndex: 2 }}
    >
      <ParallaxShape depthX={shapeConfig.circle.depthX} depthY={shapeConfig.circle.depthY} enterX={shapeConfig.circle.enterX} enterY={shapeConfig.circle.enterY} enterRotation={shapeConfig.circle.enterRotation} enterDelay={shapeConfig.circle.enterDelay} className={shapeConfig.circle.className} style={{ zIndex: 1, ...shapeConfig.circle.style }} mobileStyle={shapeConfig.circle.mobileStyle}>
        <Circle />
      </ParallaxShape>
      <ParallaxShape depthX={shapeConfig.triangle.depthX} depthY={shapeConfig.triangle.depthY} enterX={shapeConfig.triangle.enterX} enterY={shapeConfig.triangle.enterY} enterRotation={shapeConfig.triangle.enterRotation} enterDelay={shapeConfig.triangle.enterDelay} className={shapeConfig.triangle.className} style={{ zIndex: 1, ...shapeConfig.triangle.style }} mobileStyle={shapeConfig.triangle.mobileStyle}>
        <Triangle />
      </ParallaxShape>
      <ParallaxShape depthX={shapeConfig.arrow.depthX} depthY={shapeConfig.arrow.depthY} enterX={shapeConfig.arrow.enterX} enterY={shapeConfig.arrow.enterY} enterRotation={shapeConfig.arrow.enterRotation} enterDelay={shapeConfig.arrow.enterDelay} className={shapeConfig.arrow.className} style={{ zIndex: 1, ...shapeConfig.arrow.style }} mobileStyle={shapeConfig.arrow.mobileStyle}>
        <div style={shapeConfig.arrow.flipY ? { transform: "scaleY(-1)" } : undefined}>
          <Arrow />
        </div>
      </ParallaxShape>

      <div ref={leftRef} className="expanded-left">
        <div
          ref={mockupWrapRef}
          onClick={open ? closePanel : () => setOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <ProjectMockup image={project.image} title={project.title} rotation={rotation} freeze={open} />
        </div>
      </div>

      <div
        className="absolute top-4 right-4 md:top-auto md:right-auto md:bottom-8 md:left-12"
        style={{ zIndex: 4 }}
        onClick={open ? closePanel : () => setOpen(true)}
      >
        <ProjectTitle title={project.title} className={styles.projectTitle} />
      </div>

      <div ref={rightRef} className="expanded-right">
        <div
          className="expanded-right-inner"
          style={{ paddingTop: "clamp(24px, 4vw, 80px)", paddingBottom: "clamp(24px, 4vw, 80px)" }}
        >
          <div style={{ display: "flex", gap: "clamp(8px, 1vw, 16px)", marginBottom: "clamp(20px, 3vh, 40px)", flexWrap: "wrap" }}>
            {(project.gallery ?? []).slice(0, 3).map((src, i) => (
              <div
                key={src}
                ref={(el) => { galleryRefs.current[i] = el; }}
                style={{
                  width: "30%",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  flexShrink: 0,
                  minWidth: 0,
                }}
              >
                <img src={src} alt={`${project.title} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
              </div>
            ))}
          </div>

          <div ref={descRef} style={{ fontFamily: "Dudu, sans-serif", fontSize: "clamp(1.15rem, 1.4vw, 1.6rem)", lineHeight: 1.5, maxWidth: "min(480px, 100%)", marginTop: "clamp(16px, 3vh, 40px)", marginBottom: "clamp(16px, 2.5vh, 32px)", display: "flex", flexWrap: "wrap", gap: "0.28em", alignContent: "flex-start" }}>
            {(project.description ?? "").split(" ").map((word, i) => (
              <span key={i} style={{ display: "inline-block", overflow: "hidden", lineHeight: 1.6 }}>
                <span
                  ref={(el) => { descWordRefs.current[i] = el; }}
                  style={{ display: "inline-block" }}
                >
                  {word}
                </span>
              </span>
            ))}
          </div>

          <div ref={linksRef} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {(project.projectUrl ?? project.url) && (
              <VisitButton href={(project.projectUrl ?? project.url)!} />
            )}
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: "#000000" }}>
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
