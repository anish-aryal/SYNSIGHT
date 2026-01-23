export const generateInsights = (data, query) => {
  const insights = {};
  const total = data?.total_analyzed ?? data?.totalAnalyzed ?? 0;
  const dist = data?.sentiment_distribution ?? data?.sentimentDistribution ?? data?.sentiment?.distribution ?? {
    positive: 0,
    negative: 0,
    neutral: 0
  };

  if (total > 0) {
    const positivePercent = Math.round((dist.positive / total) * 100);

    if (positivePercent >= 60) {
      insights.overall = `Overall positive sentiment (${positivePercent}%) indicates strong public reception`;
    } else if (positivePercent <= 40) {
      insights.overall = `Mixed sentiment with concerns (${100 - positivePercent}% negative/neutral)`;
    } else {
      insights.overall = `Balanced sentiment with ${positivePercent}% positive reception`;
    }
  } else {
    insights.overall = 'Not enough data to determine overall sentiment';
  }

  const kws = data?.topKeywords ?? data?.top_keywords ?? [];
  if (kws.length > 0) {
    const positives = [];
    const negatives = [];

    for (let i = 0; i < kws.length; i++) {
      const k = kws[i];
      if (k.sentiment === 'positive' && positives.length < 2) positives.push(k.keyword);
      if (k.sentiment === 'negative' && negatives.length < 2) negatives.push(k.keyword);
      if (positives.length >= 2 && negatives.length >= 2) break;
    }

    const drivers = [];
    if (positives.length) drivers.push(`${positives.join(', ')} (positive aspects)`);
    if (negatives.length) drivers.push(`${negatives.join(', ')} (concerns)`);
    insights.topDrivers = drivers;
  }

  return insights;
};
