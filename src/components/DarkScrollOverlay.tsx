"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface Props {
  panelRef: React.RefObject<HTMLElement | null>;
}

export default function DarkScrollOverlay({ panelRef }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current || window.innerWidth < 768) return;
    const panel = panelRef.current;

    let scrollRoot: HTMLElement | null = panel.parentElement;
    while (scrollRoot) {
      if (getComputedStyle(scrollRoot).overflowX === "auto") break;
      scrollRoot = scrollRoot.parentElement;
    }
    if (!scrollRoot) return;
    const container = scrollRoot;

    let targetR = 0;
    let currentR = 0;

    const updateTarget = () => {
      const panelLeft = panel.getBoundingClientRect().left;
      const W = window.innerWidth;
      targetR = Math.max(0, (1 - Math.abs(panelLeft) / W) * 140);
    };

    const GAPS = [10, 6, 3, 1.5];
    const RING_W = 3;
    const SHELL_W = 5;

    const tick = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const factor = targetR < currentR ? 0.03 : 0.1;
      currentR += (targetR - currentR) * factor;
      if (Math.abs(currentR - targetR) < 0.05) currentR = targetR;

      if (currentR < 0.5) {
        overlay.style.clipPath = "circle(0vmax at 0% 50%)";
        overlay.style.maskImage = "";
        (overlay.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = "";
        return;
      }

      const r = currentR;
      const segs: Array<{ from: number; to: number; black: boolean }> = [
        { from: r, to: r + SHELL_W, black: true },
      ];

      let pos = r;
      for (const gap of GAPS) {
        const gapFrom = Math.max(0, pos - gap);
        segs.push({ from: gapFrom, to: pos, black: false });
        pos = gapFrom;
        if (pos <= 0) break;
        const ringFrom = Math.max(0, pos - RING_W);
        segs.push({ from: ringFrom, to: pos, black: true });
        pos = ringFrom;
      }
      if (pos > 0) segs.push({ from: 0, to: pos, black: true });

      segs.sort((a, b) => a.from - b.from);

      const stops: string[] = ["black 0"];
      let prevBlack = true;
      for (const seg of segs) {
        const c = seg.black ? "black" : "transparent";
        if (seg.black !== prevBlack) stops.push(`${c} ${seg.from}vmax`);
        stops.push(`${c} ${seg.to}vmax`);
        prevBlack = seg.black;
      }
      if (prevBlack) stops.push(`transparent ${r + SHELL_W}vmax`);

      const mask = `radial-gradient(circle at 0% 50%, ${stops.join(", ")})`;
      overlay.style.clipPath = `circle(${r + SHELL_W}vmax at 0% 50%)`;
      overlay.style.maskImage = mask;
      (overlay.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = mask;
    };

    updateTarget();
    container.addEventListener("scroll", updateTarget, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      container.removeEventListener("scroll", updateTarget);
      gsap.ticker.remove(tick);
    };
  }, [panelRef]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
        clipPath: "circle(0vmax at 0% 50%)",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}
