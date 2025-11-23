import React from 'react';
import { Row, Col, Button, Badge } from 'reactstrap';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../../../assets/landinghero.jpg';

const stats = [
  { value: '10M+', label: 'Posts Analyzed' },
  { value: '50K+', label: 'Active Users' },
  { value: '99.9%', label: 'Accuracy' },
  { value: '24/7', label: 'Monitoring' }
];

export default function HeroSection() {
  return (
    <section className="hero-section py-5">
      <Row className="align-items-center gy-5 py-5">
        <Col lg={5}>
          <Badge className="hero-badge mb-3 px-3 py-2 rounded-pill fw-medium">
            Powered by Advanced AI
          </Badge>
          
          <h1 className="display-4 fw-bold mb-4 lh-1">
            Social Media Sentiment Analysis Made Simple
          </h1>
          
          <p className="text-muted mb-4 lh-lg">
            Understand what your audience really thinks. Analyze sentiment across social media 
            platforms, track trends, and get actionable insights to improve your brand reputation.
          </p>

          <div className="d-flex gap-3 mb-5">
            <Link to="/signup">
              <Button className="gradient-primary border-0 d-flex align-items-center gap-2 px-4 py-2">
                Get Started <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button color="light" className="border px-4 py-2">Log In</Button>
            </Link>
          </div>

          <Row className="g-0">
            {stats.map((stat, index) => (
              <Col xs={6} sm={3} key={index}>
                <div className="border-start border-2 ps-3">
                  <h5 className="mb-0 fw-bold">{stat.value}</h5>
                  <small className="text-muted">{stat.label}</small>
                </div>
              </Col>
            ))}
          </Row>
        </Col>

        <Col lg={7}>
          <div className="hero-image-wrapper rounded-4 overflow-hidden shadow-lg">
            <img src={heroImage} alt="Social Media Analysis" className="w-100 h-auto" />
          </div>
        </Col>
      </Row>
    </section>
  );
}