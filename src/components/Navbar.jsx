import React, { useState } from 'react';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';
import { trackCtaClick } from '../utils/tracking';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCtaClick = (ctaName, target) => {
    trackCtaClick({
      ctaName,
      location: 'header_navigation',
      target,
      text: 'Get Growth Audit'
    });
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <a href="#hero" className="brand-logo" aria-label="Veloce Growth Home">
          <div className="logo-icon-wrap">
            <Zap className="logo-icon" size={20} />
          </div>
          <span className="logo-text">VELOCE<span className="logo-accent">GROWTH</span></span>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Primary Navigation">
          <a href="#services" className="nav-link">Services</a>
          <a href="#results" className="nav-link">Results</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#lead-form" className="nav-link">Contact</a>
        </nav>

        {/* Header CTA */}
        <div className="header-cta-wrap">
          <a 
            href="#lead-form" 
            className="btn btn-primary btn-sm"
            onClick={() => handleCtaClick('header_audit_button', '#lead-form')}
          >
            <span>Get Growth Audit</span>
            <ArrowRight size={15} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="mobile-drawer" aria-label="Mobile Navigation">
          <a href="#services" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#results" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Results</a>
          <a href="#pricing" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#lead-form" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <a 
            href="#lead-form" 
            className="btn btn-primary mobile-cta"
            onClick={() => handleCtaClick('mobile_menu_audit_button', '#lead-form')}
          >
            <span>Get Growth Audit</span>
            <ArrowRight size={16} />
          </a>
        </nav>
      )}
    </header>
  );
}
