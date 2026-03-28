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

    gsap.set(el, { opacity: 0 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(el);
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
          duration: 1.0,
          ease: "elastic.out(1, 0.4)",
        });
      },
      { threshold: 0.1 }
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
