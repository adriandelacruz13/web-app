import React, { lazy, Suspense, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SocialProof from './components/SocialProof';
import Pricing from './components/Pricing';
import LeadForm from './components/LeadForm';
import Footer from './components/Footer';
import { trackPageView } from './utils/tracking';
import './App.css';

// The debugging HUD is an optional dev/QA tool — split it out so it never
// ships in the critical path of the marketing experience.
const EventInspector = lazy(() => import('./components/EventInspector'));

export default function App() {
  useEffect(() => {
    // Initial Marketing Tracking: Page View Event (StrictMode-safe, deduped)
    trackPageView(document.title, window.location.pathname);
  }, []);

  return (
    <div className="app-layout">
      {/* Accessibility: skip navigation for keyboard/screen-reader users */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

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

      {/* Live In-Browser Tracking & CRM Inspector HUD (lazy-loaded) */}
      <Suspense fallback={null}>
        <EventInspector />
      </Suspense>
    </div>
  );
}