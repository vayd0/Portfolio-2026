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
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
  };

  const onLeave = () => {
    gsap.to(lineRef.current, { scaleX: 0, duration: 0.35, ease: "power3.in" });
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: "inline-block", cursor: "default" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.15em" }}>
        {title.split(" ").map((word, i) => (
          <span key={i} style={{ display: "inline-block", overflow: "hidden" }}>
            <span
              ref={(el) => { wordRefs.current[i] = el; }}
              style={{ display: "inline-block" }}
            >
              {word}
            </span>
          </span>
        ))}
      </div>
      <span
        ref={lineRef}
        style={{
          display: "block",
          height: "0.06em",
          background: "#202020",
          transformOrigin: "left center",
          transform: "scaleX(0)",
          marginTop: "0.02em",
        }}
      />
    </div>
  );
}
