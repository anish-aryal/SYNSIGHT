import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { Monitor, TrendingUp, BarChart3, Sparkles, Shield, Zap } from 'lucide-react';

// Features Section UI block for Landing page.

const features = [
  { icon: Monitor, title: 'Real-time Analysis', description: 'Monitor social media sentiment as it happens across multiple platforms' },
  { icon: TrendingUp, title: 'Trending Topics', description: "Discover what's trending and analyze sentiment patterns over time" },
  { icon: BarChart3, title: 'Detailed Reports', description: 'Generate comprehensive reports with insights and recommendations' },
  { icon: Sparkles, title: 'AI-Powered Insights', description: 'Get intelligent recommendations based on sentiment analysis' },
  { icon: Shield, title: 'Secure & Private', description: 'Your data is encrypted and protected with enterprise-grade security' },
  { icon: Zap, title: 'Lightning Fast', description: 'Process thousands of posts in seconds with our optimized engine' }
];

export default function FeaturesSection() {
  // Layout and appearance
  return (
    <section className="features-section">
      <div className="landing-container">
        <Row className="justify-content-center mb-5">
          <Col
            lg={8}
            className="text-center"
            data-animate="fade-up"
            style={{ '--delay': '0ms' }}
          >
            <h2 className="fw-bold mb-3">Powerful Features for Complete Analysis</h2>
            <p className="text-muted">
              Everything you need to understand and improve your social media presence
            </p>
          </Col>
        </Row>

        <Row className="g-4 features-grid">
          {features.map((feature, index) => (
            <Col md={6} lg={4} key={feature.title}>
              <Card
                className="h-100 rounded-3 feature-card"
                data-animate="fade-up"
                style={{ '--delay': `${80 + index * 80}ms` }}
              >
                <CardBody className="p-4">
                  <div className="feature-icon-wrapper d-inline-flex p-3 rounded-3 mb-3">
                    <feature.icon size={24} className="text-primary" />
                  </div>
                  <h6 className="fw-semibold mb-2">{feature.title}</h6>
                  <p className="text-muted mb-0 small">{feature.description}</p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
