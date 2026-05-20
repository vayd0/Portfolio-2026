export const BLOB_AMP = 38;
export const BLOB_FREQ = 3;
const SEGS = 80;

export function buildBlobPath(
  cx: number, cy: number, r: number, phase: number,
  amp = BLOB_AMP, freq = BLOB_FREQ
): string {
  const pts: string[] = [];
  for (let i = 0; i <= SEGS; i++) {
    const θ = (i / SEGS) * Math.PI * 2;
    const wr = Math.max(0, r + amp * Math.sin(freq * θ + phase));
    const x = (cx + wr * Math.cos(θ)).toFixed(1);
    const y = (cy + wr * Math.sin(θ)).toFixed(1);
    pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  pts.push("Z");
  return pts.join(" ");
}
