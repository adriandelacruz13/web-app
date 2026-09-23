import React from 'react';
import { Star, Quote, ArrowUpRight } from 'lucide-react';
import { trackCtaClick } from '../utils/tracking';

const caseStudies = [
  {
    client: 'LogiScale Enterprise SaaS',
    stat: '+340%',
    metric: 'Qualified Sales Pipeline in 6 Months',
    quote: 'Veloce completely restructured our paid media and inbound funnels. Our sales team went from hunting low-tier leads to handling inbound meetings with Fortune 500 VP-level buyers.',
    author: 'Marcus Vance',
    role: 'Chief Commercial Officer',
    tag: 'Series B Cloud Infrastructure'
  },
  {
    client: 'DataPulse Analytics',
    stat: '-62%',
    metric: 'Customer Acquisition Cost (CAC)',
    quote: 'Before Veloce, our blended CAC was unsustainably high. Their team implemented bottom-of-funnel search campaigns and synchronized ABM that cut our CAC in half within 90 days.',
    author: 'Elena Rostova',
    role: 'VP of Growth & Marketing',
    tag: 'Enterprise AI & Data Ops'
  },
  {
    client: 'CyberFort Identity',
    stat: '$14.2M',
    metric: 'Closed-Won Revenue in 12 Months',
    quote: 'The level of rigor Veloce brings to attribution and CRM integration is unmatched. We know the exact ROI of every dollar deployed across LinkedIn and search.',
    author: 'David Sterling',
    role: 'Founder & CEO',
    tag: 'Cybersecurity Scaleup'
  }
];

const clientLogos = ['LOGISCALE', 'DATAPULSE', 'CYBERFORT', 'NEXUSPUSH', 'CLOUDMATRIX'];

export default function SocialProof() {
  const handleCaseStudyClick = (clientName) => {
    trackCtaClick({
      ctaName: 'case_study_cta',
      location: 'social_proof_section',
      target: '#lead-form',
      text: `Read full case study for ${clientName}`
    });
  };

  return (
    <section id="results" className="social-proof-section">
      <div className="section-container">
        {/* Logos Bar */}
        <div className="client-logos-wrapper">
          <p className="logos-title">TRUSTED BY HIGH-GROWTH B2B REVENUE TEAMS</p>
          <div className="logos-grid">
            {clientLogos.map((logo, idx) => (
              <div key={idx} className="logo-item">
                <span className="logo-placeholder">{logo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="section-header text-center mt-xl">
          <span className="section-kicker">Quantified Results</span>
          <h2 className="section-title">Tested in High-Stakes B2B Environments</h2>
          <p className="section-subtitle">
            See how scaling software companies partner with Veloce Growth to build defensible, high-ROI acquisition flywheels.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="case-studies-grid">
          {caseStudies.map((study, idx) => (
            <div key={idx} className="case-card">
              <div className="case-card-header">
                <span className="case-tag">{study.tag}</span>
                <div className="stars-row" role="img" aria-label="5 out of 5 stars rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="star-icon fill-accent text-accent" />
                  ))}
                </div>
              </div>

              <div className="case-hero-stat">
                <div className="stat-large">{study.stat}</div>
                <div className="stat-label">{study.metric}</div>
              </div>

              <div className="case-quote-box">
                <Quote size={20} className="quote-icon text-muted" />
                <p className="case-quote">{study.quote}</p>
              </div>

              <div className="case-author-bar">
                <div>
                  <h3 className="author-name">{study.author}</h3>
                  <p className="author-role">{study.role} &middot; <strong>{study.client}</strong></p>
                </div>
                <a 
                  href="#lead-form" 
                  className="case-link-btn"
                  onClick={() => handleCaseStudyClick(study.client)}
                  aria-label={`Inquire about results like ${study.client}`}
                >
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
