import React from 'react';
import { Row, Col, Input, Button } from 'reactstrap';

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

const FooterLinks = ({ title, links }) => (
  <>
    <p className="text-uppercase text-muted small mb-3 fw-medium footer-label">{title}</p>
    <ul className="list-unstyled">
      {links.map((link, index) => (
        <li key={index} className="mb-2">
          <a href={link.href} className="text-dark text-decoration-none small footer-link">{link.label}</a>
        </li>
      ))}
    </ul>
  </>
);

export default function Footer() {
  return (
    <footer className="pt-5">
      <Row className="pb-5">
        <Col lg={4} className="mb-4 mb-lg-0">
          <p className="text-uppercase text-muted small mb-3 fw-medium footer-label">
            Subscribe to our Newsletter
          </p>
          <div className="d-flex gap-2 mb-2">
            <Input type="email" placeholder="example@gmail.com" className="border rounded-2" />
            <Button className="gradient-primary border-0 px-4">Subscribe</Button>
          </div>
          <small className="text-muted">No spam, we promise! Only value to your business.</small>
        </Col>
        <Col lg={2} className="offset-lg-2 mb-4 mb-lg-0">
          <FooterLinks title="Essentials" links={essentials} />
        </Col>
        <Col lg={2} className="mb-4 mb-lg-0">
          <FooterLinks title="Resources" links={resources} />
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="footer-logo-section text-center rounded-4 py-5 my-4">
            <div className="d-flex align-items-center justify-content-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="70" viewBox="0 0 58 52" fill="none">
                <path d="M3.422 24.6106L25.2981 47.3267C26.0234 48.0798 27.0181 48.5139 28.0634 48.5336C29.1087 48.5533 30.1191 48.157 30.8722 47.4317L53.5883 25.5556" stroke="rgba(255,255,255,0.3)" strokeWidth="6.84402" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M38.6003 28.0698V12.3013" stroke="rgba(255,255,255,0.3)" strokeWidth="6.84402" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M28.7445 28.0698V4.41702" stroke="rgba(255,255,255,0.3)" strokeWidth="6.84402" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.8895 28.0698V22.1566" stroke="rgba(255,255,255,0.3)" strokeWidth="6.84402" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="footer-logo-text display-4 fw-bold">SYNSIGHT</span>
            </div>
          </div>
        </Col>
      </Row>

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

      <Row className="py-4">
        <Col md={6}>
          <small className="text-muted">© 2025 SYNSIGHT AI. All rights Reserved.</small>
        </Col>
        <Col md={6} className="text-md-end">
          <small className="text-muted">Website by Anish Aryal</small>
        </Col>
      </Row>
    </footer>
  );
}