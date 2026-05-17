"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

const TOP = "8%";
const X = "4%";

export default function SlimeImage({
  src,
  alt,
  className,
  background = "#000",
}: {
  src: string;
  alt: string;
  className?: string;
  background?: string;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imgEl = imgRef.current;
    if (!imgEl) return;
    gsap.set(imgEl, { opacity: 0 });
    imgEl.onload = () => {
      gsap.fromTo(imgEl, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out", delay: 0.15 });
    };
    imgEl.onerror = () => { gsap.set(imgEl, { opacity: 1 }); };
    imgEl.src = `/api/img?url=${encodeURIComponent(src)}`;
  }, [src]);

  const onEnter = () => {
    gsap.to(innerRef.current, { top: "0%", right: "0%", bottom: "0%", left: "0%", duration: 0.55, ease: "power3.out" });
  };

  const onLeave = () => {
    gsap.to(innerRef.current, { top: TOP, right: X, bottom: TOP, left: X, duration: 0.5, ease: "power3.inOut" });
  };

  return (
    <div className={className} style={{ background }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div
        ref={innerRef}
        style={{ position: "absolute", top: TOP, right: X, bottom: TOP, left: X, overflow: "hidden" }}
      >
        <img
          ref={imgRef}
          alt={alt}
          style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
