"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import Card from "./Card";
import FallIn from "./FallIn";
import ParallaxShape from "./ParallaxShape";
import { Circle, Triangle, Arrow, type Palette } from "./shapes";

type Project = {
  _id: string;
  title: string;
  image?: string;
  gallery?: string[];
  description?: string;
  projectUrl?: string;
  github?: string;
  color?: string;
};

const GALLERY_ROTATIONS = [-8, 5, -4];

export default function ProjetsClient({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState<Palette>(0);
  const [isMobile, setIsMobile] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const circleProxy = useRef({ r: 0 });
  const titleRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const annotationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.style.display = "none";
    el.style.pointerEvents = "none";
  }, []);

  const animateCircle = (from: number, to: number, duration: number, ease: string, origin: string, onDone?: () => void) => {
    const el = panelRef.current;
    if (!el) return;
    circleProxy.current.r = from;
    gsap.killTweensOf(circleProxy.current);
    gsap.to(circleProxy.current, {
      r: to, duration, ease,
      onUpdate: () => { el.style.clipPath = `circle(${circleProxy.current.r}vmax at ${origin})`; },
      onComplete: onDone,
    });
  };

  const openPanel = useCallback((project: Project, cardEl: HTMLElement, index: number) => {
    galleryRefs.current = [];
    const rect = cardEl.getBoundingClientRect();
    const origin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
    const pal = (index % 3) as Palette;
    setSelected(project);
    setPalette(pal);
    const el = panelRef.current;
    if (!el) return;
    el.style.display = "block";
    el.style.pointerEvents = "auto";
    el.style.clipPath = `circle(0vmax at ${origin})`;
    animateCircle(0, 200, 0.8, "power3.inOut", origin, () => setOpen(true));
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    const gallery = galleryRefs.current.filter(Boolean);
    gsap.to([...gallery].reverse(), { y: -80, opacity: 0, stagger: 0.05, duration: 0.16, ease: "power3.in" });
    gsap.to([linksRef.current, descRef.current, annotationRef.current], { y: 20, opacity: 0, duration: 0.12, ease: "power2.in" });
    gsap.to(titleRef.current, { y: -50, opacity: 0, duration: 0.18, ease: "power3.in" });
    gsap.delayedCall(0.2, () => {
      animateCircle(200, 0, 0.6, "power3.inOut", "50% 50%", () => {
        const el = panelRef.current;
        if (el) { el.style.display = "none"; el.style.pointerEvents = "none"; }
        setSelected(null);
      });
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const gallery = galleryRefs.current.filter(Boolean);
    gsap.set(titleRef.current, { y: 80, opacity: 0 });
    gsap.set(imgRef.current, { scale: 0.93, opacity: 0 });
    gsap.set(gallery, { y: -window.innerHeight * 0.55, opacity: 0, rotation: 0 });
    gsap.set(descRef.current, { y: 28, opacity: 0 });
    gsap.set(linksRef.current, { y: 28, opacity: 0 });
    gsap.set(annotationRef.current, { opacity: 0, scale: 0.85 });

    const tl = gsap.timeline();
    tl.to(titleRef.current, { y: 0, opacity: 1, duration: 0.85, ease: "elastic.out(1, 0.45)" })
      .to(imgRef.current, { scale: 1, opacity: 1, duration: 0.65, ease: "power3.out" }, 0.1)
      .to(gallery, {
        y: 0, opacity: 1,
        rotation: (i: number) => GALLERY_ROTATIONS[i % GALLERY_ROTATIONS.length],
        stagger: 0.1, duration: 0.95, ease: "elastic.out(1, 0.45)",
      }, 0.15)
      .to(descRef.current, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 0.3)
      .to(linksRef.current, { y: 0, opacity: 1, duration: 0.75, ease: "elastic.out(1, 0.5)" }, 0.4)
      .to(annotationRef.current, { opacity: 1, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, 0.55);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) closePanel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closePanel]);

  const imgSrc = (url: string) => `/api/img?url=${encodeURIComponent(url)}`;

  const RetourBtn = () => (
    <button
      onClick={closePanel}
      style={{
        flexShrink: 0,
        background: "none",
        border: "none",
        fontFamily: "Fat, sans-serif",
        fontSize: "clamp(1rem, 1.5vw, 1.6rem)",
        cursor: "pointer",
        color: "#000",
        marginBottom: "clamp(12px, 2vh, 28px)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 0,
      }}
      onMouseEnter={(e) => gsap.to(e.currentTarget, { x: -10, duration: 0.5, ease: "elastic.out(1, 0.4)" })}
      onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" })}
    >
      <svg width="32" height="26" viewBox="0 0 59 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M55.5568 2.5C55.5407 2.5 52.9056 2.52888 47.5125 3.03353C44.7177 3.29505 41.9197 4.43108 39.6653 5.38834C37.411 6.34561 35.8143 7.31043 34.1679 8.44873C32.5215 9.58703 30.8738 10.8696 28.5491 13.254C26.2244 15.6384 23.2727 19.0858 21.1584 21.9017C19.044 24.7176 17.8565 26.7975 16.5126 29.726C15.1688 32.6545 13.7046 36.3685 12.6701 39.4799C11.6356 42.5913 11.0751 44.9876 10.7732 46.3961C10.4713 47.8047 10.4449 48.1529 10.4194 48.5227" stroke="black" strokeWidth="5" strokeLinecap="round"/>
        <path d="M2.5 29.7616C2.52324 30.187 2.71249 31.5564 3.96054 35.1196C5.01472 38.1292 7.13216 43.503 8.22955 46.3453C9.32694 49.1876 9.39351 49.3163 9.49381 49.2462C9.83324 49.0093 10.1496 48.366 13.3893 46.2884C16.3414 44.4676 21.9496 41.0905 24.9457 39.3102C27.9417 37.5299 28.1558 37.4486 28.4467 37.357" stroke="black" strokeWidth="5" strokeLinecap="round"/>
      </svg>
      RETOUR
    </button>
  );

  const AnnotationEl = () => (
    <div
      ref={annotationRef}
      style={{
        position: "absolute",
        left: -8,
        top: "calc(100% + 6px)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transform: "rotate(5deg)",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <svg width="28" height="24" viewBox="0 0 59 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(-60deg) scaleX(-1)" }}>
        <path d="M55.5568 2.5C55.5407 2.5 52.9056 2.52888 47.5125 3.03353C44.7177 3.29505 41.9197 4.43108 39.6653 5.38834C37.411 6.34561 35.8143 7.31043 34.1679 8.44873C32.5215 9.58703 30.8738 10.8696 28.5491 13.254C26.2244 15.6384 23.2727 19.0858 21.1584 21.9017C19.044 24.7176 17.8565 26.7975 16.5126 29.726C15.1688 32.6545 13.7046 36.3685 12.6701 39.4799C11.6356 42.5913 11.0751 44.9876 10.7732 46.3961C10.4713 47.8047 10.4449 48.1529 10.4194 48.5227" stroke="black" strokeWidth="5" strokeLinecap="round"/>
        <path d="M2.5 29.7616C2.52324 30.187 2.71249 31.5564 3.96054 35.1196C5.01472 38.1292 7.13216 43.503 8.22955 46.3453C9.32694 49.1876 9.39351 49.3163 9.49381 49.2462C9.83324 49.0093 10.1496 48.366 13.3893 46.2884C16.3414 44.4676 21.9496 41.0905 24.9457 39.3102C27.9417 37.5299 28.1558 37.4486 28.4467 37.357" stroke="black" strokeWidth="5" strokeLinecap="round"/>
      </svg>
      <span style={{ fontFamily: "Dudu, sans-serif", fontSize: "clamp(0.8rem, 1vw, 1rem)", color: "#555" }}>
        c&apos;est par ici !
      </span>
    </div>
  );

  const Links = () => (
    <div ref={linksRef} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", position: "relative" }}>
      {selected?.projectUrl && (
        <a
          href={selected.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700, fontSize: "0.95rem", padding: "10px 24px", borderRadius: 100, background: "#000", color: "#fff", textDecoration: "none", letterSpacing: "0.02em" }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, duration: 0.5, ease: "elastic.out(1, 0.4)" })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" })}
        >
          Voir le projet ↗
        </a>
      )}
      {selected?.github && (
        <a
          href={selected.github}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 500, fontSize: "0.95rem", color: "#000", textDecoration: "underline", textUnderlineOffset: 3 }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { x: 4, duration: 0.4, ease: "elastic.out(1, 0.4)" })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" })}
        >
          GitHub ↗
        </a>
      )}
      {selected?.projectUrl && <AnnotationEl />}
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap justify-start gap-12 px-16 py-20">
        {projects.map((project, i) => (
          <FallIn key={project._id} delay={i * 0.05}>
            <div className="w-[380px] shrink-0" style={{ cursor: "pointer" }} onClick={(e) => openPanel(project, e.currentTarget, i)}>
              <Card title={project.title} image={project.image} color={project.color} index={i} />
            </div>
          </FallIn>
        ))}
      </div>

      <div ref={panelRef} style={{ position: "fixed", inset: 0, zIndex: 200, background: "#fff" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
          <ParallaxShape depthX={0.06} depthY={0.05} className="absolute" style={{ top: "-8%", right: "-10%", width: "clamp(240px, 30vw, 480px)" }}>
            <Circle palette={palette} />
          </ParallaxShape>
          <ParallaxShape depthX={0.04} depthY={0.06} className="absolute" style={{ bottom: "-12%", left: "-6%", width: "clamp(200px, 25vw, 380px)" }}>
            <Triangle palette={palette} />
          </ParallaxShape>
          <ParallaxShape depthX={0.07} depthY={0.03} className="absolute" style={{ top: "35%", right: "2%", width: "clamp(160px, 18vw, 300px)" }}>
            <div style={{ transform: "scaleY(-1)" }}><Arrow palette={palette} /></div>
          </ParallaxShape>
        </div>

        {isMobile ? (
          <div style={{ position: "absolute", inset: 0, overflowY: "auto", zIndex: 2 }}>
            <div style={{ padding: "clamp(20px, 6vw, 48px)", display: "flex", flexDirection: "column", gap: 24 }}>
              <RetourBtn />
              {selected && (
                <>
                  <div ref={titleRef} style={{ fontFamily: "Fat, sans-serif", fontStyle: "italic", fontSize: "clamp(4rem, 14vw, 9rem)", lineHeight: 0.88, fontWeight: 400, textTransform: "uppercase", transform: "rotate(-2deg)", transformOrigin: "left center", userSelect: "none", wordBreak: "break-word" }}>
                    {selected.title}
                  </div>
                  {selected.image && (
                    <div ref={imgRef} style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden" }}>
                      <img src={imgSrc(selected.image)} alt={selected.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  )}
                  {selected.description && (
                    <p ref={descRef} style={{ fontFamily: "Dudu, sans-serif", fontSize: "clamp(1rem, 4vw, 1.3rem)", lineHeight: 1.6, color: "#111", margin: 0 }}>
                      {selected.description}
                    </p>
                  )}
                  <Links />
                  {selected.gallery && selected.gallery.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {selected.gallery.slice(0, 3).map((src, gi) => (
                        <div key={gi} ref={(el) => { galleryRefs.current[gi] = el; }} style={{ width: "100%", aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", boxShadow: "0 6px 24px rgba(0,0,0,0.10)" }}>
                          <img src={imgSrc(src)} alt={`${selected.title} ${gi + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 2, display: "flex", flexDirection: "column", padding: "clamp(20px, 3.5vw, 52px) clamp(24px, 4vw, 64px)" }}>
            <RetourBtn />
            {selected && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div
                  ref={titleRef}
                  style={{
                    flexShrink: 0,
                    fontFamily: "Fat, sans-serif",
                    fontStyle: "italic",
                    fontSize: "clamp(3rem, 7vw, 9rem)",
                    lineHeight: 0.88,
                    fontWeight: 400,
                    textTransform: "uppercase",
                    transform: "rotate(-1.5deg)",
                    transformOrigin: "left center",
                    userSelect: "none",
                    marginBottom: "clamp(16px, 2.5vh, 36px)",
                    wordBreak: "break-word",
                  }}
                >
                  {selected.title}
                </div>

                <div style={{ flex: 1, display: "flex", gap: "clamp(20px, 3vw, 52px)", minHeight: 0 }}>
                  <div style={{ flex: "0 0 52%", display: "flex", flexDirection: "column", gap: "clamp(12px, 1.8vh, 24px)", minHeight: 0 }}>
                    {selected.image && (
                      <div ref={imgRef} style={{ flex: 1, minHeight: 0, borderRadius: 12, overflow: "hidden" }}>
                        <img src={imgSrc(selected.image)} alt={selected.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                    )}
                    {selected.description && (
                      <p ref={descRef} style={{ flexShrink: 0, fontFamily: "Dudu, sans-serif", fontSize: "clamp(0.9rem, 1.2vw, 1.3rem)", lineHeight: 1.55, color: "#111", margin: 0 }}>
                        {selected.description}
                      </p>
                    )}
                    <Links />
                  </div>

                  {selected.gallery && selected.gallery.length > 0 && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "clamp(10px, 1.5vh, 20px)", minHeight: 0 }}>
                      {selected.gallery.slice(0, 2).map((src, gi) => (
                        <div key={gi} ref={(el) => { galleryRefs.current[gi] = el; }} style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: "hidden", boxShadow: "0 6px 24px rgba(0,0,0,0.10)" }}>
                          <img src={imgSrc(src)} alt={`${selected.title} ${gi + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
