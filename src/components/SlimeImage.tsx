"use client";

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import gsap from "gsap";

const TOP = "8%";
const X = "4%";

export interface SlimeImageHandle {
  enter: () => void;
  leave: () => void;
}

const SlimeImage = forwardRef<SlimeImageHandle, {
  src: string;
  alt: string;
  className?: string;
  background?: string;
  blackBgRef?: React.Ref<HTMLDivElement>;
}>(function SlimeImage({
  src,
  alt,
  className,
  background = "#000",
  blackBgRef,
}, handle) {
  const innerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

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
    gsap.to(gradientRef.current, { opacity: 1, duration: 0.4, ease: "power2.out" });
  };

  const onLeave = () => {
    gsap.to(innerRef.current, { top: TOP, right: X, bottom: TOP, left: X, duration: 0.5, ease: "power3.inOut" });
    gsap.to(gradientRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" });
  };

  useImperativeHandle(handle, () => ({ enter: onEnter, leave: onLeave }));

  return (
    <div className={className} style={{ background: "black" }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div ref={gradientRef} style={{ position: "absolute", inset: 0, background, opacity: 0, pointerEvents: "none" }} />
      <div ref={blackBgRef} style={{ position: "absolute", inset: 0, background: "black", opacity: 0, pointerEvents: "none" }} />
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
});

export default SlimeImage;
