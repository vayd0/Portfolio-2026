"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

const FONT_STYLE: React.CSSProperties = {
  fontFamily: "Satoshi, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(0.95rem, 1.4vw, 1.5rem)",
};

function ProjetsLink() {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const blendRef = useRef<HTMLDivElement>(null);
  const letters = "projets".split("");
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const measure = () => {
      if (!linkRef.current) return;
      const r = linkRef.current.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const onEnter = () => {
    gsap.killTweensOf(letterRefs.current);
    gsap.to(letterRefs.current, { y: -6, duration: 0.35, ease: "power2.out", stagger: { each: 0.04 } });
    gsap.to(letterRefs.current, { y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)", stagger: { each: 0.04 }, delay: 0.15 });
    gsap.killTweensOf(blendRef.current);
    gsap.to(blendRef.current, { y: -6, duration: 0.35, ease: "power2.out" });
    gsap.to(blendRef.current, { y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)", delay: 0.15 });
  };

  const onLeave = () => {
    gsap.killTweensOf(letterRefs.current);
    gsap.to(letterRefs.current, { y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)", stagger: { each: 0.03 } });
    gsap.killTweensOf(blendRef.current);
    gsap.to(blendRef.current, { y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <>
      <a
        ref={linkRef}
        href="/projets"
        style={{
          ...FONT_STYLE,
          textDecoration: "none",
          letterSpacing: "0.02em",
          color: "transparent",
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
      {mounted && rect && createPortal(
        <div
          ref={blendRef}
          aria-hidden
          style={{
            position: "fixed",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
            mixBlendMode: "difference",
            color: "white",
            zIndex: 101,
            ...FONT_STYLE,
            letterSpacing: "0.02em",
          }}
        >
          projets
        </div>,
        document.body
      )}
    </>
  );
}

function ContactButton() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onEnter = () => {
    gsap.killTweensOf(btnRef.current);
    gsap.to(btnRef.current, { scale: 1.08, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  const onLeave = () => {
    gsap.killTweensOf(btnRef.current);
    gsap.to(btnRef.current, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.35)" });
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
        width: "clamp(105px, 12vw, 175px)",
        color: "#000",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <svg ref={svgRef} width="296" height="104" viewBox="0 0 296 104" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16.0107" y="12.88" width="267" height="78" fill="white"/>
        <line x1="15.207" x2="15.207" y2="104" stroke="black" strokeWidth="4.5"/>
        <line x1="283.207" x2="283.207" y2="104" stroke="black" strokeWidth="4.5"/>
        <line x1="-2.24183e-07" y1="91.3499" x2="296" y2="91.3498" stroke="black" strokeWidth="4.5"/>
        <line x1="2.24183e-07" y1="12.3499" x2="296" y2="12.3499" stroke="black" strokeWidth="4.5"/>
      </svg>
      <span
        style={{
          position: "absolute",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4em",
          ...FONT_STYLE,
          letterSpacing: "0.04em",
          color: "#000",
        }}
      >
        <svg width="30" height="30" viewBox="0 0 59 59" style={{ marginTop: 3 }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#nav_mail_clip)">
            <path d="M40.6725 9.84888C40.671 9.84471 40.6695 9.84054 36.3452 11.3845C32.0209 12.9284 23.374 16.0205 17.9307 18.1631C12.4875 20.3056 10.51 21.4047 9.44753 22.0079C8.38506 22.611 8.29749 22.6848 8.26369 22.7749C8.19534 22.9571 8.48435 23.6535 8.87537 25.3339C9.12882 26.4231 9.20784 28.0493 9.64997 30.1612C10.0921 32.2731 10.8218 34.8361 11.4507 36.5019C12.0797 38.1676 12.5857 38.8586 13.3981 40.4807C14.2104 42.1028 15.3136 44.6351 15.918 45.9925C16.5225 47.3499 16.5948 47.4557 16.6845 47.5246C16.8573 47.6571 17.396 47.5069 19.8976 46.6813C21.9877 45.9915 25.7559 44.7876 31.1339 42.7247C36.5118 40.6618 43.3883 37.7855 46.905 36.2482C50.4217 34.7109 50.3702 34.5998 50.1924 34.3471C49.7303 33.6905 49.3344 33.1763 48.2296 29.9341C47.1698 26.8238 45.1813 20.7104 43.89 16.9284C42.5987 13.1465 42.0864 11.8741 41.8163 11.2868C41.5461 10.6995 41.5334 10.8358 41.5309 10.9633C41.5102 11.9969 41.1861 13.5558 40.3522 15.2328C39.6128 16.7197 38.1547 19.4589 36.1584 22.474C34.1621 25.4892 31.6522 28.6873 30.3059 30.3469C28.9596 32.0064 28.853 32.0303 28.7639 31.9755C28.2998 31.6898 27.7627 31.1471 24.8923 29.9061C22.4472 28.849 17.9272 27.0844 15.3997 26.1157C12.483 24.9977 11.6379 24.8523 10.9824 24.6418C10.5922 24.555 10.3139 24.5488 10.0332 24.5733C9.90124 24.5922 9.79066 24.6244 9.70448 24.7676" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round"/>
          </g>
          <defs>
            <clipPath id="nav_mail_clip">
              <rect width="45.3457" height="45.3457" fill="white" transform="translate(0 15.4136) rotate(-19.8716)"/>
            </clipPath>
          </defs>
        </svg>
        contact
      </span>
    </a>
  );
}

function LogoLink() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blendRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const measure = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const onEnter = () => {
    gsap.killTweensOf(blendRef.current);
    gsap.to(blendRef.current, { rotate: -8, scale: 1.1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

  const onLeave = () => {
    gsap.killTweensOf(blendRef.current);
    gsap.to(blendRef.current, { rotate: 0, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.35)" });
  };

  return (
    <>
      <div
        ref={containerRef}
        style={{ pointerEvents: "auto", display: "inline-flex", cursor: "pointer" }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <Image src="/logo.png" alt="Théo Heck" width={72} height={66} style={{ objectFit: "contain", opacity: 0 }} />
      </div>
      {mounted && rect && createPortal(
        <div
          ref={blendRef}
          aria-hidden
          style={{
            position: "fixed",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            pointerEvents: "none",
            mixBlendMode: "difference",
            zIndex: 101,
            transformOrigin: "center center",
          }}
        >
          <img
            src="/logo-blend.svg"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>,
        document.body
      )}
    </>
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
