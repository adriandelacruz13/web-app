import React from 'react';
import { Check, Shield, Zap, Sparkles } from 'lucide-react';
import { trackCtaClick } from '../utils/tracking';

const tiers = [
  {
    name: 'Growth Engine',
    badge: 'Seed & Series A',
    price: '$4,500',
    period: '/ month',
    description: 'Ideal for tech companies looking to build their first predictable paid acquisition and inbound channel.',
    features: [
      'Full LinkedIn & Google Search Management',
      'Up to $25k/mo Managed Ad Spend',
      'Weekly Ad Creative & Copy Iterations',
      'Standard HubSpot or Salesforce Sync',
      'Bi-Weekly Strategic Pipeline Reviews',
      '30-Day Pipeline Velocity Guarantee'
    ],
    highlight: false,
    ctaText: 'Select Growth Engine'
  },
  {
    name: 'Scale Partner',
    badge: 'Most Popular & Best Value',
    price: '$8,500',
    period: '/ month',
    description: 'Comprehensive demand generation, custom ABM workflows, and full-funnel attribution for scaling teams.',
    features: [
      'Everything in Growth Engine',
      'Up to $75k/mo Managed Ad Spend',
      'Custom Account-Based Marketing (ABM)',
      'Visitor Deanonymization & Sales Alerts',
      'Multi-Touch Revenue Attribution Modeling',
      'Dedicated Growth Architect & Copywriter',
      'Guaranteed SLA on Qualified Sales Meetings'
    ],
    highlight: true,
    ctaText: 'Accelerate with Scale'
  },
  {
    name: 'Enterprise Revenue',
    badge: 'Series B to Pre-IPO',
    price: '$14,500',
    period: '/ month',
    description: 'Embedded demand generation team handling multi-region, multi-product global B2B revenue operations.',
    features: [
      'Everything in Scale Partner',
      'Unlimited Managed Ad Spend',
      'Global Multi-Region Campaign Structure',
      'Custom Data Warehouse & BI Integrations',
      'Dedicated Creative Production Pod',
      'Executive Board Pipeline Reporting',
      'Priority 24/7 Slack Connect Access'
    ],
    highlight: false,
    ctaText: 'Contact Enterprise Team'
  }
];

export default function Pricing() {
  const handleTierCta = (tierName) => {
    trackCtaClick({
      ctaName: 'pricing_tier_cta',
      location: 'pricing_section',
      target: '#lead-form',
      text: `Select ${tierName}`
    });
  };

  return (
    <section id="pricing" className="pricing-section">
      <div className="section-container">
        <div className="section-header text-center">
          <span className="section-kicker">Transparent Engagements</span>
          <h2 className="section-title">Designed for Fast-Scaling Revenue</h2>
          <p className="section-subtitle">
            No 12-month lock-ins. Flexible 90-day sprints backed by contractual pipeline guarantees.
          </p>
        </div>

        <div className="pricing-grid">
          {tiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`pricing-card ${tier.highlight ? 'pricing-card-highlight' : ''}`}
            >
              {tier.highlight && (
                <div className="popular-badge">
                  <Sparkles size={14} />
                  <span>MOST POPULAR CHOICE</span>
                </div>
              )}

              <div className="pricing-top">
                <span className="tier-badge">{tier.badge}</span>
                <h3 className="tier-name">{tier.name}</h3>
                <p className="tier-description">{tier.description}</p>
                <div className="price-wrap">
                  <span className="price-amount">{tier.price}</span>
                  <span className="price-period">{tier.period}</span>
                </div>
              </div>

              <hr className="tier-divider" />

              <div className="tier-features">
                <p className="features-label">WHAT'S INCLUDED:</p>
                <ul className="features-list">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="feature-item">
                      <Check size={16} className="feature-check text-accent" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pricing-bottom">
                <a
                  href="#lead-form"
                  className={`btn w-full ${tier.highlight ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleTierCta(tier.name)}
                >
                  <span>{tier.ctaText}</span>
                  <Zap size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="guarantee-banner">
          <div className="guarantee-icon-box">
            <Shield size={28} className="text-accent" />
          </div>
          <div className="guarantee-text">
            <h4 className="guarantee-title">The Veloce Performance Guarantee</h4>
            <p className="guarantee-desc">
              If we do not hit our agreed-upon qualified pipeline target within your first 90 days, we continue working 100% free of charge until the milestone is reached.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
