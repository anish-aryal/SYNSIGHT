import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';

// Top Keywords Chart UI block for Chat page.

export default function TopKeywordsChart({ keywords }) {
  if (!keywords || keywords.length === 0) return null;

  const topKeywords = keywords.slice(0, 5);
  const maxCount = Math.max(...topKeywords.map(k => k.count), 1);

  // Layout and appearance
  return (
    <Card className="section-card">
      <CardBody className="p-0">
        <div className="section-header">Top Keywords</div>
        <div className="section-body">
          <Row>
            <Col xs={12}>
              {topKeywords.map((keyword, index) => (
                <div key={index} className="keyword-row">
                  <span className="keyword-text">{keyword.keyword}</span>
                  <div className="keyword-bar-container">
                    <div 
                      className={`keyword-bar ${keyword.sentiment}`}
                      style={{ width: `${(keyword.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="keyword-count">{keyword.count}</span>
                </div>
              ))}
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
}
