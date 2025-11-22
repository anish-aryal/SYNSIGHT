import React from 'react';
import { Card, CardBody, Badge, Button } from 'reactstrap';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function RecentSearches({ searches }) {
  const getSentimentConfig = (sentimentLabel, sentimentValue) => {
    const configs = {
      positive: {
        icon: TrendingUp,
        color: '#10b981',
        bgColor: '#d1fae5',
        textColor: '#065f46',
        text: `${sentimentValue}% positive`
      },
      negative: {
        icon: TrendingDown,
        color: '#ef4444',
        bgColor: '#fee2e2',
        textColor: '#991b1b',
        text: `${sentimentValue}% negative`
      },
      neutral: {
        icon: Minus,
        color: '#6b7280',
        bgColor: '#f3f4f6',
        textColor: '#374151',
        text: `${sentimentValue}% neutral`
      }
    };
    
    return configs[sentimentLabel] || configs.neutral;
  };

  return (
    <Card className="border-1 shadow-sm mt-4 p-3">
      <CardBody>
        <div className="mb-4">
          <h5 className="fw-regular">Recent Searches</h5>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            Your search history from the past week
          </p>
        </div>

        <div className="d-flex flex-column gap-3">
          {searches.map((search) => {
            const sentimentConfig = getSentimentConfig(search.sentimentLabel, search.sentiment);
            const SentimentIcon = sentimentConfig.icon;

            return (
              <div 
                key={search.id} 
                className="d-flex justify-content-between align-items-center p-3 border rounded-2 bg-white"
                style={{ transition: 'all 0.2s ease' }}
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <h6 className="mb-0 fw-medium">{search.title}</h6>
                    <Badge 
                      color="light" 
                      className="px-2 py-1 text-dark fw-normal border"
                    >
                      {search.platform}
                    </Badge>
                  </div>
                  <div className="d-flex align-items-center gap-3" style={{ fontSize: '13px' }}>
                    <span className="d-flex align-items-center gap-1 text-muted">
                      <Clock size={14} />
                      {search.timeAgo}
                    </span>
                    <span 
                      className="d-flex align-items-center gap-1"
                      style={{ color: sentimentConfig.textColor }}
                    >
                      <SentimentIcon size={14} style={{ color: sentimentConfig.color }} />
                      {sentimentConfig.text}
                    </span>
                  </div>
                </div>
                <Button color="light" className="border-1 px-3 fw-medium">
                  View
                </Button>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}