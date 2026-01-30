import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// CTA Section UI block for Landing page.

export default function CTASection() {
  // Layout and appearance
  return (
    <section className="cta-section">
      <div className="landing-container">
        <Row>
          <Col>
            <div
              className="cta-card text-center rounded-4 py-5 px-4"
              data-animate="zoom"
              style={{ '--delay': '0ms' }}
            >
              <h2 className="text-white fw-bold mb-3">Ready to Get Started?</h2>
              <p className="cta-subtitle mb-4">
                Join thousands of businesses using SentimentAI to understand their audience better
              </p>
              <Link to="/signup">
                <Button color="light" className="d-inline-flex align-items-center gap-2 fw-semibold px-4 py-2">
                  Start Your First Analysis <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
