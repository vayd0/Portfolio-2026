"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function HorizontalScroll({ children }: { children: React.ReactNode }) {
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
      const maxScroll = container.scrollWidth - container.clientWidth;
      targetX.current = Math.max(0, Math.min(maxScroll, targetX.current + e.deltaY));

      gsap.to(container, {
        scrollLeft: targetX.current,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true,
        onComplete: proximitySnap,
      });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-x-hidden md:flex-row md:h-screen md:overflow-x-auto md:items-center"
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}
