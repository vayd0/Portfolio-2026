"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

const VERT_FLAT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const CLEAR_FRAG = `
precision highp float;
void main() {
  gl_FragColor = vec4(0.5, 0.5, 0.0, 1.0);
}
`;

const VELOCITY_FRAG = `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform float uAspect;
uniform float uDecay;
uniform float uRadius;
uniform float uHover;
varying vec2 vUv;

void main() {
  vec2 vel = texture2D(tMap, vUv).rg * 2.0 - 1.0;
  vel *= uDecay;
  vec2 diff = vUv - uMouse;
  diff.x *= uAspect;
  float dist = length(diff);
  float falloff = 1.0 - smoothstep(0.0, uRadius, dist);
  falloff *= falloff;
  vel += uVelocity * falloff * uHover;
  vel = clamp(vel, -1.0, 1.0);
  gl_FragColor = vec4(vel * 0.5 + 0.5, 0.0, 1.0);
}
`;

const MASK_FRAG = `
precision highp float;
uniform sampler2D tVelocity;
uniform float uTime;
uniform float uHover;
varying vec2 vUv;

void main() {
  float t = uTime;
  float h = uHover;
  vec2 vel = texture2D(tVelocity, vUv).rg * 2.0 - 1.0;
  float velMag = length(vel) * 0.018;

  float dX = min(vUv.x, 1.0 - vUv.x);
  float dY = min(vUv.y, 1.0 - vUv.y);
  float d = min(dX, dY);
  float w = 0.0015;
  float innerX = 0.06;
  float innerY = 0.1227;
  float inInnerX = smoothstep(innerX - w, innerX + w, dX);
  float inInnerY = smoothstep(innerY - w, innerY + w, dY);
  float isInBorder = 1.0 - inInnerX * inInnerY;

  float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
  float orgOff =
    (0.5 + 0.5 * sin(angle * 5.0  + t * 1.8)) * 0.010 +
    (0.5 + 0.5 * sin(angle * 11.0 + t * 3.1)) * 0.005 +
    (0.5 + 0.5 * sin(angle * 19.0 + t * 4.3)) * 0.003;
  orgOff = (orgOff + velMag) * h;

  float outerCut = 1.0 - smoothstep(orgOff - w, orgOff + w, d);
  float mask = isInBorder * (1.0 - outerCut);
  gl_FragColor = vec4(0.0, 0.0, 0.0, mask);
}
`;

const INNER_INSET = "12.3% 6%";

export default function SlimeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const imgEl = imgRef.current;
    if (!canvas || !imgEl) return;

    gsap.set(imgEl, { opacity: 0 });

    imgEl.onload = () => {
      gsap.fromTo(imgEl, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out", delay: 0.15 });
    };
    imgEl.onerror = () => { gsap.set(imgEl, { opacity: 1 }); };
    imgEl.src = `/api/img?url=${encodeURIComponent(src)}`;

    let rafId: number;
    let destroyed = false;
    const refs: { cleanup?: () => void } = {};

    (async () => {
      const { Renderer, Program, Mesh, Triangle, RenderTarget } = await import("ogl");

      if (destroyed) return;

      const parent = canvas.parentElement!;
      let w = Math.max(parent.clientWidth, 1);
      let h = Math.max(parent.clientHeight, 1);

      const renderer = new Renderer({ canvas, width: w, height: h, dpr: 1, alpha: true });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const triGeo = new Triangle(gl);

      const makeFBO = () => new RenderTarget(gl, {
        width: w, height: h,
        minFilter: gl.LINEAR, magFilter: gl.LINEAR,
        wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE,
      });

      let fbo = [makeFBO(), makeFBO()];
      let curr = 0;

      const clearProg = new Program(gl, { vertex: VERT_FLAT, fragment: CLEAR_FRAG, depthTest: false, depthWrite: false });
      const clearMesh = new Mesh(gl, { geometry: triGeo, program: clearProg });
      renderer.render({ scene: clearMesh, target: fbo[0] });
      renderer.render({ scene: clearMesh, target: fbo[1] });

      const velProg = new Program(gl, {
        vertex: VERT_FLAT,
        fragment: VELOCITY_FRAG,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          tMap: { value: fbo[1].texture },
          uMouse: { value: [0.5, 0.5] },
          uVelocity: { value: [0, 0] },
          uAspect: { value: w / h },
          uDecay: { value: 0.93 },
          uRadius: { value: 0.28 },
          uHover: { value: 0 },
        },
      });
      const velMesh = new Mesh(gl, { geometry: triGeo, program: velProg });

      const maskProg = new Program(gl, {
        vertex: VERT_FLAT,
        fragment: MASK_FRAG,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          tVelocity: { value: fbo[0].texture },
          uTime: { value: 0 },
          uHover: { value: 0 },
        },
      });
      const maskMesh = new Mesh(gl, { geometry: triGeo, program: maskProg });

      const m = { uvX: 0.5, uvY: 0.5, vx: 0, vy: 0 };
      let targetHover = 0;
      let currentHover = 0;

      const onMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = 1 - (e.clientY - rect.top) / rect.height;
        m.vx = nx - m.uvX;
        m.vy = ny - m.uvY;
        m.uvX = nx;
        m.uvY = ny;
      };

      const wrapper = wrapperRef.current;
      const onEnter = () => { targetHover = 1; };
      const onLeave = () => { targetHover = 0; };

      canvas.addEventListener("mousemove", onMove);
      wrapper?.addEventListener("mouseenter", onEnter);
      wrapper?.addEventListener("mouseleave", onLeave);

      const ro = new ResizeObserver(() => {
        w = Math.max(parent.clientWidth, 1);
        h = Math.max(parent.clientHeight, 1);
        renderer.setSize(w, h);
        fbo = [makeFBO(), makeFBO()];
        renderer.render({ scene: clearMesh, target: fbo[0] });
        renderer.render({ scene: clearMesh, target: fbo[1] });
        curr = 0;
        velProg.uniforms.uAspect.value = w / h;
      });
      ro.observe(parent);

      let time = 0;

      function frame() {
        if (destroyed) return;
        rafId = requestAnimationFrame(frame);
        time += 0.016;

        currentHover += (targetHover - currentHover) * 0.1;

        velProg.uniforms.tMap.value = fbo[1 - curr].texture;
        velProg.uniforms.uMouse.value = [m.uvX, m.uvY];
        velProg.uniforms.uVelocity.value = [m.vx * 6, m.vy * 6];
        velProg.uniforms.uHover.value = currentHover;
        renderer.render({ scene: velMesh, target: fbo[curr] });

        m.vx *= 0.5;
        m.vy *= 0.5;

        maskProg.uniforms.tVelocity.value = fbo[curr].texture;
        maskProg.uniforms.uTime.value = time;
        maskProg.uniforms.uHover.value = currentHover;

        gl.clear(gl.COLOR_BUFFER_BIT);
        renderer.render({ scene: maskMesh });

        curr = 1 - curr;
      }

      frame();

      refs.cleanup = () => {
        canvas.removeEventListener("mousemove", onMove);
        wrapper?.removeEventListener("mouseenter", onEnter);
        wrapper?.removeEventListener("mouseleave", onLeave);
        ro.disconnect();
      };
    })();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      refs.cleanup?.();
    };
  }, [src]);

  return (
    <div ref={wrapperRef} className={className}>
      <div style={{ position: "absolute", inset: INNER_INSET, background: "#000" }}>
        <img
          ref={imgRef}
          alt={alt}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
