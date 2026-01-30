import React from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';
import { FolderOpen, BarChart3, Star, Layers } from 'lucide-react';

// Project Stats UI block for Projects page.

export default function ProjectStats({ stats }) {
  const getIcon = (iconName) => {
    const icons = {
      folder: FolderOpen,
      chart: BarChart3,
      star: Star,
      workspace: Layers
    };
    return icons[iconName] || FolderOpen;
  };

  // Layout and appearance
  return (
    <Row className="g-3 mb-4">
      {stats.map((stat) => {
        const Icon = getIcon(stat.icon);
        
        return (
          <Col key={stat.id} xs={12} sm={6} lg={3}>
            <Card className="border-1 shadow-sm h-100">
              <CardBody>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-2" style={{ fontSize: '13px' }}>
                      {stat.label}
                    </p>
                    <h3 className="fw-bold mb-0">{stat.value}</h3>
                  </div>
                  <div 
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: `${stat.iconColor}15`
                    }}
                  >
                    <Icon size={24} color={stat.iconColor} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}