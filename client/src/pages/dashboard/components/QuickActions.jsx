import React from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';
import { PlusSquare, FileText, BarChart3, TrendingUp } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { icon: PlusSquare, title: 'New Project', desc: 'Create a new workspace' },
    { icon: FileText, title: 'Generate Report', desc: 'Create sentiment report' },
    { icon: BarChart3, title: 'View Dashboard', desc: 'Analytics overview' },
    { icon: TrendingUp, title: 'Explore Trends', desc: 'Trending topics' }
  ];

  return (
    <Card className="h-100">
      <CardBody>
        <div className="mb-4">
          <h5 className="card-title mb-1">Quick Actions</h5>
          <p className="text-muted small mb-0">Common tasks and workflows</p>
        </div>
        
        <Row>
          {actions.map((action, idx) => (
            <Col key={idx} xs={12} md={6} className="mb-3">
              <div className="action-card d-flex align-items-start gap-3 p-3">
                <action.icon size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="fw-medium mb-1">{action.title}</div>
                  <small className="text-muted">{action.desc}</small>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  );
}
