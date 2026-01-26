import React from 'react';
import { Container } from 'reactstrap';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function Landing() {
  return (
      <Container fluid className=" px-5">
      <LandingNavbar />
        <main className='px-2 px-lg-5'>
          <HeroSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
       </Container>
  );
}
