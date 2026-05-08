"use client";

import { useRef, useEffect, forwardRef, useCallback } from "react";
import gsap from "gsap";
import { subscribeVel } from "@/lib/velBus";

interface Props {
  children: React.ReactNode;
  depthX?: number;
  depthY?: number;
  className?: string;
  style?: React.CSSProperties;
  mobileStyle?: React.CSSProperties;
}

const ParallaxShape = forwardRef<HTMLDivElement, Props>(function ParallaxShape({
  children,
  depthX = 0.05,
  depthY = 0.04,
  className,
  style,
  mobileStyle,
}, forwardedRef) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const setRef = useCallback((el: HTMLDivElement | null) => {
    (parallaxRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  }, [forwardedRef]);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = parallaxRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const qx = gsap.quickTo(outer, "x", { duration: 1.1, ease: "power3.out" });
    const qy = gsap.quickTo(outer, "y", { duration: 1.1, ease: "power3.out" });

    let mx = 0, my = 0;

    const isPanelOpen = () => !!outer.closest("[data-panel-open]");

    const onMouseMove = (e: MouseEvent) => {
      if (isPanelOpen()) return;
      mx = -(e.clientX - window.innerWidth / 2) * depthX;
      my = -(e.clientY - window.innerHeight / 2) * depthY;
      qx(mx);
      qy(my);
    };

    inner.style.transformOrigin = "bottom center";
    const unsubVel = subscribeVel((v) => { inner.style.transform = `skewX(${v * 1.5}deg)`; });

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      unsubVel();
    };
  }, [depthX, depthY]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const appliedStyle = isMobile && mobileStyle ? { ...style, ...mobileStyle } : style;

  return (
    <div ref={setRef} className={className} style={appliedStyle}>
      <div ref={innerRef} data-vel>
        {children}
      </div>
    </div>
  );
});

export default ParallaxShape;
