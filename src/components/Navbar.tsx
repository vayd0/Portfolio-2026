"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";

const FONT_STYLE: React.CSSProperties = {
  fontFamily: "Satoshi, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(0.95rem, 1.4vw, 1.5rem)",
};

function ContactSvg() {
  return (
    <svg width="296" height="101" viewBox="0 0 296 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.4033 6.2002H281.011V0H285.511V6.2002H285.6V6.21973H296V10.7197H285.6V85.2197H296V89.7197H285.6V89.7998H285.511V100.12H281.011V89.7998H17.4033V100.12H12.9033V89.7998H12.9004V89.7197H0V85.2197H12.9004V10.7197H0V6.21973H12.9004V6.2002H12.9033V0H17.4033V6.2002Z" fill="currentColor" />
    </svg>
  );
}

function ProjetsLink() {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const letters = "projets".split("");

  const onEnter = () => {
    gsap.killTweensOf(letterRefs.current);
    gsap.to(letterRefs.current, {
      y: -6,
      duration: 0.35,
      ease: "power2.out",
      stagger: { each: 0.04 },
    });
    gsap.to(letterRefs.current, {
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
      stagger: { each: 0.04 },
      delay: 0.15,
    });
  };

  const onLeave = () => {
    gsap.killTweensOf(letterRefs.current);
    gsap.to(letterRefs.current, {
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
      stagger: { each: 0.03 },
    });
  };

  return (
    <a
      href="#projets"
      style={{
        ...FONT_STYLE,
        textDecoration: "none",
        letterSpacing: "0.02em",
        color: "#000",
        pointerEvents: "auto",
        display: "inline-flex",
        overflow: "hidden",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {letters.map((char, i) => (
        <span
          key={i}
          ref={(el) => { letterRefs.current[i] = el; }}
          style={{ display: "inline-block" }}
        >
          {char}
        </span>
      ))}
    </a>
  );
}

function ContactButton() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onEnter = () => {
    gsap.killTweensOf(btnRef.current);
    gsap.to(btnRef.current, {
      scale: 1.08,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  };

  const onLeave = () => {
    gsap.killTweensOf(btnRef.current);
    gsap.to(btnRef.current, {
      scale: 1,
      duration: 0.7,
      ease: "elastic.out(1, 0.35)",
    });
  };

  return (
    <a
      ref={btnRef}
      href="mailto:hello@theoheck.fr"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        textDecoration: "none",
        width: "clamp(160px, 20vw, 260px)",
        color: "#000",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <svg ref={svgRef} width="296" height="101" viewBox="0 0 296 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.4033 6.2002H281.011V0H285.511V6.2002H285.6V6.21973H296V10.7197H285.6V85.2197H296V89.7197H285.6V89.7998H285.511V100.12H281.011V89.7998H17.4033V100.12H12.9033V89.7998H12.9004V89.7197H0V85.2197H12.9004V10.7197H0V6.21973H12.9004V6.2002H12.9033V0H17.4033V6.2002Z" fill="currentColor" />
      </svg>
      <span
        style={{
          position: "absolute",
          ...FONT_STYLE,
          letterSpacing: "0.04em",
          color: "#fff",
        }}
      >
        contact
      </span>
    </a>
  );
}

function LogoLink() {
  const ref = useRef<HTMLDivElement>(null);

  const onEnter = () => {
    gsap.killTweensOf(ref.current);
    gsap.to(ref.current, { rotate: -8, scale: 1.1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

  const onLeave = () => {
    gsap.killTweensOf(ref.current);
    gsap.to(ref.current, { rotate: 0, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.35)" });
  };

  return (
    <div ref={ref} style={{ pointerEvents: "auto", display: "inline-flex" }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Image src="/logo.png" alt="Théo Heck" width={72} height={66} style={{ objectFit: "contain" }} />
    </div>
  );
}

export default function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "clamp(12px, 2vw, 28px) clamp(20px, 3vw, 48px)",
        pointerEvents: "none",
      }}
    >
      <LogoLink />
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(20px, 3vw, 48px)" }}>
        <ProjetsLink />
        <ContactButton />
      </div>
    </nav>
  );
}
