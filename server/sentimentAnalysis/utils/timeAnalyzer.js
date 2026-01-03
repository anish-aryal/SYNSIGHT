export const analyzeTimeDistribution = (posts) => {
  const hourlyVolume = Array(24).fill(0);

  posts.forEach(post => {
    const date = new Date(post.created_at);
    const hour = date.getHours();
    hourlyVolume[hour]++;
  });

  return hourlyVolume.map((volume, hour) => ({ hour, volume }));
};