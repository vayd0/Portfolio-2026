"use client";

import { useRef, useEffect, useLayoutEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { type Palette, PALETTE_GRADIENTS } from "./shapes";
import { buildBlobPath, BLOB_AMP } from "@/lib/blobPath";
import BrowserFrame from "./BrowserFrame";

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
  { rx: 0.52, ry: 0.22, rot: -7 },
  { rx: 0.67, ry: 0.42, rot: 5 },
  { rx: 0.56, ry: 0.25, rot: -3 },
];
const imgSrc = (url: string) => `/api/img?url=${encodeURIComponent(url)}`;

type DragState = { startX: number; startY: number; originX: number; originY: number } | null;

export default function ProjetDetailClient({ project, palette }: Props) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const annotationRef = useRef<HTMLDivElement>(null);
  const isExiting = useRef(false);
  const dragStates = useRef<(DragState)[]>([null, null, null]);
  const [clientMounted, setClientMounted] = useState(false);
  const [showGallery, setShowGallery] = useState(true);

  const handleBack = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;
    setShowGallery(false);
    router.back();
  }, [router]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, gi: number) => {
    e.preventDefault();
    const el = galleryRefs.current[gi];
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const originX = (gsap.getProperty(el, "x") as number) || 0;
    const originY = (gsap.getProperty(el, "y") as number) || 0;
    dragStates.current[gi] = { startX: e.clientX, startY: e.clientY, originX, originY };
    gsap.to(el, { scale: 1.04, duration: 0.2, ease: "power2.out" });
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>, gi: number) => {
    const state = dragStates.current[gi];
    const el = galleryRefs.current[gi];
    if (!state || !el) return;
    gsap.set(el, {
      x: state.originX + e.clientX - state.startX,
      y: state.originY + e.clientY - state.startY,
    });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>, gi: number) => {
    dragStates.current[gi] = null;
    const el = galleryRefs.current[gi];
    if (!el) return;
    gsap.to(el, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.45)" });
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.background = PALETTE_GRADIENTS[palette];
    el.style.clipPath = "path('M 0 0 Z')";
  }, [palette]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const base = parseFloat(getComputedStyle(el).fontSize);
    const range = document.createRange();
    range.selectNodeContents(el);
    const naturalW = range.getBoundingClientRect().width;
    const maxW = window.innerWidth * 0.92;
    if (!naturalW || naturalW <= maxW) return;
    el.style.fontSize = `${base * (maxW / naturalW)}px`;
  }, [project.title]);

  useEffect(() => { setClientMounted(true); }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const mounted = { current: true };
    let mainTl: gsap.core.Timeline | null = null;

    gsap.set([titleRef.current, imgRef.current, descRef.current, linksRef.current, annotationRef.current].filter(Boolean), { opacity: 0 });

    el.style.background = PALETTE_GRADIENTS[palette];
    const W = el.offsetWidth;
    const H = el.offsetHeight;
    const cx = W / 2;
    const cy = H / 2;
    const rMax = Math.sqrt(cx * cx + cy * cy) + BLOB_AMP + 10;
    const blobProxy = { r: 0 };
    const phase = { v: 0 };

    const tick = () => {
      if (!mounted.current) return;
      phase.v += 0.035;
      el.style.clipPath = `path('${buildBlobPath(cx, cy, blobProxy.r, phase.v)}')`;
    };
    gsap.ticker.add(tick);

    const openTween = gsap.to(blobProxy, {
      r: rMax, duration: 0.9, ease: "power3.inOut",
      onComplete: () => {
        if (!mounted.current) return;
        gsap.ticker.remove(tick);
        el.style.clipPath = "none";
      },
    });

    const contentTimer = gsap.delayedCall(0.35, () => {
      if (!mounted.current) return;
      const rect = el.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const gallery = galleryRefs.current.filter((x): x is HTMLDivElement => x !== null);

      if (titleRef.current) gsap.set(titleRef.current, { y: 80, opacity: 0 });
      if (imgRef.current) gsap.set(imgRef.current, { scale: 0.93, opacity: 0 });
      if (descRef.current) gsap.set(descRef.current, { y: 28, opacity: 0 });
      if (linksRef.current) gsap.set(linksRef.current, { y: 28, opacity: 0 });
      if (annotationRef.current) gsap.set(annotationRef.current, { opacity: 0, scale: 0.85 });
      if (gallery.length) gsap.set(gallery, {
        x: (i: number) => rect.left + SCATTER[i % SCATTER.length].rx * w,
        y: (i: number) => rect.top + SCATTER[i % SCATTER.length].ry * h - h * 0.6,
        opacity: 0, rotation: 0,
      });

      mainTl = gsap.timeline();
      if (titleRef.current) mainTl.to(titleRef.current, { y: 0, opacity: 1, duration: 0.85, ease: "elastic.out(1, 0.45)" });
      if (imgRef.current) mainTl.to(imgRef.current, { scale: 1, opacity: 1, duration: 0.65, ease: "power3.out" }, 0.1);
      if (gallery.length) mainTl.to(gallery, {
        x: (i: number) => rect.left + SCATTER[i % SCATTER.length].rx * w,
        y: (i: number) => rect.top + SCATTER[i % SCATTER.length].ry * h,
        opacity: 1,
        rotation: (i: number) => SCATTER[i % SCATTER.length].rot,
        stagger: 0.12, duration: 0.95, ease: "elastic.out(1, 0.45)",
      }, 0.15);
      if (descRef.current) mainTl.to(descRef.current, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 0.3);
      if (linksRef.current) mainTl.to(linksRef.current, { y: 0, opacity: 1, duration: 0.75, ease: "elastic.out(1, 0.5)" }, 0.4);
      if (annotationRef.current) mainTl.to(annotationRef.current, { opacity: 1, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, 0.55);
    });

    const imgEl = imgRef.current;
    let qx: ReturnType<typeof gsap.quickTo> | null = null;
    let qy: ReturnType<typeof gsap.quickTo> | null = null;
    if (imgEl) {
      qx = gsap.quickTo(imgEl, "x", { duration: 1.2, ease: "power2.out" });
      qy = gsap.quickTo(imgEl, "y", { duration: 1.2, ease: "power2.out" });
    }

    const handleMove = (e: MouseEvent) => {
      if (isExiting.current || !qx || !qy) return;
      const r = el.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.012);
      qy((e.clientY - r.top - r.height / 2) * 0.008);
    };

    el.addEventListener("mousemove", handleMove);
    return () => {
      mounted.current = false;
      gsap.ticker.remove(tick);
      el.removeEventListener("mousemove", handleMove);
      openTween.kill();
      contentTimer.kill();
      mainTl?.kill();
      gsap.killTweensOf([
        titleRef.current, imgRef.current, descRef.current,
        linksRef.current, annotationRef.current, ...galleryRefs.current,
      ].filter(Boolean));
    };
  }, []);

  return (
    <>
    <div ref={containerRef} className="relative md:h-full md:overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, backgroundImage: "radial-gradient(circle, #bbb 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {project.description && (
        <div
          ref={descRef}
          className="hidden md:block"
          style={{ position: "absolute", bottom: 10, right: 10, zIndex: 10, background: "#000", maxWidth: "min(55%, 600px)", borderRadius: 20 }}
        >
          <p style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 500, fontSize: "clamp(1rem, 1.4vw, 1.5rem)", lineHeight: 1.6, color: "#fff", margin: 0, padding: "clamp(14px, 2vw, 28px) clamp(18px, 2.5vw, 36px)" }}>
            {project.description}
          </p>
        </div>
      )}

      <div
        className="relative md:absolute md:inset-0 md:overflow-y-auto flex flex-col"
        style={{ zIndex: 2, paddingTop: "clamp(110px, 12vw, 160px)", paddingBottom: "clamp(100px, 8vh, 120px)", paddingLeft: "clamp(20px, 4vw, 64px)", paddingRight: "clamp(20px, 4vw, 64px)" }}
      >
        <button
          onClick={handleBack}
          className="self-start flex items-center shrink-0"
          style={{ background: "none", border: "none", fontFamily: "Fat, sans-serif", fontSize: "clamp(1.4rem, 1.5vw, 1.6rem)", cursor: "pointer", color: "#000", marginBottom: "clamp(20px, 3vh, 36px)", padding: 0, gap: 10 }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { x: -10, duration: 0.5, ease: "elastic.out(1, 0.4)" })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" })}
        >
          RETOUR
        </button>

        <div
          ref={titleRef}
          className="hidden md:block"
          style={{ position: "absolute", bottom: "clamp(16px, 2.5vh, 36px)", left: "clamp(24px, 4vw, 64px)", zIndex: 3, fontFamily: "Fat, sans-serif", fontStyle: "italic", fontSize: "clamp(3rem, 8vw, 9rem)", lineHeight: 0.88, fontWeight: 400, textTransform: "uppercase", transformOrigin: "left bottom", userSelect: "none", wordBreak: "break-word", textAlign: "left", pointerEvents: "none" }}
        >
          {project.title}
        </div>
        <div className="flex-1 flex flex-col min-h-0" style={{ gap: "clamp(20px, 3vh, 36px)" }}>
          {project.image && (
            <div ref={imgRef} className="shrink-0 w-full md:max-w-[min(52%,560px)]">
              <BrowserFrame src={imgSrc(project.image)} alt={project.title} />
            </div>
          )}
          <div
            className="shrink-0 md:hidden"
            style={{ fontFamily: "Fat, sans-serif", fontStyle: "italic", fontSize: "clamp(3rem, 8vw, 9rem)", lineHeight: 0.88, fontWeight: 400, textTransform: "uppercase", transform: "rotate(-1.5deg)", transformOrigin: "left center", userSelect: "none", wordBreak: "break-word" }}
          >
            {project.title}
          </div>
          {project.description && (
            <p className="shrink-0 md:hidden" style={{ fontFamily: "Dudu, sans-serif", fontSize: "clamp(1.15rem, 1.2vw, 1.3rem)", lineHeight: 1.6, color: "#111", margin: 0 }}>
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
                <div ref={annotationRef} style={{ position: "absolute", right: "clamp(-100px, -10vw, -180px)", top: "calc(100% + 6px)", display: "flex", alignItems: "flex-start", gap: 6, transform: "rotate(-5deg)", pointerEvents: "none", userSelect: "none" }}>
                  <svg width="clamp(40px, 6vw, 28px)" height="clamp(34px, 5vw, 24px)" viewBox="0 0 59 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "rotate(180deg) scaleX(-1)", width: "clamp(40px, 6vw, 50px)", height: "auto", flexShrink: 0 }}>
                    <path d="M55.5568 2.5C55.5407 2.5 52.9056 2.52888 47.5125 3.03353C44.7177 3.29505 41.9197 4.43108 39.6653 5.38834C37.411 6.34561 35.8143 7.31043 34.1679 8.44873C32.5215 9.58703 30.8738 10.8696 28.5491 13.254C26.2244 15.6384 23.2727 19.0858 21.1584 21.9017C19.044 24.7176 17.8565 26.7975 16.5126 29.726C15.1688 32.6545 13.7046 36.3685 12.6701 39.4799C11.6356 42.5913 11.0751 44.9876 10.7732 46.3961C10.4713 47.8047 10.4449 48.1529 10.4194 48.5227" stroke="#000000" strokeWidth="5" strokeLinecap="round"/>
                    <path d="M2.5 29.7616C2.52324 30.187 2.71249 31.5564 3.96054 35.1196C5.01472 38.1292 7.13216 43.503 8.22955 46.3453C9.32694 49.1876 9.39351 49.3163 9.49381 49.2462C9.83324 49.0093 10.1496 48.366 13.3893 46.2884C16.3414 44.4676 21.9496 41.0905 24.9457 39.3102C27.9417 37.5299 28.1558 37.4486 28.4467 37.357" stroke="#000000" strokeWidth="5" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontFamily: "Dudu, sans-serif", fontSize: "clamp(1.1rem, 1.3vw, 1.3rem)", color: "#000000", marginTop: 20, marginLeft: -18, display: "inline-block", transform: "rotate(28deg)", WebkitTextStroke: "0.5px #000000" }}>c&apos;est par ici !</span>
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
    {clientMounted && showGallery && project.gallery && project.gallery.slice(0, 3).map((src, gi) => (
      <div
        key={gi}
        ref={(el) => { galleryRefs.current[gi] = el; }}
        className="hidden md:block"
        style={{ position: "fixed", top: 0, left: 0, width: "clamp(200px, 22vw, 320px)", zIndex: 5, cursor: "grab", touchAction: "none", opacity: 0 }}
        onPointerDown={(e) => handlePointerDown(e, gi)}
        onPointerMove={(e) => handlePointerMove(e, gi)}
        onPointerUp={(e) => handlePointerUp(e, gi)}
        onPointerCancel={(e) => handlePointerUp(e, gi)}
      >
        <BrowserFrame src={imgSrc(src)} alt={`${project.title} ${gi + 1}`} />
      </div>
    ))}
    </>
  );
}
