"use client";

import { useRef } from "react";
import gsap from "gsap";

interface Props {
  title: string;
  className?: string;
}

export default function ProjectTitle({ title, className }: Props) {
  const lineRef = useRef<HTMLSpanElement>(null);

  const onEnter = () => {
    gsap.to(lineRef.current, {
      scaleX: 1,
      duration: 1.1,
      ease: "elastic.out(1, 0.38)",
    });
  };

  const onLeave = () => {
    gsap.to(lineRef.current, {
      scaleX: 0,
      duration: 0.35,
      ease: "power3.in",
    });
  };

  return (
    <div
      className={className}
      style={{ display: "inline-block", cursor: "default" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {title}
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
