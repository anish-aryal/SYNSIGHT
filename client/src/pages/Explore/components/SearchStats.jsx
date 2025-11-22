import React from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';
import { Search, Clock, TrendingUp } from 'lucide-react';

export default function SearchStats() {
  const stats = [
    {
      id: 1,
      label: 'Total Searches',
      value: '248',
      icon: Search,
      iconColor: '#2196F3'
    },
    {
      id: 2,
      label: 'This Week',
      value: '42',
      icon: Clock,
      iconColor: '#9C27B0'
    },
    {
      id: 3,
      label: 'Avg. Sentiment',
      value: '64%',
      icon: TrendingUp,
      iconColor: '#4CAF50'
    }
  ];

  return (
    <Row className="g-4 mt-2">
      {stats.map((stat) => (
        <Col key={stat.id} xs={12} md={4}>
          <Card className="border-1 shadow-sm p-3">
            <CardBody>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                    {stat.label}
                  </p>
                  <h2 className="fw-bold mb-0">{stat.value}</h2>
                </div>
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: `${stat.iconColor}20`
                  }}
                >
                  <stat.icon size={24} color={stat.iconColor} />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
}