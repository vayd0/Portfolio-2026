"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { emitVel } from "@/lib/velBus";

export default function HorizontalScroll({ children, loopEvery }: { children: React.ReactNode; loopEvery?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetX = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let prevScrollLeft = 0;
    let smoothVel = 0;

    const truePanel = () => {
      if (!loopEvery || container.children.length < 2) return container.clientWidth;
      const first = container.children[0] as HTMLElement;
      const second = container.children[1] as HTMLElement;
      return second.offsetLeft - first.offsetLeft;
    };

    const proximitySnap = () => {
      const pw = truePanel();
      const nearest = Math.round(container.scrollLeft / pw) * pw;
      const distance = Math.abs(container.scrollLeft - nearest);
      if (distance > 1 && distance < pw * 0.08) {
        targetX.current = nearest;
        gsap.to(container, { scrollLeft: nearest, duration: 1.2, ease: "power1.out" });
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) return;
      e.preventDefault();
      const maxScroll = container.scrollWidth - container.clientWidth;
      targetX.current = Math.max(0, Math.min(maxScroll, targetX.current + e.deltaY));
      gsap.to(container, {
        scrollLeft: targetX.current,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true,
        onComplete: proximitySnap,
      });
    };

    const onContainerScroll = () => {
      if (!loopEvery || window.innerWidth < 768) return;
      const pw = truePanel();
      const cycleWidth = loopEvery * pw;

      let jumpDelta = 0;
      if (container.scrollLeft >= 2 * cycleWidth) jumpDelta = -cycleWidth;
      else if (container.scrollLeft < pw * 0.5) jumpDelta = cycleWidth;
      if (jumpDelta === 0) return;

      const newScrollLeft = container.scrollLeft + jumpDelta;
      const newTarget = targetX.current + jumpDelta;

      gsap.killTweensOf(container);
      container.scrollLeft = newScrollLeft;
      prevScrollLeft = newScrollLeft;
      targetX.current = newTarget;

      if (Math.abs(newTarget - newScrollLeft) > 2) {
        gsap.to(container, {
          scrollLeft: newTarget,
          duration: 0.25,
          ease: "power2.out",
          onComplete: proximitySnap,
        });
      }
    };

    const onResize = () => {
      if (window.innerWidth < 768) {
        gsap.killTweensOf(container);
        container.scrollLeft = 0;
        targetX.current = 0;
      }
    };

    if (window.innerWidth >= 768) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
      if (loopEvery) {
        const firstOfCopy2 = container.children[loopEvery] as HTMLElement | undefined;
        const startX = firstOfCopy2 ? firstOfCopy2.offsetLeft : loopEvery * container.clientWidth;
        container.scrollLeft = startX;
        targetX.current = startX;
      } else {
        targetX.current = container.scrollLeft;
      }
    }

    prevScrollLeft = container.scrollLeft;

    let lastPalette = "";
    const velTick = () => {
      if (window.innerWidth < 768) {
        smoothVel *= 0.85;
        emitVel(smoothVel * 0.15);
        const ph = window.innerHeight;
        const numPanels = loopEvery ?? container.children.length;
        const pos = window.scrollY / ph;
        const idxA = Math.floor(pos) % numPanels;
        const idxB = Math.ceil(pos) % numPanels;
        const t = pos % 1;
        const childA = container.children[idxA] as HTMLElement | undefined;
        const childB = container.children[idxB] as HTMLElement | undefined;
        window.dispatchEvent(new CustomEvent("section:scroll-progress", {
          detail: { paletteA: childA?.dataset.palette ?? "", paletteB: childB?.dataset.palette ?? "", t },
        }));
        return;
      }
      const raw = container.scrollLeft - prevScrollLeft;
      prevScrollLeft = container.scrollLeft;
      const delta = Math.max(-200, Math.min(200, raw));
      smoothVel += (delta - smoothVel) * 0.14;
      smoothVel *= 0.78;
      emitVel(smoothVel * 0.4);

      const pw = truePanel();
      const numPanels = loopEvery ?? container.children.length;
      const pos = container.scrollLeft / pw;
      const idxA = Math.floor(pos) % numPanels;
      const idxB = Math.ceil(pos) % numPanels;
      const t = pos % 1;
      const childA = container.children[idxA] as HTMLElement | undefined;
      const childB = container.children[idxB] as HTMLElement | undefined;
      window.dispatchEvent(new CustomEvent("section:scroll-progress", {
        detail: {
          paletteA: childA?.dataset.palette ?? "",
          paletteB: childB?.dataset.palette ?? "",
          t,
        }
      }));
    };
    gsap.ticker.add(velTick);

    const onSnapTo = (e: Event) => {
      if (window.innerWidth < 768) return;
      const x = (e as CustomEvent<{ x: number }>).detail.x;
      gsap.killTweensOf(container);
      targetX.current = x;
      gsap.to(container, { scrollLeft: x, duration: 0.5, ease: "power3.out" });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("scroll", onContainerScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll:snapTo", onSnapTo);
    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("scroll", onContainerScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll:snapTo", onSnapTo);
      gsap.ticker.remove(velTick);
      emitVel(0);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [loopEvery]);

  useEffect(() => {
    if (!loopEvery) return;
    let ticking = false;
    let snapTimer: ReturnType<typeof setTimeout> | null = null;

    const proximitySnapMobile = () => {
      if (window.innerWidth >= 768) return;
      const ph = window.innerHeight;
      const nearest = Math.round(window.scrollY / ph) * ph;
      const distance = Math.abs(window.scrollY - nearest);
      if (distance > 1 && distance < ph * 0.12) {
        window.scrollTo({ top: nearest, behavior: "smooth" });
      }
    };

    const onMobileScroll = () => {
      if (window.innerWidth >= 768 || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const dvh = window.innerHeight;
        const cycleHeight = loopEvery * dvh;
        if (window.scrollY >= cycleHeight) {
          window.scrollTo({ top: window.scrollY % cycleHeight, behavior: "instant" });
        }
        ticking = false;
      });
      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(proximitySnapMobile, 120);
    };

    window.addEventListener("scroll", onMobileScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onMobileScroll);
      if (snapTimer) clearTimeout(snapTimer);
    };
  }, [loopEvery]);

  return (
    <div
      ref={containerRef}
      data-scroll-container
      className="flex flex-col overflow-x-hidden md:flex-row md:h-full md:overflow-x-auto md:items-center"
      style={{
        scrollbarWidth: "none",
        backgroundColor: "#ffffff",
        backgroundImage: "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
        backgroundSize: "120px 120px",
      }}
    >
      {children}
    </div>
  );
}
