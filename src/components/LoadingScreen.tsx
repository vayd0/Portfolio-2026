"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { buildBlobPath, BLOB_AMP } from "@/lib/blobPath";

const WHITE_AMP = 22;
const WHITE_FREQ = 5;

export default function LoadingScreen() {
  const greenRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const green = greenRef.current;
    const white = whiteRef.current;
    if (!green || !white) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;
    const rMaxGreen = Math.sqrt(cx * cx + cy * cy) + BLOB_AMP + 10;
    const rMaxWhite = rMaxGreen + 80;

    const gProxy = { r: rMaxGreen };
    const wProxy = { r: rMaxWhite };
    const gPhase = { v: 0 };
    const wPhase = { v: Math.PI };

    const tickGreen = () => {
      gPhase.v += 0.035;
      green.style.clipPath = `path('${buildBlobPath(cx, cy, gProxy.r, gPhase.v)}')`;
    };
    const tickWhite = () => {
      wPhase.v += 0.04;
      white.style.clipPath = `path('${buildBlobPath(cx, cy, wProxy.r, wPhase.v, WHITE_AMP, WHITE_FREQ)}')`;
    };

    gsap.ticker.add(tickGreen);
    gsap.ticker.add(tickWhite);

    gsap.to(gProxy, {
      r: 0, duration: 0.85, delay: 0.15, ease: "power3.inOut",
      onComplete: () => { gsap.ticker.remove(tickGreen); green.remove(); },
    });
    gsap.to(wProxy, {
      r: 0, duration: 0.85, delay: 0.38, ease: "power3.inOut",
      onComplete: () => { gsap.ticker.remove(tickWhite); white.remove(); },
    });

    return () => {
      gsap.ticker.remove(tickGreen);
      gsap.ticker.remove(tickWhite);
      gsap.killTweensOf(gProxy);
      gsap.killTweensOf(wProxy);
    };
  }, []);

  return (
    <>
      <div
        ref={whiteRef}
        style={{
          position: "fixed", inset: 0, zIndex: 99998,
          background: "#ffffff",
          pointerEvents: "none",
        }}
      />
      <div
        ref={greenRef}
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "linear-gradient(135deg, #92FF33, #E2FF55)",
          pointerEvents: "all",
        }}
      />
    </>
  );
}
