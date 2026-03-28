"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface Props {
  children: React.ReactNode;
  depthX?: number;
  depthY?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ParallaxShape({ children, depthX = 0.05, depthY = 0.04, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let scrollEl: HTMLElement | null = el.parentElement;
    while (scrollEl) {
      const s = getComputedStyle(scrollEl);
      if (s.overflowX === "auto" || s.overflowX === "scroll") break;
      scrollEl = scrollEl.parentElement;
    }
    if (!scrollEl) return;

    const qx = gsap.quickTo(el, "x", { duration: 1.0, ease: "power2.out" });
    const qy = gsap.quickTo(el, "y", { duration: 1.0, ease: "power2.out" });

    let mx = 0, my = 0, sx = 0;

    const onMouseMove = (e: MouseEvent) => {
      mx = -(e.clientX - window.innerWidth / 2) * depthX;
      my = -(e.clientY - window.innerHeight / 2) * depthY;
      qx(mx + sx);
      qy(my);
    };

    const onScroll = () => {
      const panel = el.parentElement;
      if (!panel) return;
      const panelCenterX = panel.getBoundingClientRect().left + panel.offsetWidth / 2;
      sx = (panelCenterX - window.innerWidth / 2) * depthX * 1.5;
      qx(mx + sx);
    };

    window.addEventListener("mousemove", onMouseMove);
    scrollEl.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      scrollEl!.removeEventListener("scroll", onScroll);
    };
  }, [depthX, depthY]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
