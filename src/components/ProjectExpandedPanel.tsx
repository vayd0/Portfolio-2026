"use client";

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { buildBlobPath, BLOB_AMP } from "@/lib/blobPath";
import gsap from "gsap";
import { subscribeVel } from "@/lib/velBus";
import SlimeImage from "@/components/SlimeImage";
import ProjectTitle, { type ProjectTitleHandle } from "@/components/ProjectTitle";
import ProjectMockup, { type ProjectMockupHandle } from "@/components/ProjectMockup";
import ParallaxShape from "@/components/ParallaxShape";
import { Circle, Triangle, Arrow, PALETTE_GRADIENTS, type Palette } from "@/components/shapes";
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
    circle: { depthX: number; depthY: number; className: string; style: React.CSSProperties; mobileStyle?: React.CSSProperties };
    triangle: { depthX: number; depthY: number; className: string; style: React.CSSProperties; mobileStyle?: React.CSSProperties };
    arrow: { depthX: number; depthY: number; className: string; style: React.CSSProperties; mobileStyle?: React.CSSProperties; flipY?: boolean };
  };
  overlayRef: React.RefObject<HTMLDivElement | null>;
  spawnBall?: () => void;
  setBallBlack?: (black: boolean) => void;
  titlePosition?: "bottom-left" | "top-right";
  palette?: Palette;
  mockupOffsetY?: number;
  mockupOffsetYMobile?: number;
  annotationPosition?: "top" | "bottom";
  annotationOffsetY?: number;
  panelZIndex?: number;
}


interface VisitButtonHandle { triggerOpen: () => void; triggerClose: () => void; }

const VisitButton = forwardRef<VisitButtonHandle, { href: string; open: boolean }>(function VisitButton({ href, open }, handle) {
  const blobRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const velWrapRef = useRef<HTMLDivElement>(null);
  const radiusProxy = useRef({ r: 0 });
  const phaseRef = useRef(0);
  const tickerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = velWrapRef.current;
    if (!el) return;
    return subscribeVel((v) => {
      const skew = v * 0.4;
      const sy = 1 - Math.abs(v) * 0.003;
      el.style.transform = `skewX(${skew}deg) scaleY(${sy})`;
    });
  }, []);

  const stopTicker = useCallback(() => {
    if (tickerRef.current) { gsap.ticker.remove(tickerRef.current); tickerRef.current = null; }
    if (blobRef.current) blobRef.current.style.clipPath = "circle(0%)";
  }, []);

  const triggerOpen = useCallback(() => {
    const el = blobRef.current;
    if (!el) return;
    const cx = el.offsetWidth / 2;
    const cy = el.offsetHeight / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy) + BLOB_AMP + 10;
    if (!tickerRef.current) {
      const tick = () => {
        phaseRef.current += 0.04;
        el.style.clipPath = `path('${buildBlobPath(cx, cy, radiusProxy.current.r, phaseRef.current)}')`;
      };
      gsap.ticker.add(tick);
      tickerRef.current = tick;
    }
    gsap.fromTo(radiusProxy.current, { r: 0 }, { r: maxR, duration: 0.65, ease: "elastic.out(1, 0.45)" });
  }, [stopTicker]);

  const triggerClose = useCallback(() => {
    gsap.killTweensOf(radiusProxy.current);
    gsap.to(radiusProxy.current, { r: 0, duration: 1, ease: "elastic.in(1, 0.45)", onComplete: stopTicker });
  }, [stopTicker]);

  useImperativeHandle(handle, () => ({ triggerOpen, triggerClose }), [triggerOpen, triggerClose]);

  const onMouseEnter = () => {
    gsap.killTweensOf(textRef.current);
    gsap.killTweensOf(btnRef.current);
    gsap.timeline()
      .to(textRef.current, { x: 80, skewX: 20, duration: 0.22, ease: "power3.in" })
      .set(textRef.current, { x: -80, skewX: 20 })
      .to(textRef.current, { x: 0, skewX: 0, duration: 0.42, ease: "power3.out" });
    gsap.to(btnRef.current, { scale: 1.2, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
  };

  const onMouseLeave = () => {
    gsap.killTweensOf(textRef.current);
    gsap.killTweensOf(btnRef.current);
    gsap.to(textRef.current, { x: 0, skewX: 0, duration: 0.2, ease: "power2.out" });
    gsap.to(btnRef.current, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <div style={{ pointerEvents: open ? "auto" : "none" }}>
      <div ref={velWrapRef} style={{ display: "inline-block" }}>
        <div ref={sizeRef} style={{ display: "inline-block" }}>
        <div ref={blobRef} style={{ display: "inline-block", clipPath: "circle(0%)" }}>
          <a
            ref={btnRef}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px clamp(24px, 3vw, 48px)",
              background: "#000",
              border: "none",
              textDecoration: "none",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "block", pointerEvents: "none" }}>
              <span
                ref={textRef}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5em",
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(1.1rem, 1.8vw, 2rem)",
                  letterSpacing: "0.04em",
                  pointerEvents: "none",
                }}
              >
                Visiter
                <svg width="59" height="44" viewBox="0 0 59 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "0.9em", height: "auto", flexShrink: 0 }}>
                  <path d="M0 21.1107H54M35.5 41.0918L54 21.1107L35.5 2.09177" stroke="#fff" strokeWidth="5"/>
                </svg>
              </span>
            </span>
          </a>
        </div>
        </div>
      </div>
    </div>
  );
});

