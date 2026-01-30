import React from 'react';
import { Lightbulb } from 'lucide-react';

// Key Insights Card UI block for Chat page.

export default function KeyInsightsCard({ insights }) {
  const getInsightsList = () => {
    if (!insights) return [];
    if (Array.isArray(insights)) return insights;
    
    const list = [];
    if (insights.overall) list.push(insights.overall);
    if (insights.peakEngagement) list.push(insights.peakEngagement);
    if (insights.topDrivers && Array.isArray(insights.topDrivers)) {
      list.push(`Top sentiment drivers: ${insights.topDrivers.join(', ')}`);
    }
    if (insights.platformComparison) list.push(insights.platformComparison);
    if (insights.platformsAnalyzed) list.push(insights.platformsAnalyzed);
    
    return list;
  };

  const insightsList = getInsightsList();

  if (insightsList.length === 0) return null;

  // Layout and appearance
  return (
    <div className="insights-card">
      <div className="insights-header">
        <span className="insights-icon gradient-primary">
          <Lightbulb size={16} color="white" />
        </span>
        <h6 className="insights-title">Key Insights</h6>
      </div>
      <div className="insights-list">
        {insightsList.map((insight, index) => (
          <div key={index} className="insight-item">
            <span className="insight-bullet">•</span>
            <span className="insight-text">{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
