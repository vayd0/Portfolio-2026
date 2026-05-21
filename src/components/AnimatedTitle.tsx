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


function idleBreathe(char: Element, i: number) {
  gsap.to(char, {
    y: -3,
    scaleY: 1.03,
    scaleX: 0.98,
    duration: 2.2 + Math.random() * 0.6,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    delay: i * 0.12 + Math.random() * 0.4,
  });
}

export default function AnimatedTitle({ children, className, wheelStretch, gradient, stroke }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const lastCharRef = useRef<Element | null>(null);
  const mobileReadyRef = useRef(false);

  useGSAP(() => {
    if (!ref.current) return;
    const split = new SplitText(ref.current, { type: "chars" });

    if (gradient) {
      const fontSize = parseFloat(getComputedStyle(ref.current).fontSize);
      const diacriticPad = Math.round(fontSize * 0.55);

      split.chars.forEach((char) => {
        const el = char as HTMLElement;
        el.style.paddingTop = `${diacriticPad}px`;
        el.style.marginTop = `-${diacriticPad}px`;
      });

      const rects   = split.chars.map((c) => (c as HTMLElement).getBoundingClientRect());
      const minTop  = Math.min(...rects.map((r) => r.top));
      const minLeft = Math.min(...rects.map((r) => r.left));
      const width   = Math.max(...rects.map((r) => r.right)) - minLeft;
      const height  = Math.max(...rects.map((r) => r.bottom)) - minTop;

      split.chars.forEach((char, i) => {
        const el = char as HTMLElement;
        Object.assign(el.style, {
          backgroundImage: gradient,
          backgroundSize: `${width}px ${height}px`,
          backgroundPositionX: `${-(rects[i].left - minLeft)}px`,
          backgroundPositionY: `${-(rects[i].top - minTop)}px`,
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

      const isLast = i === split.chars.length - 1;
      gsap.timeline({
        delay: i * 0.1 + Math.random() * 0.04,
        onComplete: () => {
          if (isLast) mobileReadyRef.current = true;
          idleBreathe(char, i);
        },
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
    let isInNormalZone = true;
    let shakeProgress = 0;
    const maxStretch = 2.2;

    const shakeTick = () => {
      const lastChar = lastCharRef.current;
      if (!lastChar || shakeProgress <= 0) return;
      const amp = shakeProgress * 1.2;
      gsap.set(lastChar, { rotation: Math.sin(Date.now() * 0.034) * amp });
    };
    gsap.ticker.add(shakeTick);

    const onScroll = () => {
      const lastChar = lastCharRef.current;
      const titleEl = ref.current;
      if (!lastChar || !titleEl) return;

      const rightEdge = titleEl.getBoundingClientRect().right;
      const vw = window.innerWidth;
      const stretchEnd = vw * 0.85;
      const releaseAt = vw * 0.3;

      if (rightEdge <= releaseAt && !isReleased) {
        isReleased = true;
        isInNormalZone = false;
        shakeProgress = 0;
        gsap.killTweensOf(lastChar);
        gsap.timeline({
          onComplete: () => {
            gsap.set(lastChar, { transformOrigin: "bottom center" });
            idleBreathe(lastChar, 0);
          },
        })
          .to(lastChar, { scaleX: 1, scaleY: 1, y: 0, rotation: -10, duration: 0.4, ease: "power4.out" })
          .to(lastChar, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.28)" }, "-=0.05");
      } else if (rightEdge > releaseAt) {
        isReleased = false;
        if (rightEdge < stretchEnd) {
          isInNormalZone = false;
          const progress = 1 - (rightEdge - releaseAt) / (stretchEnd - releaseAt);
          shakeProgress = progress;
          gsap.killTweensOf(lastChar);
          gsap.set(lastChar, {
            scaleX: 1 + progress * (maxStretch - 1),
            scaleY: 1,
            y: 0,
            transformOrigin: "left center",
          });
        } else {
          shakeProgress = 0;
          if (!isInNormalZone) {
            isInNormalZone = true;
            gsap.killTweensOf(lastChar);
            gsap.set(lastChar, { scaleX: 1, scaleY: 1, y: 0, transformOrigin: "bottom center" });
            idleBreathe(lastChar, 0);
          }
        }
      }
    };

    scrollContainer.addEventListener("scroll", onScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
      gsap.ticker.remove(shakeTick);
    };
  }, [wheelStretch]);

  useEffect(() => {
    if (!wheelStretch || window.innerWidth >= 768) return;
    const el = ref.current;
    if (!el) return;

    let hasReleased = false;
    let ticking = false;
    let lastScrollY = 0;
    const maxStretch = 2.0;
    const releaseAt = window.innerHeight * 0.22;

    const update = () => {
      if (hasReleased) return;
      const scrollY = lastScrollY;

      if (scrollY >= releaseAt) {
        hasReleased = true;
        gsap.killTweensOf(el);
        gsap.timeline()
          .to(el, { scaleY: 1, scaleX: 1, rotation: -6, duration: 0.38, ease: "power4.out", transformOrigin: "top center" })
          .to(el, { rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.28)" }, "-=0.05");
      } else {
        const progress = Math.min(scrollY / releaseAt, 1);
        gsap.set(el, {
          scaleY: 1 + progress * (maxStretch - 1),
          transformOrigin: "top center",
        });
      }
      ticking = false;
    };

    const onScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [wheelStretch]);

  return (
    <span ref={ref} className={`${className ?? ""} whitespace-nowrap`} data-vel>
      {children}
    </span>
  );
}
