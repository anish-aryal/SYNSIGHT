import React from 'react';
import { Row, Col, Badge } from 'reactstrap';
import { Clock } from 'lucide-react';

export default function RecentSearches({ searches, onSearchClick }) {
  return (
    <div className="topics-card">
      <Row className="mb-3">
        <Col xs={12}>
          <div className="topics-header">
            <Clock className="topics-icon" size={18} style={{ color: '#6b7280' }} />
            <h6 className="topics-title subheading-semibold mb-0">Recent Searches</h6>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <div className="topics-list">
            {searches.map((search, index) => (
              <Badge
                key={index}
                className="topic-badge"
                onClick={() => onSearchClick(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}