import React from 'react';
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import { trackCtaClick } from '../utils/tracking';

export default function Hero() {
  const handlePrimaryCta = () => {
    trackCtaClick({
      ctaName: 'hero_primary_audit_cta',
      location: 'hero_section',
      target: '#lead-form',
      text: 'Claim Free Growth Audit'
    });
  };

  const handleSecondaryCta = () => {
    trackCtaClick({
      ctaName: 'hero_secondary_results_cta',
      location: 'hero_section',
      target: '#results',
      text: 'View Case Studies'
    });
  };

  return (
    <section id="hero" className="hero-section">
      <div className="hero-glow-backdrop" aria-hidden="true" />

      <div className="hero-container">
        {/* Eyebrow badge */}
        <div className="hero-eyebrow animate-fade-in">
          <Sparkles size={14} className="eyebrow-icon" />
          <span>Proven Demand Generation Engine for B2B SaaS</span>
        </div>

        {/* Main Headline */}
        <h1 className="hero-title animate-fade-up">
          Predictable B2B Pipeline. <br />
          <span className="text-gradient">Zero Vanity Metrics.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle animate-fade-up delay-1">
          We architect full-funnel paid acquisition, high-intent outbound, and closed-loop revenue attribution models that consistently convert B2B ad spend into verified pipeline and closed-won ARR.
        </p>

        {/* Action Buttons */}
        <div className="hero-actions animate-fade-up delay-2">
          <a href="#lead-form" className="btn btn-primary btn-lg" onClick={handlePrimaryCta}>
            <span>Claim Free Growth Audit</span>
            <ArrowRight size={18} />
          </a>
          <a href="#results" className="btn btn-secondary btn-lg" onClick={handleSecondaryCta}>
            <span>View Case Studies</span>
          </a>
        </div>

        {/* Trust Points */}
        <div className="hero-guarantees animate-fade-up delay-3">
          <div className="guarantee-item">
            <CheckCircle2 size={16} className="text-accent" />
            <span>Guaranteed Pipeline SLA</span>
          </div>
          <div className="guarantee-item">
            <CheckCircle2 size={16} className="text-accent" />
            <span>Multi-Touch Revenue Attribution</span>
          </div>
          <div className="guarantee-item">
            <CheckCircle2 size={16} className="text-accent" />
            <span>HubSpot & Salesforce Ready</span>
          </div>
        </div>

        {/* Key Performance Indicators Bar */}
        <div className="hero-metrics-grid animate-fade-up delay-4">
          <div className="metric-card">
            <div className="metric-header">
              <TrendingUp size={20} className="metric-icon" />
              <span className="metric-badge">+340%</span>
            </div>
            <div className="metric-value">3.4x</div>
            <div className="metric-label">Average Pipeline Velocity Increase</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <ShieldCheck size={20} className="metric-icon" />
              <span className="metric-badge">Verified</span>
            </div>
            <div className="metric-value">$48M+</div>
            <div className="metric-label">Closed-Won ARR Attributed in 2025–2026</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <Sparkles size={20} className="metric-icon" />
              <span className="metric-badge">Efficiency</span>
            </div>
            <div className="metric-value">4.2x</div>
            <div className="metric-label">Average Paid Media ROAS on B2B Campaigns</div>
          </div>
        </div>
      </div>
    </section>
  );
}
