export function status(s: { attended: number; missed: number }) {
  const total = s.attended + s.missed;
  return {
    total,
    percent: total ? (s.attended / total) * 100 : 0,
    skip: Math.max(0, Math.floor((100 * s.attended - 85 * total) / 85)),
    need: Math.max(0, Math.ceil((85 * total - 100 * s.attended) / 15)),
  };
}
