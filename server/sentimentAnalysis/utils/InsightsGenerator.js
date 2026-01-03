export const generateInsights = (data, query) => {
  const insights = {};

  // Overall sentiment insight
  const positivePercent = Math.round((data.sentiment_distribution.positive / data.total_analyzed) * 100);
  if (positivePercent >= 60) {
    insights.overall = `Overall positive sentiment (${positivePercent}%) indicates strong public reception`;
  } else if (positivePercent <= 40) {
    insights.overall = `Mixed sentiment with concerns (${100 - positivePercent}% negative/neutral)`;
  } else {
    insights.overall = `Balanced sentiment with ${positivePercent}% positive reception`;
  }

  // Peak engagement
  if (data.timeAnalysis && data.timeAnalysis.length > 0) {
    const peakHour = data.timeAnalysis.reduce((max, curr) => 
      curr.volume > max.volume ? curr : max
    );
    const timeLabel = peakHour.hour < 12 ? 'AM' : 'PM';
    const displayHour = peakHour.hour % 12 || 12;
    insights.peakEngagement = `Peak engagement observed at ${displayHour} ${timeLabel}`;
  }

  // Top drivers
  if (data.topKeywords && data.topKeywords.length > 0) {
    const positiveKeywords = data.topKeywords
      .filter(k => k.sentiment === 'positive')
      .slice(0, 2)
      .map(k => k.keyword);
    
    const negativeKeywords = data.topKeywords
      .filter(k => k.sentiment === 'negative')
      .slice(0, 2)
      .map(k => k.keyword);

    const drivers = [];
    if (positiveKeywords.length > 0) {
      drivers.push(`${positiveKeywords.join(', ')} (positive aspects)`);
    }
    if (negativeKeywords.length > 0) {
      drivers.push(`${negativeKeywords.join(', ')} (concerns)`);
    }
    
    insights.topDrivers = drivers;
  }

  return insights;
};