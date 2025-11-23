import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="my-5">
      <Row>
        <Col>
          <div className="cta-card text-center rounded-4 py-5 px-4">
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
    </section>
  );
}