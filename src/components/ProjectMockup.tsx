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
        gsap.set(el, { y: -600, rotation: 0 });
        gsap.timeline()
          .to(el, { opacity: 1, duration: 0.01 })
          .to(el, { y: 0, duration: 1.4, ease: "bounce.out" }, 0)
          .to(el, { rotation, duration: 0.35, ease: "power3.out" }, 1.0);
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
