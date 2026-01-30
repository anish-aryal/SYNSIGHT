import React from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import SynsightLogo from '../../../components/SynsightLogo';

// Landing Navbar UI block for Landing page.

export default function LandingNavbar() {
  // Layout and appearance
  return (
    <nav className="landing-nav">
      <div className="landing-container landing-nav-inner">
        <Link to="/" className="landing-logo">
          <SynsightLogo className="landing-logo-mark" />
          <span className="landing-logo-text">SYNSIGHT</span>
        </Link>
        <div className="landing-nav-actions">
          <Link to="/login" className="landing-nav-link">Log In</Link>
          <Link to="/signup">
            <Button color="dark" size="sm" className="landing-nav-btn">Sign Up</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
