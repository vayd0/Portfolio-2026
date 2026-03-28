"use client";

import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

interface Props {
  children: string;
  className?: string;
  wheelStretch?: boolean;
  gradient?: string;
  stroke?: string;
}

interface Personality {
  rotAmp: number;
  scaleAmp: number;
}

function idleSquish(char: Element, p: Personality) {
  gsap.timeline({
    onComplete: () => setTimeout(() => idleSquish(char, p), 800 + Math.random() * 1800),
  })
    .to(char, { scaleY: 1.28 * p.scaleAmp, scaleX: 0.76 / p.scaleAmp, y: -18, rotation: p.rotAmp, duration: 0.14, ease: "power2.out" })
    .to(char, { scaleY: 0.52,              scaleX: 1.45 * p.scaleAmp, y:  14, rotation: -p.rotAmp * 0.5, duration: 0.1, ease: "power4.in" })
    .to(char, { scaleY: 1.22 * p.scaleAmp, scaleX: 0.85,              y:  -8, rotation: p.rotAmp * 0.3,  duration: 0.13, ease: "power2.out" })
    .to(char, { scaleY: 0.91,              scaleX: 1.06,              y:   3, rotation: -p.rotAmp * 0.1, duration: 0.11, ease: "power2.inOut" })
    .to(char, { scaleY: 1,                 scaleX: 1,                 y:   0, rotation: 0,               duration: 0.75, ease: "elastic.out(1, 0.2)" });
}

export default function AnimatedTitle({ children, className, wheelStretch, gradient, stroke }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const lastCharRef = useRef<Element | null>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const split = new SplitText(ref.current, { type: "chars" });

    if (gradient) {
      const rects = split.chars.map((c) => (c as HTMLElement).getBoundingClientRect());
      const charsTop  = Math.min(...rects.map((r) => r.top));
      const charsLeft = Math.min(...rects.map((r) => r.left));
      const charsH    = Math.max(...rects.map((r) => r.bottom)) - charsTop;
      const charsW    = Math.max(...rects.map((r) => r.right)) - charsLeft;

      const topPad     = charsH * 0.45;
      const gradTop    = charsTop - topPad;
      const gradHeight = charsH + topPad;

      split.chars.forEach((char, i) => {
        const el = char as HTMLElement;
        Object.assign(el.style, {
          backgroundImage: gradient,
          backgroundSize: `${charsW}px ${gradHeight}px`,
          backgroundPositionX: `${-(rects[i].left - charsLeft)}px`,
          backgroundPositionY: `${-(rects[i].top - gradTop)}px`,
          webkitBackgroundClip: "text",
          backgroundClip: "text",
          webkitTextFillColor: "transparent",
          ...(stroke ? { webkitTextStroke: stroke } : {}),
        });
      });
    }

    split.chars.forEach((char, i) => {
      const el = char as HTMLElement;
      const fromTop = -(el.getBoundingClientRect().top + el.offsetHeight + window.innerHeight * 0.6);

      const personality: Personality = {
        rotAmp: 4 + Math.random() * 9,
        scaleAmp: 0.88 + Math.random() * 0.38,
      };

      const entryRot = (Math.random() - 0.5) * 600;
      const landRot = (Math.random() - 0.5) * 18;

      gsap.set(char, {
        display: "inline-block",
        transformOrigin: "bottom center",
        y: fromTop,
        scaleX: 0.38,
        scaleY: 1.7,
        rotation: entryRot,
      });

      gsap.timeline({
        delay: i * 0.1 + Math.random() * 0.04,
        onComplete: () => setTimeout(() => idleSquish(char, personality), 500 + i * 150 + Math.random() * 300),
      })
        .to(char, { y: 0, duration: 1.0, ease: "bounce.out" })
        .to(char, { rotation: 0, duration: 0.75, ease: "power3.out" }, "<")
        .to(char, { scaleX: 1, scaleY: 1, duration: 1.0, ease: "elastic.out(1, 0.4)" }, "<")
        .to(char, { scaleY: 0.38, scaleX: 1.6,  rotation: landRot, duration: 0.11, ease: "power3.out" })
        .to(char, { scaleY: 1.45, scaleX: 0.72, rotation: -landRot * 0.4, duration: 0.15, ease: "power2.out" })
        .to(char, { scaleY: 0.85, scaleX: 1.1,  duration: 0.11, ease: "power2.inOut" })
        .to(char, { scaleY: 1,    scaleX: 1, rotation: 0, duration: 0.55, ease: "elastic.out(1, 0.32)" });
    });

    if (wheelStretch && split.chars.length > 0) {
      lastCharRef.current = split.chars[split.chars.length - 1];
    }
  }, { scope: ref });

  useEffect(() => {
    if (!wheelStretch || !ref.current) return;

    let el: HTMLElement | null = ref.current.parentElement;
    while (el) {
      const style = getComputedStyle(el);
      if (style.overflowX === "auto" || style.overflowX === "scroll") break;
      el = el.parentElement;
    }
    const scrollContainer = el;
    if (!scrollContainer) return;

    let isReleased = false;
    const maxStretch = 3.5;

    const onScroll = () => {
      const lastChar = lastCharRef.current;
      if (!lastChar) return;

      const scrollLeft = scrollContainer.scrollLeft;
      const introWidth = window.innerWidth;
      const releaseAt = introWidth * 0.6;

      if (scrollLeft >= releaseAt && !isReleased) {
        isReleased = true;
        gsap.killTweensOf(lastChar);
        gsap.timeline({
          onComplete: () => gsap.set(lastChar, { transformOrigin: "bottom center" }),
        })
          .to(lastChar, {
            scaleX: 1,
            scaleY: 1,
            y: 0,
            rotation: -10,
            duration: 0.4,
            ease: "power4.out",
          })
          .to(lastChar, {
            rotation: 0,
            duration: 0.9,
            ease: "elastic.out(1, 0.28)",
          }, "-=0.05");
      } else if (scrollLeft < releaseAt) {
        isReleased = false;
        const progress = Math.min(scrollLeft / introWidth, 1);
        gsap.killTweensOf(lastChar);
        gsap.set(lastChar, {
          scaleX: 1 + progress * (maxStretch - 1),
          scaleY: 1,
          y: 0,
          rotation: 0,
          transformOrigin: progress > 0 ? "left center" : "bottom center",
        });
      }
    };

    scrollContainer.addEventListener("scroll", onScroll);
    return () => scrollContainer.removeEventListener("scroll", onScroll);
  }, [wheelStretch]);

  return (
    <h1 ref={ref} className={className}>
      {children}
    </h1>
  );
}
