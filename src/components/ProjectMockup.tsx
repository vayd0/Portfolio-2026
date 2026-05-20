"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import gsap from "gsap";
import SlimeImage, { type SlimeImageHandle } from "@/components/SlimeImage";
import { subscribeVel } from "@/lib/velBus";
import { PALETTE_GRADIENTS, type Palette } from "@/components/shapes";

interface ProjectMockupProps {
  image?: string;
  title: string;
  rotation: number;
  palette?: Palette;
  children?: React.ReactNode;
  imageOverlay?: React.ReactNode;
  titleBelow?: React.ReactNode;
  visitButton?: React.ReactNode;
  onHoverChange?: (hovered: boolean) => void;
  blackBgRef?: React.RefObject<HTMLDivElement | null>;
}

export interface ProjectMockupHandle {
  enter: () => void;
  leave: () => void;
}

const ProjectMockup = forwardRef<ProjectMockupHandle, ProjectMockupProps>(function ProjectMockup({ image, title, rotation, palette = 0, children, imageOverlay, titleBelow, visitButton, onHoverChange, blackBgRef }, handle) {
  const ref = useRef<HTMLDivElement>(null);
  const velRef = useRef<HTMLDivElement>(null);
  const visitButtonWrapRef = useRef<HTMLDivElement>(null);
  const titleBelowWrapRef = useRef<HTMLDivElement>(null);
  const slimeRef = useRef<SlimeImageHandle>(null);

  useEffect(() => {
    const el = ref.current;
    const sentinel = velRef.current;
    if (!el || !sentinel) return;

    let scrollRoot: HTMLElement | null = el.parentElement;
    while (scrollRoot) {
      if (getComputedStyle(scrollRoot).overflowX === "auto") break;
      scrollRoot = scrollRoot.parentElement;
    }

    const isMobile = !scrollRoot;
    let animating = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animating = true;
          gsap.killTweensOf(el);
          gsap.set(el, { y: -(window.innerHeight * 0.6 + 200), scaleY: 3.5, scaleX: 0.3, rotation: 0 });
          gsap.to(el, { y: -20, duration: 1.0, ease: "expo.out" });
          gsap.to(el, { scaleY: 1, scaleX: 1, rotation, duration: 1.5, ease: "elastic.out(1, 0.4)", onComplete: () => { animating = false; } });
          if (visitButtonWrapRef.current) gsap.set(visitButtonWrapRef.current, { rotation });
          observer.disconnect();
        }
      },
      { root: null, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [rotation]);

  useEffect(() => {
    const el = velRef.current;
    if (!el) return;
    el.style.transformOrigin = "center center";
    return subscribeVel((v) => {
      const skew = v * 0.4;
      const sy = 1 - Math.abs(v) * 0.003;
      el.style.transform = `skewX(${skew}deg) scaleY(${sy})`;
    });
  }, []);

  const onEnter = () => {
    gsap.killTweensOf(ref.current);
    gsap.to(ref.current, { scale: 1.08, duration: 1.2, ease: "elastic.out(1.2, 0.3)" });
    gsap.killTweensOf(titleBelowWrapRef.current);
    gsap.to(titleBelowWrapRef.current, { y: -12, duration: 0.6, ease: "power2.out" });
    gsap.killTweensOf(visitButtonWrapRef.current);
    gsap.to(visitButtonWrapRef.current, { y: 14, duration: 0.6, ease: "power2.out" });
    onHoverChange?.(true);
  };

  const onLeave = () => {
    gsap.killTweensOf(ref.current);
    gsap.to(ref.current, { scale: 1, duration: 1.4, ease: "elastic.out(1, 0.35)" });
    gsap.killTweensOf(titleBelowWrapRef.current);
    gsap.to(titleBelowWrapRef.current, { y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    gsap.killTweensOf(visitButtonWrapRef.current);
    gsap.to(visitButtonWrapRef.current, { y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    onHoverChange?.(false);
  };

  useImperativeHandle(handle, () => ({
    enter: () => { onEnter(); slimeRef.current?.enter(); },
    leave: () => { onLeave(); slimeRef.current?.leave(); },
  }));

  return (
    <div ref={velRef} style={{ position: "relative" }}>
      {children}
      <div
        ref={ref}
        className="relative z-10"
        style={{ width: "clamp(110px, 12vw, 220px)", aspectRatio: "16/9" }}
      >
        <div
          className="absolute inset-0"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          {image ? (
            <SlimeImage ref={slimeRef} src={image} alt={title} className="absolute inset-0" background={PALETTE_GRADIENTS[palette]} blackBgRef={blackBgRef} />
          ) : (
            <div className="w-full h-full" style={{ background: PALETTE_GRADIENTS[palette] }} />
          )}
          {imageOverlay}
        </div>
        {titleBelow && (
          <div ref={titleBelowWrapRef} style={{ position: "absolute", top: "calc(100% - 0.27 * clamp(3.5rem, 11vw, 14rem) - 2px)", left: "50%", transform: "translateX(-50%)", width: "max-content", background: "black", padding: "30px 48px 30px", color: "white", clipPath: "polygon(0% calc(0.27 * clamp(3.5rem, 11vw, 14rem)), 100% calc(0.27 * clamp(3.5rem, 11vw, 14rem)), calc(100% - 24px) 100%, 24px 100%)" }}>
            {titleBelow}
          </div>
        )}
      </div>
      {visitButton && (
        <div ref={visitButtonWrapRef} className="visit-btn-wrap" style={{ position: "absolute", top: "calc(100% + 0.73 * clamp(3.5rem, 11vw, 14rem) + 26px)", left: 0, right: 0, display: "flex", justifyContent: "center", transformOrigin: "center top", zIndex: 20 }}>
          {visitButton}
        </div>
      )}
    </div>
  );
});

export default ProjectMockup;
