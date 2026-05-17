export default function BrowserFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.13)", background: "#e2e2e2", flexShrink: 0 }}>
      <div style={{ background: "#d4d4d4", padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57", flexShrink: 0 }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e", flexShrink: 0 }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
        <div style={{ flex: 1, marginLeft: 6, background: "#fff", borderRadius: 4, height: 18, opacity: 0.55 }} />
      </div>
      <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
}
