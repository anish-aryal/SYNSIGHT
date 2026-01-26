import React from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';
import { PlusSquare, FileText, BarChart3, TrendingUp } from 'lucide-react';

export default function QuickActions({ onAction }) {
  const actions = [
    { id: 'new-project', icon: PlusSquare, title: 'New Project', desc: 'Create a new workspace' },
    { id: 'generate-report', icon: FileText, title: 'Generate Report', desc: 'Create sentiment report' },
    { id: 'refresh-dashboard', icon: BarChart3, title: 'View Dashboard', desc: 'Analytics overview' },
    { id: 'explore-trends', icon: TrendingUp, title: 'Explore Trends', desc: 'Trending topics' }
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
              <div
                className="action-card d-flex align-items-start gap-3 p-3"
                role={onAction ? 'button' : undefined}
                tabIndex={onAction ? 0 : undefined}
                onClick={() => onAction?.(action.id)}
                onKeyDown={(event) => {
                  if (!onAction) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onAction(action.id);
                  }
                }}
              >
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
