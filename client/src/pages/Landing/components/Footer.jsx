import React from 'react';
import { Container, Row, Col, Input, Button } from 'reactstrap';
import { BarChart3 } from 'lucide-react';

export default function Footer() {
  const essentials = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Industry', href: '/industry' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Contact', href: '/contact' }
  ];

  const resources = [
    { label: 'Design System', href: '/design-system' },
    { label: 'Careers', href: '/careers' },
    { label: 'Assets', href: '/assets' },
    { label: 'Github', href: '/github' },
    { label: 'Events', href: '/events' }
  ];

  const locations = [
    { city: 'London', time: '13:10', address: '222 Address Line, City, Postal, Country' },
    { city: 'Kathmandu', time: '15:10', address: '222 Address Line, City, Postal, Country' },
    { city: 'Toronto', time: '21:10', address: '222 Address Line, City, Postal, Country' }
  ];

  return (
    <footer className="bg-light pt-5">
      <Container>
        {/* Top Section */}
        <Row className="pb-5">
          <Col lg={4} className="mb-4 mb-lg-0">
            <p className="text-uppercase text-muted small mb-3 fw-medium letter-spacing">
              Subscribe to our Newsletter
            </p>
            <div className="d-flex gap-2 mb-2">
              <Input 
                type="email" 
                placeholder="example@gmail.com"
                className="border rounded-2"
              />
              <Button className="gradient-primary border-0 px-4">
                Subscribe
              </Button>
            </div>
            <small className="text-muted">No spam, we promise! Only value to your business.</small>
          </Col>

          <Col lg={2} className="offset-lg-2 mb-4 mb-lg-0">
            <p className="text-uppercase text-muted small mb-3 fw-medium letter-spacing">
              Essentials
            </p>
            <ul className="list-unstyled">
              {essentials.map((link, index) => (
                <li key={index} className="mb-2">
                  <a href={link.href} className="text-dark text-decoration-none small footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          <Col lg={2} className="mb-4 mb-lg-0">
            <p className="text-uppercase text-muted small mb-3 fw-medium letter-spacing">
              Resources
            </p>
            <ul className="list-unstyled">
              {resources.map((link, index) => (
                <li key={index} className="mb-2">
                  <a href={link.href} className="text-dark text-decoration-none small footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Col>
        </Row>

        {/* Logo Section */}
        <div className="footer-logo-section text-center rounded-4 py-5 my-4">
          <div className="d-flex align-items-center justify-content-center gap-3">
            <BarChart3 size={80} className="footer-logo-icon" />
            <span className="footer-logo-text display-3 fw-bold">SYNSIGHT</span>
          </div>
        </div>

        {/* Locations Section */}
        <Row className="py-4 border-top border-bottom">
          {locations.map((location, index) => (
            <Col md={4} key={index} className="mb-3 mb-md-0">
              <h6 className="fw-semibold mb-1">
                {location.city} — <span className="fw-normal">{location.time}</span>
              </h6>
              <small className="text-muted">{location.address}</small>
            </Col>
          ))}
        </Row>

        {/* Bottom Section */}
        <Row className="py-4 align-items-center">
          <Col md={6}>
            <small className="text-muted">© 2025 SYNSIGHT AI. All rights Reserved.</small>
          </Col>
          <Col md={6} className="text-md-end">
            <small className="text-muted">Website by Anish Aryal</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}