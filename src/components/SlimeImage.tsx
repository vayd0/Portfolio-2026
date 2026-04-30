"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

const VERT = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
attribute float aIndex;

uniform float uTime;
uniform float uHover;
uniform vec2 uMouse;
uniform float uAspect;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec2 pos = position.xy * 1.8;

  vec2 diff = pos - uMouse;
  vec2 diffAspect = vec2(diff.x * uAspect, diff.y);
  float dist = length(diffAspect);
  float radius = 0.85;
  float force = max(0.0, 1.0 - dist / radius);
  force = force * force * force;

  pos += (diff / max(length(diff), 0.001)) * force * 0.45 * uHover;

  pos.y += sin(aIndex * 3.2 + uTime * 4.0) * 0.028 * force * uHover;
  pos.x += cos(aIndex * 2.7 + uTime * 3.5) * 0.02 * force * uHover;

  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform sampler2D tImage;
varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(tImage, vUv);
}
`;

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    gsap.set(canvas, { opacity: 0 });

    let rafId: number;
    let destroyed = false;
    const refs: { cleanup?: () => void } = {};

    (async () => {
      const { Renderer, Program, Mesh, Plane, Texture } = await import("ogl");

      if (destroyed) return;

      const parent = canvas.parentElement!;
      let w = Math.max(parent.clientWidth, 1);
      let h = Math.max(parent.clientHeight, 1);

      const renderer = new Renderer({ canvas, width: w, height: h, dpr: 1, alpha: true });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const makeGeometry = () => {
        const geo = new Plane(gl, { width: 1, height: 1, widthSegments: 24, heightSegments: 24 });
        const count = geo.attributes.position.count;
        const ids = new Float32Array(count);
        for (let i = 0; i < count; i++) ids[i] = i;
        geo.addAttribute("aIndex", { size: 1, data: ids });
        return geo;
      };

      const geometry = makeGeometry();

      const tex = new Texture(gl, {
        generateMipmaps: false,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
      });

      const img = new Image();
      img.onload = () => {
        if (destroyed) return;
        tex.image = img;
        gsap.fromTo(
          canvas,
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out", delay: 0.15 }
        );
      };
      img.onerror = () => {
        if (!destroyed) gsap.set(canvas, { opacity: 1 });
      };
      img.src = `/api/img?url=${encodeURIComponent(src)}`;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          tImage: { value: tex },
          uTime: { value: 0 },
          uHover: { value: 0 },
          uMouse: { value: [0, 0] },
          uAspect: { value: w / h },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });

      const m = { x: 0, y: 0 };
      let targetHover = 0;
      let currentHover = 0;

      const onMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        m.x = (e.clientX - rect.left) / rect.width * 2.0 - 1.0;
        m.y = 1.0 - (e.clientY - rect.top) / rect.height * 2.0;
      };
      const onEnter = () => { targetHover = 1; };
      const onLeave = () => { targetHover = 0; };

      canvas.addEventListener("mousemove", onMove);
      canvas.addEventListener("mouseenter", onEnter);
      canvas.addEventListener("mouseleave", onLeave);

      const ro = new ResizeObserver(() => {
        w = Math.max(parent.clientWidth, 1);
        h = Math.max(parent.clientHeight, 1);
        renderer.setSize(w, h);
        program.uniforms.uAspect.value = w / h;
      });
      ro.observe(parent);

      let time = 0;

      function frame() {
        if (destroyed) return;
        rafId = requestAnimationFrame(frame);
        time += 0.016;

        currentHover += (targetHover - currentHover) * 0.1;

        program.uniforms.uTime.value = time;
        program.uniforms.uHover.value = currentHover;
        program.uniforms.uMouse.value = [m.x, m.y];

        gl.clear(gl.COLOR_BUFFER_BIT);
        renderer.render({ scene: mesh });
      }

      frame();

      refs.cleanup = () => {
        canvas.removeEventListener("mousemove", onMove);
        canvas.removeEventListener("mouseenter", onEnter);
        canvas.removeEventListener("mouseleave", onLeave);
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
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
      role="img"
      aria-label={alt}
    />
  );
}
