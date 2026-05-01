"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import gsap from "gsap";

const RADIUS = 40;
const GRAVITY = 0.45;
const BOUNCE = 0.58;
const FRICTION = 0.985;
const MAX_BALLS = 10;

interface Ball {
  outer: HTMLDivElement;
  rotator: HTMLDivElement;
  inner: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  sleeping: boolean;
}

export interface PhysicsBallHandle {
  spawn: () => void;
}

const PhysicsBall = forwardRef<PhysicsBallHandle>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const balls = useRef<Ball[]>([]);

  useImperativeHandle(ref, () => ({
    spawn() {
      const container = containerRef.current;
      if (!container) return;

      if (balls.current.length >= MAX_BALLS) {
        const oldest = balls.current.shift()!;
        gsap.killTweensOf(oldest.inner);
        oldest.outer.remove();
      }

      const outer = document.createElement("div");
      outer.style.cssText = `position:absolute;width:${RADIUS * 2}px;height:${RADIUS * 2}px;pointer-events:none;`;
      const rotator = document.createElement("div");
      rotator.style.cssText = `width:100%;height:100%;`;
      const inner = document.createElement("div");
      inner.style.cssText = `width:100%;height:100%;border-radius:50%;background:linear-gradient(225deg,#0AE448,#C5FF33 50%,#D2FF5E);transform-origin:50% 100%;`;
      rotator.appendChild(inner);
      outer.appendChild(rotator);
      container.appendChild(outer);

      const ball: Ball = {
        outer, rotator, inner,
        x: container.clientWidth / 2,
        y: container.clientHeight / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: 2,
        rotation: 0,
        sleeping: false,
      };
      outer.style.left = (ball.x - RADIUS) + "px";
      outer.style.top = (ball.y - RADIUS) + "px";
      balls.current.push(ball);
    },
  }));

  useEffect(() => {
    let scrollEl: HTMLElement | null = null;
    let prevScrollLeft = 0;

    const tick = () => {
      const container = containerRef.current;
      if (!container || balls.current.length === 0) return;

      if (!scrollEl) {
        scrollEl = document.querySelector<HTMLElement>("[data-scroll-container]");
        if (scrollEl) prevScrollLeft = scrollEl.scrollLeft;
      }
      if (scrollEl) {
        const delta = scrollEl.scrollLeft - prevScrollLeft;
        prevScrollLeft = scrollEl.scrollLeft;
        if (Math.abs(delta) > 0.1) {
          for (const ball of balls.current) {
            ball.x += delta * 0.35;
            ball.sleeping = false;
          }
        }
      }
      const W = container.clientWidth;
      const H = container.clientHeight;
      const containerRect = container.getBoundingClientRect();
      const surfaces = document.querySelectorAll("[data-ball-surface]");

      for (const ball of balls.current) {
        if (ball.sleeping) continue;

        ball.vy += GRAVITY;
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.rotation += (ball.vx / RADIUS) * (180 / Math.PI);

        let sx = 1, sy = 1;

        if (ball.y + RADIUS >= H) {
          ball.y = H - RADIUS;
          const spd = Math.abs(ball.vy);
          ball.vy *= -BOUNCE;
          ball.vx *= FRICTION;
          if (Math.abs(ball.vy) < 0.5) ball.vy = 0;
          if (Math.abs(ball.vx) < 0.08) ball.vx = 0;
          if (ball.vy === 0 && Math.abs(ball.vx) < 0.05) ball.sleeping = true;
          if (spd > 2) { sx = 1 + spd * 0.025; sy = Math.max(0.6, 1 - spd * 0.025); }
        }
        if (ball.y - RADIUS <= 0) {
          ball.y = RADIUS;
          const spd = Math.abs(ball.vy);
          ball.vy = Math.abs(ball.vy) * BOUNCE;
          if (spd > 2) { sx = 1 + spd * 0.025; sy = Math.max(0.6, 1 - spd * 0.025); }
        }
        if (ball.x - RADIUS <= 0) {
          ball.x = RADIUS;
          const spd = Math.abs(ball.vx);
          ball.vx = Math.abs(ball.vx) * BOUNCE;
          if (spd > 2) { sx = Math.max(0.6, 1 - spd * 0.025); sy = 1 + spd * 0.025; }
        }
        if (ball.x + RADIUS >= W) {
          ball.x = W - RADIUS;
          const spd = Math.abs(ball.vx);
          ball.vx = -Math.abs(ball.vx) * BOUNCE;
          if (spd > 2) { sx = Math.max(0.6, 1 - spd * 0.025); sy = 1 + spd * 0.025; }
        }

        surfaces.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const r = {
            left: rect.left - containerRect.left,
            right: rect.right - containerRect.left,
            top: rect.top - containerRect.top,
            bottom: rect.bottom - containerRect.top,
          };
          const cx = Math.max(r.left, Math.min(ball.x, r.right));
          const cy = Math.max(r.top, Math.min(ball.y, r.bottom));
          const dx = ball.x - cx;
          const dy = ball.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < RADIUS) {
            const nx = dx / dist;
            const ny = dy / dist;
            ball.x = cx + nx * (RADIUS + 1);
            ball.y = cy + ny * (RADIUS + 1);
            const dot = ball.vx * nx + ball.vy * ny;
            const spd = Math.abs(dot);
            ball.vx = (ball.vx - 2 * dot * nx) * BOUNCE;
            ball.vy = (ball.vy - 2 * dot * ny) * BOUNCE;
            ball.sleeping = false;
            if (spd > 2) { sx = 1 + spd * 0.025; sy = Math.max(0.6, 1 - spd * 0.025); }
          }
        });

        ball.outer.style.left = (ball.x - RADIUS) + "px";
        ball.outer.style.top = (ball.y - RADIUS) + "px";
        ball.rotator.style.transform = `rotate(${ball.rotation}deg)`;

        if (sx !== 1 || sy !== 1) {
          gsap.killTweensOf(ball.inner);
          gsap.to(ball.inner, {
            scaleX: sx, scaleY: sy, duration: 0.06, ease: "power1.out",
            onComplete: () => gsap.to(ball.inner, { scaleX: 1, scaleY: 1, duration: 0.55, ease: "elastic.out(1, 0.4)" }),
          });
        }
      }

      for (let i = 0; i < balls.current.length; i++) {
        for (let j = i + 1; j < balls.current.length; j++) {
          const a = balls.current[i];
          const b = balls.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < RADIUS * 2 && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = RADIUS * 2 - dist;
            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;
            const dvx = b.vx - a.vx;
            const dvy = b.vy - a.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot < 0) {
              a.vx += dot * nx * BOUNCE;
              a.vy += dot * ny * BOUNCE;
              b.vx -= dot * nx * BOUNCE;
              b.vy -= dot * ny * BOUNCE;
              a.sleeping = false;
              b.sleeping = false;
            }
          }
        }
      }

      const ballBlackLayers = document.querySelectorAll<HTMLElement>("[data-ball-black-layer]");
      if (ballBlackLayers.length > 0) {
        let pathData = "";
        for (const ball of balls.current) {
          const r = RADIUS;
          pathData += `M ${ball.x - r} ${ball.y} A ${r} ${r} 0 1 0 ${ball.x + r} ${ball.y} A ${r} ${r} 0 1 0 ${ball.x - r} ${ball.y} Z `;
        }
        ballBlackLayers.forEach(el => { el.style.clipPath = `path('${pathData}')`; });
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
    />
  );
});

PhysicsBall.displayName = "PhysicsBall";
export default PhysicsBall;
