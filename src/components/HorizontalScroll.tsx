"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function HorizontalScroll({ children, loopEvery }: { children: React.ReactNode; loopEvery?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetX = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const proximitySnap = () => {
      const panelWidth = container.clientWidth;
      const nearest = Math.round(container.scrollLeft / panelWidth) * panelWidth;
      const distance = Math.abs(container.scrollLeft - nearest);
      if (distance > 1 && distance < panelWidth * 0.4) {
        targetX.current = nearest;
        gsap.to(container, { scrollLeft: nearest, duration: 0.8, ease: "power1.out" });
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) return;
      e.preventDefault();
      const panelWidth = container.clientWidth;
      const maxScroll = container.scrollWidth - panelWidth;
      targetX.current = Math.max(0, Math.min(maxScroll, targetX.current + e.deltaY));
      gsap.to(container, {
        scrollLeft: targetX.current,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true,
        onComplete: proximitySnap,
      });
    };

    const onContainerScroll = () => {
      if (!loopEvery || window.innerWidth < 768) return;
      const panelWidth = container.clientWidth;
      const cycleWidth = loopEvery * panelWidth;

      if (container.scrollLeft < cycleWidth) return;

      const newScrollLeft = container.scrollLeft % cycleWidth;
      const newTarget = ((targetX.current % cycleWidth) + cycleWidth) % cycleWidth;

      gsap.killTweensOf(container);
      container.scrollLeft = newScrollLeft;
      targetX.current = newTarget;

      if (Math.abs(newTarget - newScrollLeft) > 2) {
        gsap.to(container, {
          scrollLeft: newTarget,
          duration: 0.25,
          ease: "power2.out",
          onComplete: proximitySnap,
        });
      }
    };

    const onResize = () => {
      if (window.innerWidth < 768) {
        gsap.killTweensOf(container);
        container.scrollLeft = 0;
        targetX.current = 0;
      }
    };

    if (window.innerWidth >= 768) window.scrollTo(0, 0);

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("scroll", onContainerScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("scroll", onContainerScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [loopEvery]);

  useEffect(() => {
    if (!loopEvery) return;
    let ticking = false;

    const onMobileScroll = () => {
      if (window.innerWidth >= 768 || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const dvh = window.innerHeight;
        const cycleHeight = loopEvery * dvh;
        if (window.scrollY >= cycleHeight) {
          window.scrollTo({ top: window.scrollY % cycleHeight, behavior: "instant" });
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onMobileScroll, { passive: true });
    return () => window.removeEventListener("scroll", onMobileScroll);
  }, [loopEvery]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-x-hidden md:flex-row md:h-full md:overflow-x-auto md:items-center"
      style={{
        scrollbarWidth: "none",
        backgroundColor: "#ffffff",
        backgroundImage: "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
        backgroundSize: "120px 120px",
      }}
    >
      {children}
    </div>
  );
}
