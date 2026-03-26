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

export default function FallPreview() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { y: -600, opacity: 0 });
    gsap.to(el, { y: 0, opacity: 1, duration: 1.2, ease: "bounce.out", delay: 0.3 });
  }, []);

  return (
    <main
      style={{
        ...gridBg,
        height: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div ref={ref} style={{ width: "min(400px, 90vw)" }}>
        <Card title="hkth.dev" index={0} image={colorImg(GREEN)} noSquish />
      </div>
    </main>
  );
}
