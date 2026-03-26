"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(SplitText);

interface Props {
  children: string;
  className?: string;
}

function idleSquish(char: Element) {
  gsap.timeline({
    onComplete: () => setTimeout(() => idleSquish(char), 1400 + Math.random() * 1200),
  })
    .to(char, { scaleY: 1.18, scaleX: 0.86, y: -10, duration: 0.16, ease: "power2.out" })
    .to(char, { scaleY: 0.68, scaleX: 1.26, y:   8, duration: 0.1,  ease: "power4.in"  })
    .to(char, { scaleY: 1.14, scaleX: 0.9,  y:  -6, duration: 0.14, ease: "power2.out" })
    .to(char, { scaleY: 0.94, scaleX: 1.04, y:   2, duration: 0.11, ease: "power2.inOut" })
    .to(char, { scaleY: 1,    scaleX: 1,    y:   0, duration: 0.55, ease: "elastic.out(1, 0.3)" });
}

export default function AnimatedTitle({ children, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const split = new SplitText(ref.current, { type: "chars" });

    split.chars.forEach((char, i) => {
      const el = char as HTMLElement;
      const fromTop = -(el.getBoundingClientRect().top + el.offsetHeight + 10);

      gsap.set(char, {
        display: "inline-block",
        transformOrigin: "bottom center",
        y: fromTop,
        scaleX: 0.55,
        scaleY: 1.35,
      });

      gsap.timeline({
        delay: i * 0.09,
        onComplete: () => setTimeout(() => idleSquish(char), 600 + i * 120),
      })
        .to(char, { y: 0, duration: 0.9, ease: "bounce.out" })
        .to(char, { scaleX: 1, scaleY: 1, duration: 0.9, ease: "elastic.out(1, 0.5)" }, "<")
        .to(char, { scaleY: 1.5,  scaleX: 0.75, duration: 0.12, ease: "power2.out" })
        .to(char, { scaleY: 0.72, scaleX: 1.22, duration: 0.1,  ease: "power2.in" })
        .to(char, { scaleY: 1,    scaleX: 1,    duration: 0.35, ease: "elastic.out(1, 0.4)" });
    });
  }, { scope: ref });

  return (
    <h1 ref={ref} className={className}>
      {children}
    </h1>
  );
}
