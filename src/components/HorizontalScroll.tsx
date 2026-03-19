"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetX = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const maxScroll = container.scrollWidth - container.clientWidth;
      targetX.current = Math.max(0, Math.min(maxScroll, targetX.current + e.deltaY));

      gsap.to(container, {
        scrollLeft: targetX.current,
        duration: 0.8,
        ease: "power2.out",
        overwrite: true,
      });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-x-auto overflow-y-hidden flex items-center bg-white"
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}
