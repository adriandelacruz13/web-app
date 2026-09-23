import React from 'react';
import { Target, Search, Users, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';
import { trackCtaClick } from '../utils/tracking';

const services = [
  {
    icon: Target,
    badge: 'Paid Acquisition',
    title: 'Full-Funnel Paid Media & B2B Intent',
    description: 'Hyper-targeted LinkedIn Ads, Google Search, and 1st-party intent audiences. We target buying committees, not random clicks.',
    points: [
      'Account-level IP & job role targeting',
      'High-intent search query domination',
      'Continuous creative testing & conversion rate optimization'
    ]
  },
  {
    icon: Search,
    badge: 'Inbound & SEO',
    title: 'High-Intent Search & Content Engine',
    description: 'We build product-led comparison guides, bottom-of-funnel alternatives pages, and technical playbooks that capture ready-to-buy prospects.',
    points: [
      'Bottom-of-funnel category keyword capture',
      'Data-backed conversion rate copy',
      'Technical SEO & Core Web Vitals optimization'
    ]
  },
  {
    icon: Users,
    badge: 'Account-Based Marketing',
    title: 'Precision ABM & Synchronized Outbound',
    description: 'Align paid advertising with your outbound SDR cadence. When tier-1 accounts visit your site, your sales team reaches out within minutes.',
    points: [
      'Deanonymization of B2B website visitors',
      'Automated account alerts to Slack & HubSpot',
      'Hyper-personalized 1-to-few ad experiences'
    ]
  },
  {
    icon: BarChart3,
    badge: 'Revenue Attribution',
    title: 'Closed-Loop Multi-Touch Attribution',
    description: 'Eliminate channel guessing. Connect every marketing dollar directly to opportunities, stage progression, and closed-won revenue in your CRM.',
    points: [
      'HubSpot & Salesforce native bi-directional sync',
      'First-touch, W-shaped & linear attribution modeling',
      'Server-side Conversions API (CAPI) compliance'
    ]
  }
];

export default function Features() {
  const handleServiceCta = (serviceTitle) => {
    trackCtaClick({
      ctaName: 'service_card_cta',
      location: 'services_section',
      target: '#lead-form',
      text: `Learn more about ${serviceTitle}`
    });
  };

  return (
    <section id="services" className="services-section">
      <div className="section-container">
        <div className="section-header text-center">
          <span className="section-kicker">Core Capabilities</span>
          <h2 className="section-title">The Complete B2B Demand Engine</h2>
          <p className="section-subtitle">
            Most agencies deliver clicks and impressions. We deploy an end-to-end revenue system designed exclusively to accelerate sales pipeline.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <article key={index} className="service-card">
                <div className="service-card-top">
                  <div className="service-icon-box">
                    <Icon size={24} className="service-icon" />
                  </div>
                  <span className="service-badge">{service.badge}</span>
                </div>

                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>

                <ul className="service-points-list">
                  {service.points.map((pt, pIdx) => (
                    <li key={pIdx} className="service-point-item">
                      <CheckCircle size={15} className="point-icon text-accent" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href="#lead-form" 
                  className="service-link"
                  onClick={() => handleServiceCta(service.title)}
                >
                  <span>Explore in Growth Audit</span>
                  <ArrowRight size={14} />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
