"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin();

interface CardProps {
  title: string;
  image?: string;
  index: number;
}

function getRotation(index: number): number {
  return ((index * 137.508) % 7) - 3.5;
}

export default function Card({ title, image, index }: CardProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rotation = getRotation(index);

  useGSAP(() => {
    gsap.set(overlayRef.current, { yPercent: 100, skewY: -10 });
  }, { scope: innerRef });

  const onEnter = () => {
    gsap.to(overlayRef.current, {
      yPercent: 0,
      duration: 0.45,
      ease: "expo.out",
    
      yoyo:true,
      repeat:-1
    });
  };

  const onLeave = () => {
    gsap.to(overlayRef.current, {
      yPercent: 80,
      duration: 0.35,
      ease: "power2.in",
    });
  };

  return (
    <div
      className="cursor-pointer"
      style={{ rotate: `${rotation}deg` }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        ref={innerRef}
        className="relative overflow-hidden"
        style={{ aspectRatio: "16/9", backgroundColor: "#e8e8e8" }}
      >
        {image ? (
          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[#d4d4d4]" />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="text-sm font-medium tracking-tight" style={{ color: "#202020" }}>
            {title}
          </span>
        </div>

        <div
          ref={overlayRef}
          className="absolute flex flex-col items-start justify-end p-5"
          style={{
            backgroundColor: "#CCDD59",
            top: "-80px",
            left: 0,
            right: 0,
            bottom: "-80px",
            paddingBottom: "100px",
          }}
        >
          <div className="flex items-center gap-3" style={{ transform: "skewY(10deg)" }}>
            <span className="text-4xl font-bold" style={{ color: "#202020" }}>→</span>
            <span className="text-xl font-bold italic leading-tight" style={{ color: "#202020" }}>
              {title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
