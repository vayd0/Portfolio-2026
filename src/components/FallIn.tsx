"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface FallInProps {
  children: React.ReactNode;
  delay?: number;
}

export default function FallIn({ children, delay = 0 }: FallInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { y: -500, autoAlpha: 0 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, {
            y: 0,
            autoAlpha: 1,
            duration: 1.2,
            delay,
            ease: "bounce.out",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref}>{children}</div>;
}
