type Fn = (v: number) => void;
const subs = new Set<Fn>();
export const subscribeVel = (fn: Fn): (() => void) => { subs.add(fn); return () => subs.delete(fn); };
export const emitVel = (v: number): void => subs.forEach(fn => fn(v));
