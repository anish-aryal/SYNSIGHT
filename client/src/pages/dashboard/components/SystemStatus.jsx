import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { AlertCircle } from 'lucide-react';

export default function SystemStatus({ items = [], isLoading = false }) {
  const statusItems = Array.isArray(items) ? items : [];

  return (
    <Card className="h-100">
      <CardBody>
        <div className="d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} />
          <h5 className="card-title mb-0">System Status</h5>
        </div>
        
        <div className="status-list">
          {isLoading ? (
            <div className="dashboard-skeleton">
              {Array.from({ length: statusItems.length || 4 }).map((_, idx) => (
                <div key={`status-skeleton-${idx}`} className="status-item d-flex justify-content-between align-items-center mb-3">
                  <div className="skeleton-line" style={{ width: '45%' }} />
                  <div className="skeleton-line skeleton-inline" style={{ width: '30%' }} />
                </div>
              ))}
            </div>
          ) : (
            statusItems.map((item, idx) => (
              <div key={idx} className="status-item d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">{item.label}</span>
                <span className={`fw-medium small status-${item.status}`}>
                  {item.value}
                </span>
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
}
