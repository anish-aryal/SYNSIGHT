import React from 'react';
import { Card, CardBody } from 'reactstrap';

export default function StatsCard({ icon: Icon, label, value, change, color }) {
  return (
    <Card className="stat-card h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className={`stat-icon stat-icon-${color}`}>
            <Icon size={24} />
          </div>
          {change && (
            <span className="badge bg-light text-dark">{change}</span>
          )}
        </div>
        <h3 className="stat-value mb-1">{value}</h3>
        <p className="stat-label mb-0 text-muted">{label}</p>
      </CardBody>
    </Card>
  );
}