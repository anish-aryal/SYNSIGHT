import React from 'react';
import { Card, CardBody, Button, Badge } from 'reactstrap';
import { TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import { Flame } from 'lucide-react';

export default function TopicCard({ topic }) {
  const getSentimentBadge = () => {
    const colors = {
      positive: '#DCFCE7',
      neutral: 'secondary',
      negative: 'danger'
    };
    const bgColors = {
      positive: 'bg-success-subtle text-success',
      neutral: 'bg-secondary-subtle text-secondary',
      negative: 'bg-danger-subtle text-danger'
    };

    return (
      <Badge className={`${bgColors[topic.sentiment]} px-2 py-1 rounded-1 fw-normal`}>
        {topic.sentiment}
      </Badge>
    );
  };

  const getTrendIcon = () => {
    return topic.trend > 0 ? (
      <TrendingUp size={16} className="text-success" />
    ) : (
      <TrendingDown size={16} className="text-danger" />
    );
  };

  return (
    <Card className="border-1 p-3 shadow-sm h-100">
      <CardBody className="d-flex flex-column gap-2">
        {/* Category Badge and Trend */}
        <div className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-2 d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: topic.categoryColor
                }}
              >
                <Flame size={22} color="white" />
              </div>
              <span className="fw-medium px-3 py-1 bg-secondary bg-opacity-10 rounded 2" style={{ fontSize: '14px' }}>
                {topic.category}
              </span>
            </div>
            <div className="d-flex align-items-center gap-1 text-success">
              {getTrendIcon()}
              <span className="fw-semibold" style={{ fontSize: '14px' }}>
                {topic.trend}%
              </span>
            </div>
          </div>
          {/* Title */}
          <span className="fw-normal fs-5 mb-5" style={{ letterSpacing: '-0.15px' }}>{topic.title}</span>
        </div>




    <div className="d-flex flex-column">
         <div className="d-flex justify-content-between align-items-center mb-3 mt-auto">
          <div className="d-flex align-items-center gap-2 text-muted">
            <MessageSquare size={16} />
            <span style={{ fontSize: '14px' }}>{topic.mentions} mentions</span>
          </div>
          {getSentimentBadge()}
        </div>

        {/* Analyze Button */}
        <Button
          color="white"
          className="w-100 border-1 border-secondary border-opacity-25 fw-medium"
        >
          Analyze
        </Button>
    </div>
        {/* Mentions and Sentiment */}
     
      </CardBody>
    </Card>
  );
}