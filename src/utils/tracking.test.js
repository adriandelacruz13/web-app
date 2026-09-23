import { describe, it, expect } from 'vitest';
import {
  subscribeToEvents,
  trackPageView,
  trackCtaClick,
  trackFormStarted,
  resetFormStartedTracking,
  trackLeadSuccess
} from './tracking.js';

const collect = () => {
  const seen = [];
  const unsubscribe = subscribeToEvents((event) => seen.push(event));
  return { seen, unsubscribe };
};

describe('tracking event bus', () => {
  it('notifies subscribers for CTA clicks', () => {
    const { seen, unsubscribe } = collect();
    trackCtaClick({ ctaName: 'hero_cta', location: 'hero', target: '#lead-form', text: 'Go' });
    unsubscribe();

    expect(seen).toHaveLength(1);
    expect(seen[0].type).toBe('cta_click');
    expect(seen[0].payload.cta_name).toBe('hero_cta');
  });

  it('deduplicates page views within the same path (StrictMode-safe)', () => {
    const { seen, unsubscribe } = collect();
    trackPageView('Test', '/');
    trackPageView('Test', '/');
    trackPageView('Test', '/other');
    unsubscribe();

    expect(seen.filter((e) => e.type === 'page_view')).toHaveLength(2);
  });

  it('fires form_started exactly once until reset', () => {
    const { seen, unsubscribe } = collect();
    trackFormStarted('lead_form', 'name');
    trackFormStarted('lead_form', 'email');
    resetFormStartedTracking();
    trackFormStarted('lead_form', 'company');
    unsubscribe();

    const starts = seen.filter((e) => e.type === 'form_started');
    expect(starts).toHaveLength(2);
    expect(starts[0].payload.first_field_interacted).toBe('name');
  });
});

describe('conversion event integrity', () => {
  it('emits lead_generated only for a successful lead (never on click)', () => {
    const { seen, unsubscribe } = collect();
    trackLeadSuccess({ leadId: 'lead_test_1', name: 'A', email: 'a@b.com', company: 'Co', estimatedValue: 250 });
    unsubscribe();

    expect(seen).toHaveLength(1);
    expect(seen[0].type).toBe('lead_generated (SUCCESS)');
    expect(seen[0].payload.metaPixel.event).toBe('Lead');
    expect(seen[0].payload.metaPixel.event_id).toBe('evt_lead_test_1');
  });
});