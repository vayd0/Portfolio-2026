export default function BrowserFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", background: "#111", flexShrink: 0 }}>
      <div style={{ background: "#111", padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "linear-gradient(135deg, #ff6b6b, #ff2d2d)", flexShrink: 0 }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "linear-gradient(135deg, #ffe066, #ffb300)", flexShrink: 0 }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "linear-gradient(135deg, #6bff8e, #00c853)", flexShrink: 0 }} />
        <div style={{ flex: 1, marginLeft: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 18 }} />
      </div>
      <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
}
