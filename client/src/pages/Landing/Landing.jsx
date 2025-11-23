import React from 'react';
import { Container } from 'reactstrap';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}