import { useEffect } from 'react';
import BusinessPromoSection from '../components/landing/BusinessPromoSection';
import CosmicBackground from '../components/landing/CosmicBackground';
import FeaturesSection from '../components/landing/FeaturesSection';
import Footer from '../components/landing/Footer';
import HeroSection from '../components/landing/HeroSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import IntegrationFlow from '../components/landing/IntegrationFlow';
import Navigation from '../components/landing/Navigation';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';

export default function Home() {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <CosmicBackground />
      <Navigation />
      
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <IntegrationFlow />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <BusinessPromoSection />
        <Footer />
      </div>
    </div>
  );
}