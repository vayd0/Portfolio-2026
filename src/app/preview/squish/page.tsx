"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import Card from "@/components/Card";

const GREEN = "#CCDD59";
const colorImg = (hex: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='${encodeURIComponent(hex)}' width='1' height='1'/%3E%3C/svg%3E`;

const gridBg = {
  backgroundColor: "#ffffff",
};

function loopSquish(el: HTMLElement) {
  gsap.timeline({ onComplete: () => setTimeout(() => loopSquish(el), 1600) })
    // anticipation exagérée
    .to(el, { scaleY: 1.15, scaleX: 0.88, y: -18, rotation: -2, duration: 0.18, ease: "power2.out" })
    // écrasement violent
    .to(el, { scaleY: 0.65, scaleX: 1.28, y: 20, rotation: 1.5, duration: 0.1, ease: "power4.in" })
    // rebond explosif
    .to(el, { scaleY: 1.2, scaleX: 0.88, y: -12, rotation: -3, duration: 0.16, ease: "power2.out" })
    // wiggle 1
    .to(el, { scaleY: 0.92, scaleX: 1.06, y: 5, rotation: 2, duration: 0.13, ease: "power2.inOut" })
    // wiggle 2
    .to(el, { scaleY: 1.05, scaleX: 0.97, y: -3, rotation: -1, duration: 0.12, ease: "power2.inOut" })
    // retour élastique
    .to(el, { scaleY: 1, scaleX: 1, y: 0, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
}

export default function SquishPreview() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = setTimeout(() => loopSquish(el), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      style={{
        ...gridBg,
        height: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div ref={ref} style={{ width: "min(400px, 90vw)" }}>
        <Card title="hkth.dev" index={0} image={colorImg(GREEN)} noSquish />
      </div>
    </main>
  );
}
