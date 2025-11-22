import React from 'react';
import { Card, CardBody, Button, InputGroup, Input } from 'reactstrap';
import { Calendar, Eye, Download, Search } from 'lucide-react';

export default function ReportsList({ reports, searchQuery, setSearchQuery }) {
  const getSentimentColor = (sentiment) => {
    if (sentiment >= 60) {
      return '#10b981'; // Green for positive
    } else if (sentiment >= 40) {
      return '#D08700'; // Brown for neutral
    } else {
      return '#ef4444'; // Red for negative
    }
  };

  return (
    <Card className="border-1 shadow-sm">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h5 className="fw-semibold mb-1">Your Reports</h5>
            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
              Collections of analyses you've saved for future reference
            </p>
          </div>
          <InputGroup style={{ width: '250px' }}>
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-end-0"
            />
            <Button color="light" className="border border-start-0">
              <Search size={18} />
            </Button>
          </InputGroup>
        </div>

        <div className="d-flex flex-column gap-3">
          {reports.length > 0 ? (
            reports.map((report) => {
              const sentimentColor = getSentimentColor(report.avgSentiment);
              
              return (
                <div 
                  key={report.id} 
                  className="d-flex justify-content-between align-items-center p-3 border rounded-2 bg-white"
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <div className="flex-grow-1">
                    <h6 className="mb-2 fw-medium">{report.title}</h6>
                    <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '13px' }}>
                      <Calendar size={14} />
                      <span>{report.date}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                      <p className="text-muted mb-0 fs-6" >
                        Avg Sentiment
                      </p>
                      <p 
                        className="fw-normal mb-0 fs-5" 
                        style={{ 
                          color: sentimentColor
                        }}
                      >
                        {report.avgSentiment}%
                      </p>
                    </div>

                    <div className="d-flex gap-2">
                      <Button 
                        color="light" 
                        className="border-1 d-flex align-items-center gap-2 px-3"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </Button>
                      <Button 
                        color="light" 
                        className="border-1 px-3"
                      >
                        <Download size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-5">
              <p className="text-muted fs-5">No reports found</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}