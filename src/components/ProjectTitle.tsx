"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import gsap from "gsap";

interface Props {
  title: string;
  className?: string;
  onHoverChange?: (hovered: boolean) => void;
}

export interface ProjectTitleHandle {
  enter: () => void;
  leave: () => void;
}

const ProjectTitle = forwardRef<ProjectTitleHandle, Props>(function ProjectTitle({ title, className, onHoverChange }, handle) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const hoverTween = useRef<gsap.core.Tween | null>(null);

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

  const reset = () => {
    hoverTween.current?.kill();
    hoverTween.current = null;
    const els = letterRefs.current.filter(Boolean);
    gsap.killTweensOf(els);
    gsap.to(els, { y: 0, duration: 0.4, ease: "elastic.out(1, 0.5)", stagger: { each: 0.02 } });
    gsap.killTweensOf(lineRef.current);
    gsap.to(lineRef.current, { scaleX: 0, duration: 0.35, ease: "power3.in" });
  };

  const onEnter = () => {
    hoverTween.current?.kill();
    const els = letterRefs.current.filter(Boolean);
    gsap.killTweensOf(els);
    gsap.to(lineRef.current, { scaleX: 1, duration: 1.1, ease: "elastic.out(1, 0.38)" });
    hoverTween.current = gsap.to(els, {
      y: "-18%",
      duration: 0.5,
      stagger: { each: 0.04, repeat: -1, yoyo: true },
      ease: "power2.inOut",
    });
    onHoverChange?.(true);
  };

  const onLeave = () => { reset(); onHoverChange?.(false); };

  useImperativeHandle(handle, () => ({ enter: onEnter, leave: onLeave }));

  useEffect(() => () => { hoverTween.current?.kill(); }, []);

  let letterIndex = 0;
  const allWords = title.split(" ");
  const lines = allWords.length > 1
    ? [[allWords[0]], allWords.slice(1)]
    : [[allWords[0]]];
  let wordIndex = 0;

  const renderWord = (word: string) => {
    const wi = wordIndex++;
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
    return wordEl;
  };

  return (
    <div
      ref={containerRef}
      className={className}
      data-ball-title
      data-ball-surface
      style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onPointerLeave={reset}
      onMouseDown={reset}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 0.75 }}>
        {lines.map((lineWords, li) => (
          <div key={li} style={{ display: "flex", gap: "0.15em" }}>
            {lineWords.map((word) => renderWord(word))}
          </div>
        ))}
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
});

export default ProjectTitle;
