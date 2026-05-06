"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import SlimeImage from "@/components/SlimeImage";

interface ProjectMockupProps {
  image?: string;
  title: string;
  rotation: number;
  freeze?: boolean;
}

export default function ProjectMockup({ image, title, rotation, freeze }: ProjectMockupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasEntered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (freeze) {
      gsap.killTweensOf(el);
      gsap.set(el, { opacity: 1, y: 0, scaleY: 1, scaleX: 1, rotation });
      return;
    }

    if (hasEntered.current) return;

    gsap.set(el, { opacity: 0 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasEntered.current) return;
        hasEntered.current = true;
        observer.disconnect();
        gsap.killTweensOf(el);
        gsap.set(el, { opacity: 1, y: -(window.innerHeight * 0.6 + 200), scaleY: 3.5, scaleX: 0.3, rotation: 0 });
        gsap.to(el, {
          y: 0, scaleY: 1, scaleX: 1, rotation,
          duration: 1.5, ease: "elastic.out(1, 0.4)",
        });
      },
      { threshold: 0.1, rootMargin: "0px -30% 0px -30%" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rotation, freeze]);

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
