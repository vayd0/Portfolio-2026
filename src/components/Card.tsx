"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SlimeImage from "./SlimeImage";

gsap.registerPlugin();

interface CardProps {
  title: string;
  image?: string;
  index: number;
  color?: string;
  noSquish?: boolean;
}

function getRotation(index: number): number {
  return ((index * 137.508) % 7) - 3.5;
}

function blobSquish(el: HTMLElement) {
  gsap.timeline()
    .to(el, { scaleY: 0.88, scaleX: 1.08, duration: 0.1, ease: "power2.in" })
    .to(el, { scaleY: 1.05, scaleX: 0.97, duration: 0.16, ease: "power2.out" })
    .to(el, { scaleY: 1, scaleX: 1, duration: 0.2, ease: "elastic.out(1, 0.4)" });
}

import { buildBlobPath, BLOB_AMP as AMP } from "@/lib/blobPath";

export default function Card({ title, image, index, color = "#e8e8e8", noSquish }: CardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const radiusProxy = useRef({ r: 0 });
  const phaseRef = useRef(0);
  const tickerRef = useRef<(() => void) | null>(null);
  const rotation = getRotation(index);

  useGSAP(() => {
    gsap.set(blobRef.current, { opacity: 0 });
    gsap.set(contentRef.current, { opacity: 0 });
  }, { scope: innerRef });

  const startWave = (W: number, H: number) => {
    if (tickerRef.current) return;
    const cx = -AMP;
    const cy = H + AMP;
    const tick = () => {
      phaseRef.current += 0.035;
      const blob = blobRef.current;
      if (!blob) return;
      const r = radiusProxy.current.r;
      blob.style.clipPath = `path('${buildBlobPath(cx, cy, r, phaseRef.current)}')`;
    };
    gsap.ticker.add(tick);
    tickerRef.current = tick;
  };

  const stopWave = () => {
    if (tickerRef.current) {
      gsap.ticker.remove(tickerRef.current);
      tickerRef.current = null;
    }
    const blob = blobRef.current;
    if (blob) {
      blob.style.clipPath = "";
      gsap.set(blob, { opacity: 0 });
    }
  };

  const onEnter = () => {
    if (wrapperRef.current) blobSquish(wrapperRef.current);
    const el = innerRef.current;
    if (!el) return;
    const W = el.offsetWidth;
    const H = el.offsetHeight;
    const cx = -AMP;
    const cy = H + AMP;
    const rMax = Math.sqrt((W - cx) ** 2 + (0 - cy) ** 2) + AMP + 10;
    radiusProxy.current.r = 0;
    gsap.set(blobRef.current, { opacity: 1 });
    startWave(W, H);
    gsap.killTweensOf(radiusProxy.current);
    gsap.to(radiusProxy.current, { r: rMax, duration: 0.7, ease: "expo.out" });
    gsap.killTweensOf(contentRef.current);
    gsap.to(contentRef.current, { opacity: 1, duration: 0.25, delay: 0.2, ease: "power2.out" });
  };

  const onLeave = () => {
    gsap.killTweensOf(radiusProxy.current);
    gsap.to(radiusProxy.current, { r: 0, duration: 0.5, ease: "power3.inOut", onComplete: stopWave });
    gsap.killTweensOf(contentRef.current);
    gsap.to(contentRef.current, { opacity: 0, duration: 0.15, ease: "power2.in" });
  };

  return (
    <div
      ref={wrapperRef}
      className="card-wrapper"
      style={{ rotate: `${rotation}deg` }}
      onMouseEnter={noSquish ? undefined : onEnter}
      onMouseLeave={noSquish ? undefined : onLeave}
    >
      <div
        ref={innerRef}
        className="relative overflow-hidden"
        style={{ aspectRatio: "16/9", backgroundColor: color }}
      >
        {image ? (
          <SlimeImage src={image} alt={title} className="absolute inset-0" />
        ) : (
          <div className="absolute inset-0 bg-[#d4d4d4]" />
        )}

        <div
          ref={blobRef}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#92FF33",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div
          ref={contentRef}
          className="absolute flex flex-col items-center justify-center"
          style={{ inset: 0, zIndex: 3, pointerEvents: "none" }}
        >
          <span className="leading-tight text-center px-4 whitespace-nowrap" style={{ color: "#000000", fontFamily: "Fat, sans-serif", fontSize: "clamp(1.8rem, 4vw, 3.5rem)", WebkitTextStroke: "2px #92FF33", paintOrder: "stroke fill" }}>
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}
