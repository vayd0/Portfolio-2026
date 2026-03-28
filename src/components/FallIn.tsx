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

    gsap.set(el, { opacity: 0 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(el);
        gsap.set(el, { y: -500 });
        gsap.killTweensOf(el);
        gsap.timeline({ delay })
          .to(el, { y: 0, opacity: 1, duration: 1.2, ease: "bounce.out" })
          .to(el, { scaleY: 0.82, scaleX: 1.1, duration: 0.12, ease: "power2.in" }, ">-0.18")
          .to(el, { scaleY: 1.06, scaleX: 0.97, duration: 0.18, ease: "power2.out" })
          .to(el, { scaleY: 0.96, scaleX: 1.02, duration: 0.1, ease: "power2.inOut" })
          .to(el, { scaleY: 1, scaleX: 1, duration: 0.22, ease: "elastic.out(1, 0.4)" });
      },
      { threshold: 0.4, rootMargin: "0px 0px 120px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref}>{children}</div>;
}
