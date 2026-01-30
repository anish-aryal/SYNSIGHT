import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Button } from 'reactstrap';

// Footer UI block for Landing page.

const essentials = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Industry', href: '/industry' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' }
];

const solutions = [
  { label: 'EPM Platform', href: '/solutions/epm' },
  { label: 'Data Integrations', href: '/solutions/integrations' },
  { label: 'Data Infrastructure', href: '/solutions/infrastructure' },
  { label: 'Business Intelligence', href: '/solutions/bi' },
  { label: 'Finance Transformation', href: '/solutions/finance' }
];

const industries = [
  { label: 'Mining & Energy', href: '/industries/mining' },
  { label: 'Construction & Real Estate', href: '/industries/real-estate' },
  { label: 'Manufacturing', href: '/industries/manufacturing' },
  { label: 'Financial Services', href: '/industries/finance' },
  { label: 'Not-for-Profit', href: '/industries/non-profit' }
];

const resources = [
  { label: 'Resources', href: '/resources' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Events', href: '/events' },
  { label: 'Careers', href: '/careers' },
  { label: 'Design System', href: '/design-system' }
];

const locations = [
  { city: 'USA', timeZone: 'America/New_York', address: '222 Address Line, City, Postal, Country' },
  { city: 'London', timeZone: 'Europe/London', address: '222 Address Line, City, Postal, Country' },
  { city: 'Nepal', timeZone: 'Asia/Kathmandu', address: '222 Address Line, City, Postal, Country' }
];

const formatTime = (date, timeZone) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
};

const FooterLinks = ({ title, links }) => (
  <>
    <p className="text-uppercase small mb-3 fw-medium footer-label">{title}</p>
    <ul className="list-unstyled">
      {links.map((link, index) => (
        <li key={index} className="mb-2">
          <a href={link.href} className="text-decoration-none small footer-link">{link.label}</a>
        </li>
      ))}
    </ul>
  </>
);

export default function Footer() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Layout and appearance
    return () => clearInterval(intervalId);
  }, []);

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <Row className="footer-top pb-5 g-4" data-animate="fade-up">
          <Col lg={4} className="mb-4 mb-lg-0 footer-newsletter">
            <p className="text-uppercase small mb-3 fw-medium footer-label">
              Subscribe to our Newsletter
            </p>
            <div className="footer-input-group">
              <Input type="email" placeholder="Enter your email" className="footer-input" />
              <Button className="footer-subscribe-btn">Subscribe</Button>
            </div>
            <small className="text-muted">No spam, we promise! Only value to your business.</small>
          </Col>
          <Col lg={2} className="mb-4 mb-lg-0">
            <FooterLinks title="Essentials" links={essentials} />
          </Col>
          <Col lg={2} className="mb-4 mb-lg-0">
            <FooterLinks title="Solutions" links={solutions} />
          </Col>
          <Col lg={2} className="mb-4 mb-lg-0">
            <FooterLinks title="Industries" links={industries} />
          </Col>
          <Col lg={2} className="mb-4 mb-lg-0">
            <FooterLinks title="Resources" links={resources} />
          </Col>
        </Row>
      </div>

      <div className="landing-container">
        <div className="footer-clocks" data-animate="fade-up">
          {locations.map((location) => (
            <div key={location.city} className="footer-clock-item">
              <div className="footer-clock">
                <span className="footer-clock-city">{location.city}</span>
                <span className="footer-clock-sep">—</span>
                <span className="footer-clock-time">{formatTime(now, location.timeZone)}</span>
              </div>
              <small className="text-muted">{location.address}</small>
            </div>
          ))}
        </div>

        <Row className="footer-bottom py-4" data-animate="fade-up">
          <Col md={6}>
            <small className="text-muted">© 2025 SYNSIGHT AI. All rights Reserved.</small>
          </Col>
          <Col md={6} className="text-md-end">
            <small className="text-muted">Website by Anish Aryal</small>
          </Col>
        </Row>
      </div>
    </footer>
  );
}
