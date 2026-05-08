"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import SlimeImage from "@/components/SlimeImage";

interface ProjectMockupProps {
  image?: string;
  title: string;
  rotation: number;
}

export default function ProjectMockup({ image, title, rotation }: ProjectMockupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let scrollRoot: HTMLElement | null = el.parentElement;
    while (scrollRoot) {
      if (getComputedStyle(scrollRoot).overflowX === "auto") break;
      scrollRoot = scrollRoot.parentElement;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.killTweensOf(el);
          gsap.set(el, { y: -(window.innerHeight * 0.6 + 200), scaleY: 3.5, scaleX: 0.3, rotation: 0 });
          gsap.to(el, { y: 40, duration: 1.0, ease: "expo.out" });
          gsap.to(el, { scaleY: 1, scaleX: 1, rotation, duration: 1.5, ease: "elastic.out(1, 0.4)" });
        } else {
          gsap.killTweensOf(el);
          gsap.set(el, { y: -(window.innerHeight * 0.6 + 200), scaleY: 3.5, scaleX: 0.3, rotation: 0 });
        }
      },
      { root: scrollRoot, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rotation]);

  const onEnter = () => {
    gsap.killTweensOf(ref.current);
    gsap.to(ref.current, { scale: 1.22, duration: 1.2, ease: "elastic.out(1.2, 0.3)" });
  };

  const onLeave = () => {
    gsap.killTweensOf(ref.current);
    gsap.to(ref.current, { scale: 1, duration: 1.4, ease: "elastic.out(1, 0.35)" });
  };

  return (
    <div
      ref={ref}
      className="relative z-10"
      style={{ width: "clamp(280px, 38vw, 640px)", aspectRatio: "16/9" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {image ? (
        <SlimeImage src={image} alt={title} className="absolute inset-0" />
      ) : (
        <div className="w-full h-full bg-black" />
      )}
    </div>
  );
}
