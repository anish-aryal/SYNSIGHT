import React from 'react';
import { Card, CardBody, Badge, Button } from 'reactstrap';
import { Clock, TrendingUp } from 'lucide-react';

export default function RecentSearches({ searches }) {
  return (
    <Card className="border-1 shadow-sm mt-4">
      <CardBody>
        <div className="mb-4">
          <h4 className="fw-semibold mb-1">Recent Searches</h4>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            Your search history from the past week
          </p>
        </div>

        <div className="d-flex flex-column gap-3">
          {searches.map((search) => (
            <div 
              key={search.id} 
              className="d-flex justify-content-between align-items-center p-3 border rounded-2"
            >
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h6 className="mb-0 fw-semibold">{search.title}</h6>
                  <Badge color="light" className="px-2 py-1">
                    {search.platform}
                  </Badge>
                </div>
                <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: '13px' }}>
                  <span className="d-flex align-items-center gap-1">
                    <Clock size={14} />
                    {search.timeAgo}
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <TrendingUp size={14} />
                    {search.sentiment}% positive
                  </span>
                </div>
              </div>
              <Button color="light" className="border-1 px-3">
                View
              </Button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}