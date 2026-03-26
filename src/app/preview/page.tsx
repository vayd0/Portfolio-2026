"use client";

import Card from "@/components/Card";
import FallIn from "@/components/FallIn";

const GREEN = "#CCDD59";
const colorImg = (hex: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='${encodeURIComponent(hex)}' width='1' height='1'/%3E%3C/svg%3E`;

const gridBg = {
  backgroundColor: "#ffffff",
};

export default function PreviewPage() {
  return (
    <main>
      <section
        style={{
          ...gridBg,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #202020",
        }}
      >
        <div style={{ width: "min(400px, 90vw)" }}>
          <FallIn>
            <Card title="hkth.dev" index={0} image={colorImg(GREEN)} noSquish />
          </FallIn>
        </div>
      </section>

      <section
        style={{
          ...gridBg,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "min(400px, 90vw)" }}>
          <Card title="Squish Effect" index={0} image={colorImg(GREEN)} />
        </div>
      </section>
    </main>
  );
}
