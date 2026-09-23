import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SocialProof from './components/SocialProof';
import Pricing from './components/Pricing';
import LeadForm from './components/LeadForm';
import Footer from './components/Footer';
import EventInspector from './components/EventInspector';
import { trackPageView } from './utils/tracking';
import './App.css';

export default function App() {
  useEffect(() => {
    // 1. Initial Marketing Tracking: Page View Event
    trackPageView(document.title, window.location.pathname);
  }, []);

  return (
    <div className="app-layout">
      {/* Header / Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main id="main-content">
        <Hero />
        <Features />
        <SocialProof />
        <Pricing />
        <LeadForm />
      </main>

      {/* Footer */}
      <Footer />

      {/* Live In-Browser Tracking & CRM Inspector HUD */}
      <EventInspector />
    </div>
  );
}
