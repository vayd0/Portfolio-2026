"use client";

import { useRef, useEffect, forwardRef, useCallback } from "react";
import gsap from "gsap";

interface Props {
  children: React.ReactNode;
  depthX?: number;
  depthY?: number;
  enterX?: number;
  enterY?: number;
  enterRotation?: number;
  enterDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  mobileStyle?: React.CSSProperties;
}

const ParallaxShape = forwardRef<HTMLDivElement, Props>(function ParallaxShape({
  children,
  depthX = 0.05,
  depthY = 0.04,
  enterX = 0,
  enterY = 0,
  enterRotation = 0,
  enterDelay = 0,
  className,
  style,
  mobileStyle,
}, forwardedRef) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const setRef = useCallback((el: HTMLDivElement | null) => {
    (parallaxRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  }, [forwardedRef]);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = parallaxRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    let scrollEl: HTMLElement | null = outer.parentElement;
    while (scrollEl) {
      const s = getComputedStyle(scrollEl);
      if (s.overflowX === "auto" || s.overflowX === "scroll") break;
      scrollEl = scrollEl.parentElement;
    }
    if (!scrollEl) return;

    const qx = gsap.quickTo(outer, "x", { duration: 1.1, ease: "power3.out" });
    const qy = gsap.quickTo(outer, "y", { duration: 1.1, ease: "power3.out" });

    let mx = 0, my = 0, sx = 0;

    gsap.set(inner, { opacity: 0, x: enterX, y: enterY, rotation: enterRotation, scale: 0.7 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(inner, {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1.5,
            delay: enterDelay,
            ease: "elastic.out(1, 0.45)",
          });
        } else {
          gsap.killTweensOf(inner);
          gsap.set(inner, { opacity: 0, x: enterX, y: enterY, rotation: enterRotation, scale: 0.7 });
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(outer);

    const onMouseMove = (e: MouseEvent) => {
      mx = -(e.clientX - window.innerWidth / 2) * depthX;
      my = -(e.clientY - window.innerHeight / 2) * depthY;
      qx(mx + sx);
      qy(my);
    };

    const onScroll = () => {
      const panel = outer.parentElement;
      if (!panel) return;
      const panelCenterX = panel.getBoundingClientRect().left + panel.offsetWidth / 2;
      sx = (panelCenterX - window.innerWidth / 2) * depthX * 4;
      qx(mx + sx);
    };

    window.addEventListener("mousemove", onMouseMove);
    scrollEl.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      scrollEl!.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [depthX, depthY, enterX, enterY, enterRotation, enterDelay]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const appliedStyle = isMobile && mobileStyle ? { ...style, ...mobileStyle } : style;

  return (
    <div ref={setRef} className={className} style={appliedStyle}>
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  );
});

export default ParallaxShape;
