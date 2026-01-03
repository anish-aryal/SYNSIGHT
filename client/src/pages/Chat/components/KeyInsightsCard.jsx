import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { Lightbulb } from 'lucide-react';

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

  return (
    <Card className="insights-card border-0">
      <CardBody className="p-0">
        <Row>
          <Col xs={12}>
            <div className="insights-header">
              <Lightbulb size={18} color="white" />
              <h6 className="insights-title">Key Insights</h6>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <div className="insights-list">
              {insightsList.map((insight, index) => (
                <div key={index} className="insight-item">
                  <span className="insight-bullet">•</span>
                  <span className="insight-text">{insight}</span>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}