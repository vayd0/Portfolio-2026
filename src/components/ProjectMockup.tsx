"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import SlimeImage from "@/components/SlimeImage";
import { subscribeVel } from "@/lib/velBus";
import { PALETTE_GRADIENTS, type Palette } from "@/components/shapes";

interface ProjectMockupProps {
  image?: string;
  title: string;
  rotation: number;
  palette?: Palette;
  children?: React.ReactNode;
  onHoverChange?: (hovered: boolean) => void;
}

export default function ProjectMockup({ image, title, rotation, palette = 0, children, onHoverChange }: ProjectMockupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const velRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let scrollRoot: HTMLElement | null = el.parentElement;
    while (scrollRoot) {
      if (getComputedStyle(scrollRoot).overflowX === "auto") break;
      scrollRoot = scrollRoot.parentElement;
    }

    const isMobile = !scrollRoot;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.killTweensOf(el);
          gsap.set(el, { y: -(window.innerHeight * 0.6 + 200), scaleY: 3.5, scaleX: 0.3, rotation: 0 });
          gsap.to(el, { y: -20, duration: 1.0, ease: "expo.out" });
          gsap.to(el, { scaleY: 1, scaleX: 1, rotation, duration: 1.5, ease: "elastic.out(1, 0.4)" });
          if (isMobile) observer.disconnect();
        } else if (!isMobile) {
          gsap.killTweensOf(el);
          gsap.set(el, { y: -(window.innerHeight * 0.6 + 200), scaleY: 3.5, scaleX: 0.3, rotation: 0 });
        }
      },
      { root: scrollRoot, threshold: 0.1 }
    );

    observer.observe(el);
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
    gsap.to(ref.current, { scale: 1.22, duration: 1.2, ease: "elastic.out(1.2, 0.3)" });
    onHoverChange?.(true);
  };

  const onLeave = () => {
    gsap.killTweensOf(ref.current);
    gsap.to(ref.current, { scale: 1, duration: 1.4, ease: "elastic.out(1, 0.35)" });
    onHoverChange?.(false);
  };

  return (
    <div ref={velRef} style={{ position: "relative" }}>
      {children}
      <div
        ref={ref}
        className="relative z-10"
        style={{ width: "clamp(280px, 38vw, 640px)", aspectRatio: "16/9" }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {image ? (
          <SlimeImage src={image} alt={title} className="absolute inset-0" background={PALETTE_GRADIENTS[palette]} />
        ) : (
          <div className="w-full h-full" style={{ background: PALETTE_GRADIENTS[palette] }} />
        )}
      </div>
    </div>
  );
}
