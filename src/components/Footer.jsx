import React from 'react';
import { Zap, Mail, Phone, MapPin } from 'lucide-react';
import { trackCtaClick } from '../utils/tracking';

export default function Footer() {
  const handleFooterLink = (linkName, target) => {
    trackCtaClick({
      ctaName: 'footer_link_click',
      location: 'footer',
      target,
      text: linkName
    });
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-main-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <a href="#hero" className="brand-logo footer-logo">
              <div className="logo-icon-wrap">
                <Zap className="logo-icon" size={20} />
              </div>
              <span className="logo-text">VELOCE<span className="logo-accent">GROWTH</span></span>
            </a>
            <p className="footer-tagline">
              The high-velocity demand generation and revenue attribution partner for high-growth B2B SaaS and technology companies.
            </p>
            <div className="social-links-row">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h2 className="footer-heading">Solutions</h2>
            <ul className="footer-links-list">
              <li><a href="#services" onClick={() => handleFooterLink('Paid Media', '#services')}>B2B Paid Media</a></li>
              <li><a href="#services" onClick={() => handleFooterLink('Inbound & SEO', '#services')}>High-Intent Inbound</a></li>
              <li><a href="#services" onClick={() => handleFooterLink('Account-Based Marketing', '#services')}>Precision ABM</a></li>
              <li><a href="#services" onClick={() => handleFooterLink('Revenue Attribution', '#services')}>Closed-Loop Attribution</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-links-col">
            <h2 className="footer-heading">Company</h2>
            <ul className="footer-links-list">
              <li><a href="#results" onClick={() => handleFooterLink('Case Studies', '#results')}>Client Case Studies</a></li>
              <li><a href="#pricing" onClick={() => handleFooterLink('Pricing & SLAs', '#pricing')}>Pricing & Guarantees</a></li>
              <li><a href="#lead-form" onClick={() => handleFooterLink('Growth Audit', '#lead-form')}>Request Audit</a></li>
              <li><a href="#hero" onClick={() => handleFooterLink('About Us', '#hero')}>Methodology</a></li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="footer-links-col">
            <h2 className="footer-heading">Contact</h2>
            <ul className="footer-contact-list">
              <li className="contact-item">
                <MapPin size={16} className="contact-icon text-accent" />
                <span>500 Howard Street, Suite 400, San Francisco, CA</span>
              </li>
              <li className="contact-item">
                <Mail size={16} className="contact-icon text-accent" />
                <a href="mailto:growth@velocepartners.com">growth@velocepartners.com</a>
              </li>
              <li className="contact-item">
                <Phone size={16} className="contact-icon text-accent" />
                <a href="tel:+14155550198">+1 (415) 555-0198</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Veloce Growth Partners LLC. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <a href="#hero">Privacy Policy</a>
            <span>&middot;</span>
            <a href="#hero">Terms of Service</a>
            <span>&middot;</span>
            <a href="#hero">Security & GDPR</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
