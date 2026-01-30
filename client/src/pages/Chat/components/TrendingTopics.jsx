import React from 'react';
import { Row, Col, Badge } from 'reactstrap';
import { TrendingUp } from 'lucide-react';

// Trending Topics UI block for Chat page.

export default function TrendingTopics({ topics, onTopicClick }) {
  // Layout and appearance
  return (
    <div className="topics-card">
      <Row className="mb-3">
        <Col xs={12}>
          <div className="topics-header">
            <TrendingUp className="topics-icon" size={18} />
            <h6 className="topics-title subheading-semibold mb-0">Trending Topics</h6>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <div className="topics-list">
            {topics.map((topic, index) => (
              <Badge
                key={index}
                className="topic-badge"
                onClick={() => onTopicClick(topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}