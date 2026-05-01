"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import gsap from "gsap";

const RADIUS = 40;
const GRAVITY = 0.45;
const BOUNCE = 0.58;
const FRICTION = 0.985;

export interface PhysicsBallHandle {
  spawn: () => void;
}

const PhysicsBall = forwardRef<PhysicsBallHandle>((_, ref) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const p = useRef({ active: false, x: 0, y: 0, vx: 0, vy: 0 });

  useImperativeHandle(ref, () => ({
    spawn() {
      const outer = outerRef.current;
      if (!outer) return;
      const state = p.current;
      state.x = window.innerWidth / 2;
      state.y = window.innerHeight / 2;
      state.vx = (Math.random() - 0.5) * 3;
      state.vy = 1;
      state.active = true;
      gsap.set(outer, { display: "block" });
      outer.style.left = (state.x - RADIUS) + "px";
      outer.style.top = (state.y - RADIUS) + "px";
      const inner = innerRef.current;
      if (inner) {
        gsap.killTweensOf(inner);
        gsap.set(inner, { scaleX: 1, scaleY: 1 });
      }
    },
  }));

  useEffect(() => {
    const tick = () => {
      const state = p.current;
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!state.active || !outer || !inner) return;

      state.vy += GRAVITY;
      state.x += state.vx;
      state.y += state.vy;

      const W = window.innerWidth;
      const H = window.innerHeight;
      let sx = 1, sy = 1;

      if (state.y + RADIUS >= H) {
        state.y = H - RADIUS;
        const spd = Math.abs(state.vy);
        state.vy *= -BOUNCE;
        state.vx *= FRICTION;
        if (Math.abs(state.vy) < 0.5) state.vy = 0;
        if (spd > 2) { sx = 1 + spd * 0.025; sy = Math.max(0.6, 1 - spd * 0.025); }
      }
      if (state.y - RADIUS <= 0) {
        state.y = RADIUS;
        const spd = Math.abs(state.vy);
        state.vy = Math.abs(state.vy) * BOUNCE;
        if (spd > 2) { sx = 1 + spd * 0.025; sy = Math.max(0.6, 1 - spd * 0.025); }
      }
      if (state.x - RADIUS <= 0) {
        state.x = RADIUS;
        const spd = Math.abs(state.vx);
        state.vx = Math.abs(state.vx) * BOUNCE;
        if (spd > 2) { sx = Math.max(0.6, 1 - spd * 0.025); sy = 1 + spd * 0.025; }
      }
      if (state.x + RADIUS >= W) {
        state.x = W - RADIUS;
        const spd = Math.abs(state.vx);
        state.vx = -Math.abs(state.vx) * BOUNCE;
        if (spd > 2) { sx = Math.max(0.6, 1 - spd * 0.025); sy = 1 + spd * 0.025; }
      }

      document.querySelectorAll("[data-ball-surface]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const cx = Math.max(rect.left, Math.min(state.x, rect.right));
        const cy = Math.max(rect.top, Math.min(state.y, rect.bottom));
        const dx = state.x - cx;
        const dy = state.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < RADIUS) {
          const nx = dx / dist;
          const ny = dy / dist;
          state.x = cx + nx * (RADIUS + 1);
          state.y = cy + ny * (RADIUS + 1);
          const dot = state.vx * nx + state.vy * ny;
          const spd = Math.abs(dot);
          state.vx = (state.vx - 2 * dot * nx) * BOUNCE;
          state.vy = (state.vy - 2 * dot * ny) * BOUNCE;
          if (spd > 2) {
            sx = 1 + spd * 0.025; sy = Math.max(0.6, 1 - spd * 0.025);
          }
        }
      });

      outer.style.left = (state.x - RADIUS) + "px";
      outer.style.top = (state.y - RADIUS) + "px";

      if (sx !== 1 || sy !== 1) {
        gsap.killTweensOf(inner);
        gsap.to(inner, {
          scaleX: sx, scaleY: sy, duration: 0.06, ease: "power1.out",
          onComplete: () => gsap.to(inner, { scaleX: 1, scaleY: 1, duration: 0.55, ease: "elastic.out(1, 0.4)" }),
        });
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div
      ref={outerRef}
      style={{ position: "fixed", display: "none", width: RADIUS * 2, height: RADIUS * 2, zIndex: 500, pointerEvents: "none", left: 0, top: 0 }}
    >
      <div
        ref={innerRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "linear-gradient(225deg, #0AE448, #C5FF33 50%, #D2FF5E)",
          transformOrigin: "50% 100%",
        }}
      />
    </div>
  );
});

PhysicsBall.displayName = "PhysicsBall";
export default PhysicsBall;
