"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface Props {
  title: string;
  className?: string;
}

export default function ProjectTitle({ title, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const letters = title.split("");

  useEffect(() => {
    const words = wordRefs.current.filter((el): el is HTMLSpanElement => el !== null);
    if (!words.length) return;

    gsap.set(words, { y: "-110%" });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(words, {
            y: 0,
            duration: 1.4,
            stagger: 0.12,
            ease: "elastic.out(1, 0.38)",
          });
        } else {
          gsap.killTweensOf(words);
          gsap.set(words, { y: "-110%" });
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [title]);

  const onEnter = () => {
    gsap.to(lineRef.current, { scaleX: 1, duration: 1.1, ease: "elastic.out(1, 0.38)" });
    const els = letterRefs.current.filter(Boolean);
    gsap.to(els, {
      y: "-18%",
      duration: 0.5,
      stagger: { each: 0.04, repeat: -1, yoyo: true },
      ease: "power2.inOut",
    });
  };

  const onLeave = () => {
    gsap.to(lineRef.current, { scaleX: 0, duration: 0.35, ease: "power3.in" });
    const els = letterRefs.current.filter(Boolean);
    gsap.killTweensOf(els);
    gsap.to(els, { y: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" });
  };

  let letterIndex = 0;

  return (
    <div
      ref={containerRef}
      className={className}
      data-ball-title
      data-ball-surface
      style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.15em" }}>
        {title.split(" ").map((word, wi) => {
          const wordEl = (
            <span key={wi} style={{ display: "inline-block", overflow: "hidden", pointerEvents: "none" }}>
              <span
                ref={(el) => { wordRefs.current[wi] = el; }}
                style={{ display: "inline-flex", pointerEvents: "none" }}
              >
                {word.split("").map((char) => {
                  const li = letterIndex++;
                  return (
                    <span
                      key={li}
                      ref={(el) => { letterRefs.current[li] = el; }}
                      style={{ display: "inline-block", pointerEvents: "none" }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            </span>
          );
          letterIndex;
          return wordEl;
        })}
      </div>
      <span
        ref={lineRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "0.06em",
          background: "currentColor",
          transformOrigin: "left center",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}
