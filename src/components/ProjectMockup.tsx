"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface ProjectMockupProps {
  image?: string;
  title: string;
  rotation: number;
  freeze?: boolean;
}

export default function ProjectMockup({ image, title, rotation, freeze }: ProjectMockupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (freeze) {
      gsap.killTweensOf(el);
      gsap.set(el, { opacity: 1, y: 0, scaleY: 1, scaleX: 1, rotation });
      return;
    }

    gsap.set(el, { opacity: 0 });

    const state = { current: "hidden" as "hidden" | "entering" | "visible" | "leaving" };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (state.current === "entering" || state.current === "visible") return;
          state.current = "entering";
          gsap.killTweensOf(el);
          gsap.set(el, {
            opacity: 1,
            y: -(window.innerHeight * 0.6 + 200),
            scaleY: 3.5,
            scaleX: 0.3,
            rotation: 0,
          });
          gsap.to(el, {
            y: 0,
            scaleY: 1,
            scaleX: 1,
            rotation,
            duration: 1.5,
            ease: "elastic.out(1, 0.4)",
            onComplete: () => { state.current = "visible"; },
          });
        } else {
          if (state.current === "leaving" || state.current === "hidden") return;
          state.current = "leaving";
          gsap.killTweensOf(el);
          gsap.to(el, {
            y: window.innerHeight * 0.4,
            scaleY: 0.4,
            scaleX: 1.6,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
              gsap.set(el, { opacity: 0 });
              state.current = "hidden";
            },
          });
        }
      },
      { threshold: 0.1, rootMargin: "0px -30% 0px -30%" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rotation, freeze]);

  const onEnter = () => {
    gsap.to(ref.current, { scale: 1.22, duration: 1.2, ease: "elastic.out(1.2, 0.3)" });
  };

  const onLeave = () => {
    gsap.to(ref.current, { scale: 1, duration: 1.4, ease: "elastic.out(1, 0.35)" });
  };

  return (
    <div
      ref={ref}
      className="relative z-10"
      style={{ width: "clamp(280px, 38vw, 640px)", aspectRatio: "16/9", overflow: "hidden" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover object-top" />
      ) : (
        <div className="w-full h-full bg-black" />
      )}
    </div>
  );
}
