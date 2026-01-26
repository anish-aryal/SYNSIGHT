import React from 'react';
import { Card, CardBody } from 'reactstrap';

export default function StatsCard({ icon: Icon, label, value, change, color, isLoading = false }) {
  return (
    <Card className="stat-card h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className={`stat-icon stat-icon-${color}`}>
            <Icon size={24} />
          </div>
          {!isLoading && change ? (
            <span className="badge bg-light text-dark">{change}</span>
          ) : null}
        </div>
        {isLoading ? (
          <div className="skeleton-wrapper mt-0">
            <div className="skeleton-line" style={{ width: '45%', height: '24px' }} />
            <div className="skeleton-line" style={{ width: '60%', height: '14px' }} />
          </div>
        ) : (
          <>
            <h3 className="stat-value mb-1">{value}</h3>
            <p className="stat-label mb-0 text-muted">{label}</p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
