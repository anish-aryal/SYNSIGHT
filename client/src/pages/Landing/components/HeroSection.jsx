import React from 'react';
import { Row, Col, Button, Badge } from 'reactstrap';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../../../assets/landinghero.jpg';

// Hero Section UI block for Landing page.

const stats = [
  { value: '10M+', label: 'Posts Analyzed' },
  { value: '50K+', label: 'Active Users' },
  { value: '99.9%', label: 'Accuracy' },
  { value: '24/7', label: 'Monitoring' }
];

export default function HeroSection() {
  // Layout and appearance
  return (
    <section className="hero-section">
      <div className="landing-container">
        <Row className="align-items-center gy-5">
          <Col lg={6}>
            <div className="hero-copy">
              <Badge
                className="hero-badge mb-3 px-3 py-2 rounded-pill fw-medium"
                data-animate="fade-up"
                style={{ '--delay': '0ms' }}
              >
                Powered by Advanced AI
              </Badge>

              <h1
                className="hero-title mb-4"
                data-animate="fade-up"
                style={{ '--delay': '80ms' }}
              >
                Social Media Sentiment Analysis Made Simple
              </h1>

              <p
                className="hero-subtitle mb-4"
                data-animate="fade-up"
                style={{ '--delay': '140ms' }}
              >
                Understand what your audience really thinks. Analyze sentiment across social media
                platforms, track trends, and get actionable insights to improve your brand reputation.
              </p>

              <div
                className="hero-actions"
                data-animate="fade-up"
                style={{ '--delay': '200ms' }}
              >
                <Link to="/signup">
                  <Button className="hero-primary-btn border-0 d-flex align-items-center gap-2 px-4 py-2">
                    Get Started <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button color="light" className="hero-secondary-btn border px-4 py-2">Log In</Button>
                </Link>
              </div>

              <div className="hero-stats">
                {stats.map((stat, index) => (
                  <div
                    className="hero-stat"
                    key={stat.label}
                    data-animate="fade-up"
                    style={{ '--delay': `${260 + index * 80}ms` }}
                  >
                    <h5 className="mb-1 fw-bold">{stat.value}</h5>
                    <small className="text-muted">{stat.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          <Col lg={6}>
            <div
              className="hero-image-wrapper overflow-hidden"
              data-animate="fade-left"
              style={{ '--delay': '120ms' }}
            >
              <img src={heroImage} alt="Social Media Analysis" className="w-100 h-auto" />
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
