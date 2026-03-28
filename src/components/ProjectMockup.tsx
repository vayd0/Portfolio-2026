"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

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

    gsap.set(el, { scaleY: 0, transformOrigin: "top center", rotation: 0 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(el);
        gsap.to(el, {
          scaleY: 1,
          rotation,
          duration: 1.2,
          ease: "elastic.out(1, 0.35)",
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rotation]);

  return (
    <div
      ref={ref}
      className="relative z-10"
      style={{ width: 640, aspectRatio: "16/9", overflow: "hidden" }}
    >
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-black" />
      )}
    </div>
  );
}
