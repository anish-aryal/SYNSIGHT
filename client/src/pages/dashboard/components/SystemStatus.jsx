import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { AlertCircle } from 'lucide-react';

export default function SystemStatus() {
  const statusItems = [
    { label: 'API Status', value: 'Operational', status: 'success' },
    { label: 'Data Processing', value: 'Normal', status: 'success' },
    { label: 'Rate Limit', value: '8.4K / 10K', status: 'normal' },
    { label: 'Subscription Ending on', value: '21 Days', status: 'normal' }
  ];

  return (
    <Card className="h-100">
      <CardBody>
        <div className="d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} />
          <h5 className="card-title mb-0">System Status</h5>
        </div>
        
        <div className="status-list">
          {statusItems.map((item, idx) => (
            <div key={idx} className="status-item d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted small">{item.label}</span>
              <span className={`fw-medium small status-${item.status}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}