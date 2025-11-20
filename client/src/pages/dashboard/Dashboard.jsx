import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import StatsCard from './components/StatsCard';
import RecentProjects from './components/RecentProjects';
import QuickActions from './components/QuickActions';
import SystemStatus from './components/SystemStatus';
import { Folder, FileText, Database, AlertCircle } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const stats = [
    { icon: Folder, label: 'Active Projects', value: 12, change: '+3', color: 'primary' },
    { icon: FileText, label: 'Reports Generated', value: 48, change: '+12', color: 'purple' },
    { icon: Database, label: 'Data Sources', value: 2, change: '', color: 'success' },
    { icon: AlertCircle, label: 'Alerts', value: 3, change: '+1', color: 'warning' }
  ];

  return (
    <div className="dashboard-page">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2 className="dashboard-title mb-1">Hi👋 Anish</h2>
            <p className="text-muted">Here is how your sentiment analysis is going</p>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          {stats.map((stat, idx) => (
            <Col key={idx} xs={12} sm={6} lg={3} className="mb-3">
              <StatsCard {...stat} />
            </Col>
          ))}
        </Row>

        {/* Recent Projects */}
        <Row className="mb-4">
          <Col xs={12}>
            <RecentProjects />
          </Col>
        </Row>

        {/* Quick Actions and System Status */}
        <Row>
          <Col xs={12} lg={8} className="mb-3 mb-lg-0">
            <QuickActions />
          </Col>
          <Col xs={12} lg={4}>
            <SystemStatus />
          </Col>
        </Row>
      </Container>
    </div>
  );
}