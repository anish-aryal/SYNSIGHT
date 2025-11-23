import React from 'react';
import { Container, Row, Col, Button, Badge } from 'reactstrap';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../../../assets/landinghero.jpg';

export default function HeroSection() {
  const stats = [
    { value: '10M+', label: 'Posts Analyzed' },
    { value: '50K+', label: 'Active Users' },
    { value: '99.9%', label: 'Accuracy' },
    { value: '24/7', label: 'Monitoring' }
  ];

  return (
    <section className="hero-section py-5">
      <Container className="py-5">
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <Badge className="hero-badge mb-3 px-3 py-2 rounded-pill fw-medium">
              Powered by Advanced AI
            </Badge>
            
            <h1 className="display-5 fw-bold mb-4 lh-sm">
              Social Media Sentiment Analysis Made Simple
            </h1>
            
            <p className="text-muted mb-4 fs-6 lh-lg">
              Understand what your audience really thinks. Analyze sentiment across social media 
              platforms, track trends, and get actionable insights to improve your brand reputation.
            </p>

            <div className="d-flex gap-3 mb-5">
              <Link to="/register">
                <Button className="gradient-primary border-0 d-flex align-items-center gap-2 px-4 py-2">
                  Get Started <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login">
                <Button color="light" className="border px-4 py-2">
                  Log In
                </Button>
              </Link>
            </div>

            <div className="d-flex gap-4 flex-wrap">
              {stats.map((stat, index) => (
                <div key={index} className="pe-4 border-end">
                  <h5 className="mb-0 fw-bold">{stat.value}</h5>
                  <small className="text-muted">{stat.label}</small>
                </div>
              ))}
            </div>
          </Col>

          <Col lg={6}>
            <div className="rounded-4 overflow-hidden shadow-lg">
              <img 
                src={heroImage}
                alt="Social Media Analysis"
                className="w-100 h-auto"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}