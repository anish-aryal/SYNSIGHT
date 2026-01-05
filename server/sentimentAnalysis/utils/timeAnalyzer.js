export const analyzeTimeDistribution = (posts) => {
  const hourly = Array(24).fill(0);

  for (let i = 0; i < posts.length; i++) {
    const d = new Date(posts[i]?.created_at);
    const t = d.getTime();
    if (!Number.isFinite(t)) continue;
    hourly[d.getHours()]++;
  }

  const out = new Array(24);
  for (let h = 0; h < 24; h++) out[h] = { hour: h, volume: hourly[h] };
  return out;
};
