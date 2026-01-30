import React, { useEffect } from 'react';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

// Landing page layout and interactions.

export default function Landing() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');
    root.classList.add('landing-body');
    document.body.classList.add('landing-body');

    const elements = document.querySelectorAll('[data-animate]');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    // Layout and appearance
    return () => {
      observer.disconnect();
      root.classList.remove('landing-body');
      document.body.classList.remove('landing-body');
    };
  }, []);

  return (
    <div className="landing-page">
      <LandingNavbar />
      <main className="landing-main">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
