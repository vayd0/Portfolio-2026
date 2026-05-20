"use client";

import { useRef, useEffect } from "react";

export default function DragScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startY = 0;
    let startScrollY = 0;
    let dragging = false;
    let moved = false;

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      startY = e.clientY;
      startScrollY = window.scrollY;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      if (Math.abs(dy) > 5) {
        moved = true;
        window.scrollTo(0, startScrollY - dy);
      }
    };

    const onUp = () => {
      dragging = false;
      el.style.cursor = "grab";
      el.style.userSelect = "";
      requestAnimationFrame(() => { moved = false; });
    };

    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("click", onClick, true);

    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ cursor: "grab" }}>
      {children}
    </div>
  );
}