export default function ProjectExpandedPanel({ project, rotation, shapeConfig, overlayRef, spawnBall, setBallBlack, titlePosition = "bottom-left", palette = 0, mockupOffsetY = 0, mockupOffsetYMobile, annotationPosition = "top", annotationOffsetY = 0, panelZIndex = 2 }: Props) {
  const [open, setOpen] = useState(false);
  const [annotationText, setAnnotationText] = useState("CLIQUES ICI");
  const [isMobileState, setIsMobileState] = useState(false);
  const annotationTextRef = useRef<HTMLSpanElement>(null);
  const annotationGroupRef = useRef<HTMLDivElement>(null);

  const titleRef = useRef<ProjectTitleHandle>(null);
  const mockupRef = useRef<ProjectMockupHandle>(null);
  const visitBtnRef = useRef<VisitButtonHandle>(null);
  const hoverGuard = useRef(false);

  const handleHoverChange = (hovered: boolean) => {
    if (hoverGuard.current) return;
    hoverGuard.current = true;
    if (hovered) titleRef.current?.enter(); else titleRef.current?.leave();
    hoverGuard.current = false;
    const el = annotationTextRef.current;
    const group = annotationGroupRef.current;

    if (group) {
      gsap.killTweensOf(group);
      const down = annotationPosition === "bottom";
      gsap.to(group, { y: hovered ? (down ? 50 : -50) : 0, x: hovered ? 28 : 0, duration: hovered ? 0.6 : 0.7, ease: "elastic.out(1, 0.5)" });
    }

    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, {
      scaleX: 0, scaleY: 1.6, rotation: 10, duration: 0.16, ease: "power3.in",
      onComplete: () => {
        setAnnotationText(hovered ? "VOIR LES INFOS" : "CLIQUES ICI");
        gsap.fromTo(el,
          { scaleX: 0, scaleY: 1.6, rotation: -10 },
          { scaleX: 1, scaleY: 1, rotation: 0, duration: 0.85, ease: "elastic.out(1.5, 0.4)" }
        );
      },
    });
  };
  const panelRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const rightInnerRef = useRef<HTMLDivElement>(null);
  const blackLayerRef = useRef<HTMLDivElement>(null);
  const circleParallaxRef = useRef<HTMLDivElement>(null);
  const triangleParallaxRef = useRef<HTMLDivElement>(null);
  const arrowParallaxRef = useRef<HTMLDivElement>(null);
  const blackCircleRef = useRef<HTMLDivElement>(null);
  const blackTriangleRef = useRef<HTMLDivElement>(null);
  const blackArrowRef = useRef<HTMLDivElement>(null);
  const mockupWrapRef = useRef<HTMLDivElement>(null);
  const blackBgRef = useRef<HTMLDivElement>(null);
  const galleryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRef = useRef<HTMLDivElement>(null);
  const descWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const linksRef = useRef<HTMLDivElement>(null);
  const openCallRef = useRef<gsap.core.Tween | null>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const isMobile = () => window.innerWidth < 768;

  useEffect(() => {
    const check = () => setIsMobileState(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const CC_OPEN  = "50% 50%";
  const CC_CLOSE = "50% 50%";
  const WC_CENTER = "55% 43%";
  const circleProxy = useRef({ r: 0 });
  const wcProxy = useRef({ r: 0 });
  const circlePhase = useRef(0);
  const wcPhase = useRef(0);
  const circleTickerRef = useRef<(() => void) | null>(null);
  const wcTickerRef = useRef<(() => void) | null>(null);

  const WC_AMP = 22;
  const WC_FREQ = 5;

  const animateWhiteCircle = (from: number, to: number, duration: number, ease: string, onDone?: () => void) => {
    const wc = document.querySelector<HTMLElement>("[data-white-circle]");
    if (!wc) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const cx = W * 0.55;
    const cy = H * 0.43;
    const rMax = Math.sqrt(Math.max(cx, W - cx) ** 2 + Math.max(cy, H - cy) ** 2) + WC_AMP + 10;
    const expanding = to > from;
    if (wcTickerRef.current) { gsap.ticker.remove(wcTickerRef.current); wcTickerRef.current = null; }
    wcProxy.current.r = expanding ? 0 : rMax;
    const tick = () => {
      wcPhase.current += 0.04;
      const r = wcProxy.current.r;
      wc.style.clipPath = `path('${buildBlobPath(cx, cy, r, wcPhase.current, WC_AMP, WC_FREQ)}')`;
    };
    gsap.ticker.add(tick);
    wcTickerRef.current = tick;
    gsap.killTweensOf(wcProxy.current);
    gsap.to(wcProxy.current, {
      r: expanding ? rMax : 0, duration, ease,
      onComplete: () => {
        gsap.ticker.remove(tick);
        wcTickerRef.current = null;
        if (!expanding) { wc.style.display = "none"; wc.style.clipPath = ""; }
        else wc.style.clipPath = "none";
        onDone?.();
      },
    });
  };

  const animateCircle = (from: number, to: number, duration: number, ease: string, _center: string, onDone?: () => void) => {
    const el = overlayRef.current;
    const bl = blackLayerRef.current;
    if (!el) return;
    const W = el.offsetWidth || window.innerWidth;
    const H = el.offsetHeight || window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;
    const rMax = Math.sqrt(cx * cx + cy * cy) + BLOB_AMP + 10;
    const expanding = to > from;
    if (circleTickerRef.current) { gsap.ticker.remove(circleTickerRef.current); circleTickerRef.current = null; }
    if (bl) bl.setAttribute("data-circle-animating", "1");
    circleProxy.current.r = expanding ? 0 : rMax;
    const tick = () => {
      circlePhase.current += 0.035;
      const r = circleProxy.current.r;
      const cp = `path('${buildBlobPath(cx, cy, r, circlePhase.current)}')`;
      el.style.clipPath = cp;
      if (bl) bl.style.clipPath = cp;
    };
    gsap.ticker.add(tick);
    circleTickerRef.current = tick;
    gsap.killTweensOf(circleProxy.current);
    gsap.to(circleProxy.current, {
      r: expanding ? rMax : 0, duration, ease,
      onComplete: () => {
        gsap.ticker.remove(tick);
        circleTickerRef.current = null;
        if (bl) {
          if (expanding) { bl.style.clipPath = "none"; }
          else { bl.style.clipPath = ""; bl.removeAttribute("data-circle-animating"); }
        }
        if (expanding) el.style.clipPath = "none";
        onDone?.();
      },
    });
  };

  const openWithTransition = () => {
    window.dispatchEvent(new CustomEvent("project:open"));
    const el = overlayRef.current;
    const bl = blackLayerRef.current;

    if (panelRef.current) {
      if (isMobile()) {
        panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        const scrollContainer = document.querySelector("[data-scroll-container]") as HTMLElement | null;
        if (scrollContainer) {
          const panelRect = panelRef.current.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const snapX = Math.round(scrollContainer.scrollLeft + panelRect.left - containerRect.left);
          window.dispatchEvent(new CustomEvent("scroll:snapTo", { detail: { x: snapX } }));
        }
      }
    }

    const decorRefs = [annotationGroupRef.current].filter(Boolean);
    gsap.to(decorRefs, { opacity: 0, duration: 0.2, ease: "power2.in" });

    if (!el) { setOpen(true); return; }
    openCallRef.current?.kill();
    el.style.background = PALETTE_GRADIENTS[palette];
    gsap.set(el, { display: "block", opacity: 1, zIndex: 1 });
    animateCircle(0, 200, 0.65, "power3.inOut", CC_OPEN);
    const wc = document.querySelector<HTMLElement>("[data-white-circle]");
    if (wc) { wc.style.display = "block"; wc.style.clipPath = ""; }
    gsap.delayedCall(0.08, () => animateWhiteCircle(0, 200, 0.65, "power3.inOut"));
    gsap.to([blackCircleRef.current, blackTriangleRef.current, blackArrowRef.current], { filter: "brightness(1)", duration: 0.5, delay: 0.7, ease: "power2.out" });
    gsap.to(blackBgRef.current, { opacity: 1, duration: 0.4, delay: 0.15, ease: "power2.out" });
    if (!isMobile()) {
      document.querySelectorAll<HTMLElement>("[data-ball-layer]").forEach(layer => {
        if (layer === bl) return;
        layer.setAttribute("data-circle-animating", "1");
        layer.style.clipPath = "none";
      });
    }
    openCallRef.current = gsap.delayedCall(0.2, () => { setOpen(true); visitBtnRef.current?.triggerOpen(); });
    mockupRef.current?.expandOpen();
  };

  const closePanel = () => {
    if (!open) return;
    window.dispatchEvent(new CustomEvent("project:close"));
    visitBtnRef.current?.triggerClose();
    mockupRef.current?.expandClose();
    openCallRef.current?.kill();
    openTlRef.current?.kill();
    openTlRef.current = null;
    gsap.killTweensOf(circleProxy.current);

    const el = overlayRef.current;
    const bl = blackLayerRef.current;
    if (!isMobile()) {
      document.querySelectorAll<HTMLElement>("[data-ball-layer]").forEach(layer => {
        if (layer === bl) return;
        layer.removeAttribute("data-circle-animating");
        layer.style.clipPath = "circle(0vmax at 50% 50%)";
      });
    }
    gsap.to(blackBgRef.current, { opacity: 0, duration: 0.2, ease: "power2.out" });
    gsap.killTweensOf([blackCircleRef.current, blackTriangleRef.current, blackArrowRef.current]);
    gsap.to([blackCircleRef.current, blackTriangleRef.current, blackArrowRef.current], { filter: "brightness(0)", duration: 0.12, ease: "power2.in" });
    animateWhiteCircle(wcProxy.current.r, 0, 0.5, "power3.inOut");
    if (el) {
      gsap.set(el, { display: "block", zIndex: 1 });
      animateCircle(200, 8, 0.5, "power3.inOut", CC_CLOSE, () => {
        el.style.clipPath = "";
        gsap.set(el, { display: "none" });
        spawnBall?.();
      });
    }

    if (rightRef.current) rightRef.current.style.overflow = "hidden";
    const gallery = galleryRefs.current.filter(Boolean);
    const tl = gsap.timeline({ onComplete: () => setOpen(false) });
    const descWords = descWordRefs.current.filter(Boolean);

    if (isMobile()) {
      tl
        .to(linksRef.current, { opacity: 0, y: 20, duration: 0.2, ease: "power2.in" }, 0)
        .to(descWords, { y: "115%", stagger: { each: 0.014, from: "end" }, duration: 0.25, ease: "power3.in" }, 0)
        .to([...gallery].reverse(), { opacity: 0, scale: 0.7, y: -40, stagger: 0.05, duration: 0.2, ease: "power3.in" }, 0)
        .to(rightRef.current, { height: 0, duration: 0.45, ease: "power3.in" }, 0.1)
        .to(leftRef.current, { height: "100dvh", duration: 0.65, ease: "elastic.out(1, 0.5)" }, 0.15);
    } else {
      tl
        .to(linksRef.current, { opacity: 0, y: 20, duration: 0.2, ease: "power2.in" }, 0)
        .to(descWords, { y: "115%", stagger: { each: 0.014, from: "end" }, duration: 0.25, ease: "power3.in" }, 0)
        .to([...gallery].reverse(), { opacity: 0, scale: 0.7, y: -40, stagger: 0.05, duration: 0.2, ease: "power3.in" }, 0)
        .to([circleParallaxRef.current, triangleParallaxRef.current, arrowParallaxRef.current, blackCircleRef.current, blackTriangleRef.current, blackArrowRef.current], { x: 0, y: 0, duration: 0.55, ease: "power2.out", overwrite: true }, 0)
        .to(rightInnerRef.current, { x: "-40vw", duration: 0.7, ease: "power3.in" }, 0)
        .to(rightRef.current, { width: 0, duration: 0.7, ease: "power3.in" }, 0.2)
        .to(leftRef.current, { width: "100dvw", duration: 1.4, ease: "elastic.out(1, 0.5)" }, 0.3)
        .to(mockupWrapRef.current, { scaleX: 1.06, scaleY: 0.88, duration: 0.15, ease: "power3.in" }, 0.3)
        .to(mockupWrapRef.current, { scaleX: 1, scaleY: 1, duration: 1.5, ease: "elastic.out(1, 0.45)" }, 0.5);
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
    const sync = () => {
      const pairs: [HTMLDivElement | null, HTMLDivElement | null][] = [
        [circleParallaxRef.current, blackCircleRef.current],
        [triangleParallaxRef.current, blackTriangleRef.current],
        [arrowParallaxRef.current, blackArrowRef.current],
      ];
      for (const [src, dst] of pairs) {
        if (!src || !dst) continue;
        gsap.set(dst, { x: gsap.getProperty(src, "x"), y: gsap.getProperty(src, "y") });
      }
    };
    gsap.ticker.add(sync);
    return () => gsap.ticker.remove(sync);
  }, []);

  useLayoutEffect(() => {
    if (!open && isMobile()) {
      const shapes = [circleParallaxRef.current, triangleParallaxRef.current, arrowParallaxRef.current].filter(Boolean);
      gsap.set(shapes, { autoAlpha: 0, y: 12 });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      gsap.set(leftRef.current, { clearProps: "width,height" });
      gsap.set(rightRef.current, { clearProps: "width,height" });
      gsap.set(rightInnerRef.current, { clearProps: "x,transform" });
      gsap.set(mockupWrapRef.current, { clearProps: "scaleX,scaleY,y,transform" });
      const decorRefs = [annotationGroupRef.current].filter(Boolean);
      gsap.set(decorRefs, { scale: 0, rotation: 0 });
      gsap.to(decorRefs, { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: "elastic.out(1, 0.4)", stagger: 0.07, delay: 0.1 });
      if (isMobile()) {
        const shapes = [circleParallaxRef.current, triangleParallaxRef.current, arrowParallaxRef.current].filter(Boolean);
        gsap.to(shapes, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08, delay: 0.2 });
      }
      return;
    }
    const mobile = isMobile();
    const gallery = galleryRefs.current.filter(Boolean);
    const galleryRotations = [-12, 6, -4];
    const descWords = descWordRefs.current.filter(Boolean);

    const decorRefs = [annotationGroupRef.current].filter(Boolean);
    gsap.set(decorRefs, { opacity: 0, rotation: 0 });
    gsap.set(gallery, { opacity: 0, scale: 1, y: -window.innerHeight, rotation: 0 });
    gsap.set(descWords, { y: "115%" });
    gsap.set(linksRef.current, { opacity: 0, y: 30 });
    gsap.set(rightInnerRef.current, { x: 0 });

    const tl = gsap.timeline();
    openTlRef.current = tl;
    const cleanup = () => { tl.kill(); openTlRef.current = null; };

    if (mobile) {
      tl
        .to(mockupWrapRef.current, { scaleY: 0.85, scaleX: 1.08, duration: 0.06, ease: "power3.in" })
        .to(mockupWrapRef.current, { scaleY: 1.12, scaleX: 0.92, duration: 0.07, ease: "power2.out" })
        .to(mockupWrapRef.current, { scaleY: 1, scaleX: 1, y: () => window.innerHeight * 0.06, duration: 0.45, ease: "elastic.out(1, 0.38)" })
        .to(leftRef.current, { height: "42dvh", duration: 0.4, ease: "elastic.out(1, 0.45)" }, 0)
        .to(rightRef.current, { height: "50dvh", duration: 0.35, ease: "power3.out" }, 0.1)
        .call(() => { if (rightRef.current) rightRef.current.style.overflow = "visible"; }, undefined, 0.12)
        .to(gallery, {
          opacity: 1, scale: 1, y: 0,
          rotation: (i) => galleryRotations[i] ?? 0,
          stagger: 0.06, duration: 0.45, ease: "elastic.out(1, 0.45)",
        }, "-=0.2")
        .to(descWords, { y: "0%", stagger: 0.014, duration: 0.35, ease: "power4.out" }, "-=0.2")
        .to(linksRef.current, { opacity: 1, y: 0, duration: 0.35, ease: "elastic.out(1, 0.5)" }, "-=0.15");
    } else {
      tl
        .to(mockupWrapRef.current, { scaleY: 0.85, scaleX: 1.08, duration: 0.06, ease: "power3.in" })
        .to(mockupWrapRef.current, { scaleY: 1.12, scaleX: 0.92, duration: 0.07, ease: "power2.out" })
        .to(mockupWrapRef.current, { scaleY: 1, scaleX: 1, duration: 0.45, ease: "elastic.out(1, 0.38)" })
        .to(leftRef.current, { width: "42vw", duration: 0.45, ease: "elastic.out(1, 0.45)" }, 0)
        .to(circleParallaxRef.current, { x: -window.innerWidth * 0.25, y: (circleParallaxRef.current?.getBoundingClientRect().top ?? 0) < window.innerHeight / 2 ? -window.innerHeight * 0.25 : window.innerHeight * 0.25, duration: 0.4, ease: "power2.out", overwrite: true }, 0)
        .to(triangleParallaxRef.current, { x: -window.innerWidth * 0.25, y: (triangleParallaxRef.current?.getBoundingClientRect().top ?? 0) < window.innerHeight / 2 ? -window.innerHeight * 0.25 : window.innerHeight * 0.25, duration: 0.4, ease: "power2.out", overwrite: true }, 0)
        .to(arrowParallaxRef.current, { x: -window.innerWidth * 0.25, y: (arrowParallaxRef.current?.getBoundingClientRect().top ?? 0) < window.innerHeight / 2 ? -window.innerHeight * 0.25 : window.innerHeight * 0.25, duration: 0.4, ease: "power2.out", overwrite: true }, 0)
        .to(rightRef.current, { width: "58vw", duration: 0.5, ease: "elastic.out(1, 0.42)" }, 0.1)
        .call(() => { if (rightRef.current) rightRef.current.style.overflow = "visible"; }, undefined, 0.3)
        .to(gallery, {
          opacity: 1, scale: 1, y: 0,
          rotation: (i) => galleryRotations[i] ?? 0,
          stagger: 0.06, duration: 0.5, ease: "elastic.out(1, 0.45)",
        }, "-=0.3")
        .to(descWords, { y: "0%", stagger: 0.014, duration: 0.35, ease: "power4.out" }, "-=0.2")
        .to(linksRef.current, { opacity: 1, y: 0, duration: 0.35, ease: "elastic.out(1, 0.5)" }, "-=0.15");
    }

    return cleanup;
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="relative shrink-0 flex flex-col md:flex-row panel-height"
      data-panel-open={open ? "" : undefined}
      data-palette={palette}
      style={{ width: "100dvw", position: "relative", zIndex: panelZIndex }}
    >
      <ParallaxShape ref={circleParallaxRef} depthX={shapeConfig.circle.depthX} depthY={shapeConfig.circle.depthY} className={`${open ? "hidden md:block" : "block"} ${shapeConfig.circle.className}`} style={{ zIndex: 1, ...shapeConfig.circle.style }} mobileStyle={shapeConfig.circle.mobileStyle}>
        <Circle palette={palette} />
      </ParallaxShape>
      <ParallaxShape ref={triangleParallaxRef} depthX={shapeConfig.triangle.depthX} depthY={shapeConfig.triangle.depthY} className={`${open ? "hidden md:block" : "block"} ${shapeConfig.triangle.className}`} style={{ zIndex: 1, ...shapeConfig.triangle.style }} mobileStyle={shapeConfig.triangle.mobileStyle}>
        <Triangle palette={palette} />
      </ParallaxShape>
      <ParallaxShape ref={arrowParallaxRef} depthX={shapeConfig.arrow.depthX} depthY={shapeConfig.arrow.depthY} className={`${open ? "hidden md:block" : "block"} ${shapeConfig.arrow.className}`} style={{ zIndex: 1, ...shapeConfig.arrow.style }} mobileStyle={shapeConfig.arrow.mobileStyle}>
        <div style={shapeConfig.arrow.flipY ? { transform: "scaleY(-1)" } : undefined}>
          <Arrow palette={palette} />
        </div>
      </ParallaxShape>

      <div
        ref={blackLayerRef}
        data-ball-layer
        className="hidden md:block"
        style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", clipPath: "circle(0vmax at 50% 50%)" }}
      >
        <div ref={blackCircleRef} className={shapeConfig.circle.className} style={{ zIndex: 1, ...shapeConfig.circle.style, filter: "brightness(0)" }}>
          <Circle palette={palette} />
        </div>
        <div ref={blackTriangleRef} className={shapeConfig.triangle.className} style={{ zIndex: 1, ...shapeConfig.triangle.style, filter: "brightness(0)" }}>
          <Triangle palette={palette} />
        </div>
        <div ref={blackArrowRef} className={shapeConfig.arrow.className} style={{ zIndex: 1, ...shapeConfig.arrow.style, filter: "brightness(0)" }}>
          <div style={shapeConfig.arrow.flipY ? { transform: "scaleY(-1)" } : undefined}>
            <Arrow palette={palette} />
          </div>
        </div>
      </div>

      <div ref={leftRef} className="expanded-left" style={{ position: "relative", zIndex: 3 }}>
        <div style={{ transform: `translateY(${isMobileState ? (mockupOffsetYMobile ?? 0) : mockupOffsetY}px)` }}>
          <div
            ref={mockupWrapRef}
            onClick={open ? closePanel : openWithTransition}
            style={{ cursor: "pointer" }}
          >
            <ProjectMockup
              ref={mockupRef}
              image={project.image}
              title={project.title}
              rotation={rotation}
              palette={palette}
              onHoverChange={handleHoverChange}
              blackBgRef={blackBgRef}
              titleBelow={<ProjectTitle ref={titleRef} title={project.title} className={styles.projectTitle} onHoverChange={(h) => { if (hoverGuard.current) return; hoverGuard.current = true; if (h) mockupRef.current?.enter(); else mockupRef.current?.leave(); hoverGuard.current = false; }} />}
            >
              <>
                <div ref={annotationGroupRef} className={annotationPosition === "top" ? "annotation-callout-top" : "annotation-callout-bottom"} style={{ position: "absolute", ...(annotationPosition === "bottom" ? { top: `calc(100% + ${42 + annotationOffsetY}px)`, left: "70%" } : { bottom: `calc(100% + ${72 - annotationOffsetY}px)`, left: "70%" }), pointerEvents: "none", userSelect: "none", transformOrigin: "left center" }}>
                  <svg viewBox="0 0 59 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "clamp(36px, 4.5vw, 59px)", height: "auto", pointerEvents: "none", ...(annotationPosition === "bottom" ? { transform: "scaleY(-1) translateY(40px)" } : {}) }}>
                    <path d="M55.5568 2.5C55.5407 2.5 52.9056 2.52888 47.5125 3.03353C44.7177 3.29505 41.9197 4.43108 39.6653 5.38834C37.411 6.34561 35.8143 7.31043 34.1679 8.44873C32.5215 9.58703 30.8738 10.8696 28.5491 13.254C26.2244 15.6384 23.2727 19.0858 21.1584 21.9017C19.044 24.7176 17.8565 26.7975 16.5126 29.726C15.1688 32.6545 13.7046 36.3685 12.6701 39.4799C11.6356 42.5913 11.0751 44.9876 10.7732 46.3961C10.4713 47.8047 10.4449 48.1529 10.4194 48.5227" stroke="black" strokeWidth="5" strokeLinecap="round"/>
                    <path d="M2.5 29.7616C2.52324 30.187 2.71249 31.5564 3.96054 35.1196C5.01472 38.1292 7.13216 43.503 8.22955 46.3453C9.32694 49.1876 9.39351 49.3163 9.49381 49.2462C9.83324 49.0093 10.1496 48.366 13.3893 46.2884C16.3414 44.4676 21.9496 41.0905 24.9457 39.3102C27.9417 37.5299 28.1558 37.4486 28.4467 37.357" stroke="black" strokeWidth="5" strokeLinecap="round"/>
                  </svg>
                  <span ref={(el) => { annotationTextRef.current = el; }} style={{ position: "absolute", top: "50%", left: "calc(100% + clamp(10px, 1.5vw, 32px))", transform: "translateY(-50%)", fontFamily: "Dudu, sans-serif", fontSize: "clamp(1.3rem, 3.5vw, 2.8rem)", WebkitTextStroke: "2px black", paintOrder: "stroke fill", textTransform: "uppercase", display: "inline-block", pointerEvents: "none", whiteSpace: "nowrap" }}>
                    {annotationText}
                  </span>
                </div>
              </>
            </ProjectMockup>
          </div>
        </div>
      </div>

      <div ref={rightRef} className="expanded-right" style={{ position: "relative", zIndex: 5 }}>
        <div
          ref={rightInnerRef}
          className="expanded-right-inner"
          style={{ paddingTop: "clamp(12px, 2vw, 36px)", paddingBottom: "clamp(24px, 4vw, 80px)" }}
        >
          <div style={{ display: "flex", gap: "clamp(8px, 1vw, 16px)", marginBottom: "clamp(20px, 3vh, 40px)", flexWrap: "wrap" }} className="justify-end md:justify-start">
            {(project.gallery ?? []).slice(0, 3).map((src, i) => (
              <div
                key={src}
                ref={(el) => { galleryRefs.current[i] = el; }}
                style={{ position: "relative", width: "30%", aspectRatio: "16/9", flexShrink: 0, minWidth: 0, transform: `translateY(${-12 - i * 6}px)` }}
              >
                <SlimeImage src={src} alt={`${project.title} ${i + 1}`} className="absolute inset-0" />
              </div>
            ))}
          </div>

          <div ref={descRef} style={{ fontFamily: "Dudu, sans-serif", fontSize: "clamp(1.15rem, 1.4vw, 1.6rem)", lineHeight: 1.5, maxWidth: "min(480px, 100%)", marginTop: "clamp(8px, 1.5vh, 20px)", marginBottom: "clamp(16px, 2.5vh, 32px)", display: "flex", flexWrap: "wrap", gap: "0.28em", alignContent: "flex-start", pointerEvents: "none" }}>
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

          {(project.projectUrl ?? project.url) && (
            <div style={{ marginBottom: "clamp(12px, 2vh, 24px)" }}>
              <VisitButton ref={visitBtnRef} href={(project.projectUrl ?? project.url)!} open={open} />
            </div>
          )}

          <div ref={linksRef} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
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
