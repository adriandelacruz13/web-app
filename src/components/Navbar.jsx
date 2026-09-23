import React, { useState, useRef, useEffect } from 'react';
import { Zap, Menu, X, ArrowRight } from 'lucide-react';
import { trackCtaClick } from '../utils/tracking';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleBtnRef = useRef(null);
  const drawerRef = useRef(null);

  const closeMenu = () => {
    setMobileMenuOpen(false);
    // Return keyboard focus to the toggle for a smooth a11y flow.
    window.setTimeout(() => toggleBtnRef.current?.focus(), 0);
  };

  // Focus the first link when the drawer opens.
  useEffect(() => {
    if (mobileMenuOpen && drawerRef.current) {
      const first = drawerRef.current.querySelector('a[href], button:not([disabled])');
      first?.focus();
    }
  }, [mobileMenuOpen]);

  // Escape-to-close + focus trap while the drawer is open.
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll('a[href], button:not([disabled])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const handleCtaClick = (ctaName, target) => {
    trackCtaClick({
      ctaName,
      location: 'header_navigation',
      target,
      text: 'Get Growth Audit'
    });
    closeMenu();
  };

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <a href="#hero" className="brand-logo" aria-label="Veloce Growth Home">
          <div className="logo-icon-wrap">
            <Zap className="logo-icon" size={20} aria-hidden="true" />
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
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={toggleBtnRef}
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          ref={drawerRef}
          className="mobile-drawer"
          aria-label="Mobile Navigation"
          role="dialog"
          aria-modal="true"
        >
          <a href="#services" className="mobile-nav-link" onClick={closeMenu}>Services</a>
          <a href="#results" className="mobile-nav-link" onClick={closeMenu}>Results</a>
          <a href="#pricing" className="mobile-nav-link" onClick={closeMenu}>Pricing</a>
          <a href="#lead-form" className="mobile-nav-link" onClick={closeMenu}>Contact</a>
          <a
            href="#lead-form"
            className="btn btn-primary mobile-cta"
            onClick={() => handleCtaClick('mobile_menu_audit_button', '#lead-form')}
          >
            <span>Get Growth Audit</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </nav>
      )}
    </header>
  );
}