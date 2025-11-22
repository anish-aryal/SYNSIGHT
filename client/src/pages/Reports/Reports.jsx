import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PageHeader from '../../components/PageHeader/PageHeader';
import ReportsList from './components/ReportsList';
import EmptyReports from './components/EmptyReports';
import './Reports.css';

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState('');

  const reportsData = [
    {
      id: 1,
      title: 'Q4 Brand Analysis',
      date: '2024-11-08',
      avgSentiment: 67
    },
    {
      id: 2,
      title: 'Product Launch Review',
      date: '2024-11-05',
      avgSentiment: 74
    },
    {
      id: 3,
      title: 'Customer Satisfaction Study',
      date: '2024-11-01',
      avgSentiment: 59
    },
    {
      id: 4,
      title: 'Tesla Launch',
      date: '2024-11-01',
      avgSentiment: 59
    }
  ];

  const filteredReports = reportsData.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="reports-page">
      <Container className="mt-5">
        <Row>
          <Col>
            <PageHeader 
              title="Reports"
              subtitle="Generate, schedule, and view sentiment analysis reports"
            />
            
            {reportsData.length === 0 ? (
              <EmptyReports />
            ) : (
              <ReportsList 
                reports={filteredReports}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}