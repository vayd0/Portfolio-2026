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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
          });
        } else {
          gsap.killTweensOf(el);
          gsap.to(el, {
            y: window.innerHeight * 0.4,
            scaleY: 0.4,
            scaleX: 1.6,
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => gsap.set(el, { opacity: 0 }),
          });
        }
      },
      { threshold: 0.1, rootMargin: "0px -30% 0px -30%" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rotation, freeze]);

  return (
    <div
      ref={ref}
      className="relative z-10"
      style={{ width: 640, aspectRatio: "16/9", overflow: "hidden" }}
    >
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover object-top" />
      ) : (
        <div className="w-full h-full bg-black" />
      )}
    </div>
  );
}
