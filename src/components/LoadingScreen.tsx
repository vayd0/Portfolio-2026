"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LoadingScreen() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      opacity: 0,
      duration: 0.4,
      delay: 0.2,
      ease: "power2.in",
      onComplete: () => el.remove(),
    });
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "all",
      }}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "linear-gradient(225deg, #92FF33, #E2FF55)",
        animation: "pulse 0.8s ease-in-out infinite alternate",
      }} />
      <style>{`@keyframes pulse { from { transform: scale(0.7); } to { transform: scale(1.1); } }`}</style>
    </div>
  );
}
