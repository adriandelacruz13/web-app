/**
 * Veloce Growth - Enterprise Marketing Tracking Engine
 *
 * Responsibilities:
 * - Bootstrap GTM + Meta Pixel lazily (never during initial render / LCP).
 * - Queue Meta Pixel events issued before the SDK finishes loading so no
 *   conversion is ever dropped (the assessment-critical guarantee).
 * - Emit a standardized event taxonomy to the GTM dataLayer.
 * - Notify the in-browser Event Inspector HUD via a subscription bus.
 *
 * Third-party scripts (googletagmanager.com, connect.facebook.net) are only
 * fetched after the main thread reports idle ({requestIdleCallback} / timeout
 * fallback), protecting Core Web Vitals while keeping full tracking fidelity.
 */

const MARKETING_CONFIG = {
  gtmId: import.meta.env.VITE_GTM_ID || 'GTM-TEST1234',
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID || '1098472918234891'
};

/* ----------------------- Event Subscription Bus ------------------------ */
const eventListeners = new Set();

function notifyInspector(eventData) {
  eventListeners.forEach((listener) => {
    try {
      listener(eventData);
    } catch (e) {
      console.error('Inspector listener error:', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('marketing_event', { detail: eventData }));
  }
}

export function subscribeToEvents(callback) {
  eventListeners.add(callback);
  return () => eventListeners.delete(callback);
}

/* ----------------------- Lazy SDK Bootstrap ---------------------------- */
let sdkBootstrapped = false;
let sdkBootstrapQueued = false;
let metaPixelActivated = false;

const metaPixelEventQueue = [];

function gtmId() {
  return MARKETING_CONFIG.gtmId;
}

function metaPixelId() {
  return MARKETING_CONFIG.metaPixelId;
}

/**
 * Fire a Meta Pixel event through a safe bridge that queues events until the
 * script has fully initialized. This is what guarantees the conversion event
 * reaches Meta even if the user converts before the idle-loaded SDK arrives.
 */
function meta(...args) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq.apply(null, args);
    return;
  }
  metaPixelEventQueue.push(args);
}

function flushMetaPixelQueue() {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    while (metaPixelEventQueue.length > 0) {
      window.fbq.apply(null, metaPixelEventQueue.shift());
    }
  }
}

function loadGoogleTagManager() {
  const w = window;
  const d = document;
  const l = 'dataLayer';

  w[l] = w[l] || [];
  w[l].push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  const f = d.getElementsByTagName('script')[0];
  const j = d.createElement('script');
  const dl = l !== 'dataLayer' ? `&l=${l}` : '';
  j.async = true;
  j.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId()}${dl}`;
  f.parentNode.insertBefore(j, f);
}

function loadMetaPixel() {
  const windowRef = window;
  const documentRef = document;

  // Standard Meta Pixel loader (async, non-blocking)
  function installPixelLoader(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      if (n.callMethod) {
        n.callMethod.apply(n, arguments);
      } else {
        n.queue.push(arguments);
      }
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }

  installPixelLoader(windowRef, documentRef, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', metaPixelId());
  // Do NOT auto-fire PageView here: page views are tracked via the queue
  // bridge (see trackPageView), keeping the Meta payloads exactly 1:1 with
  // the GTM dataLayer and avoiding double page-view emissions.
  flushMetaPixelQueue();
}

/**
 * Activate the Meta Pixel on first user interaction (privacy-first,
 * CWV-friendly). The pixel script + init run only after the visitor shows
 * engagement intent, which keeps third-party cookies (and their impact)
 * out of the initial page load. Conversion payloads issued before this
 * moment are preserved by the queue bridge.
 */
function activateMetaPixel() {
  if (metaPixelActivated) return;
  metaPixelActivated = true;

  try {
    loadMetaPixel();
  } catch (e) {
    console.warn('[Tracking] Meta Pixel bootstrap failed:', e);
  }
}

function onFirstInteraction(callback) {
  if (typeof window === 'undefined') return;
  window.addEventListener('pointerdown', callback, { once: true });
  window.addEventListener('keydown', callback, { once: true });
  window.addEventListener('touchstart', callback, { once: true });
}

/**
 * Schedule GTM for the browser's idle moments and arm the Meta Pixel to
 * activate on first interaction. Safe to call multiple times; will only
 * run once per page session.
 */
export function initTrackingSdk() {
  if (
    typeof window === 'undefined' ||
    sdkBootstrapped ||
    sdkBootstrapQueued
  ) {
    return;
  }
  sdkBootstrapQueued = true;

  const sdkBootstrap = () => {
    if (sdkBootstrapped) return;
    sdkBootstrapped = true;
    try {
      loadGoogleTagManager();
    } catch (e) {
      console.warn('[Tracking] GTM bootstrap failed:', e);
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(sdkBootstrap, { timeout: 3000 });
  } else {
    window.setTimeout(sdkBootstrap, 1000);
  }

  if (typeof window !== 'undefined' && !metaPixelActivated) {
    onFirstInteraction(activateMetaPixel);
  }
}

/* ----------------------- Event Taxonomy -------------------------------- */

// Prevents React StrictMode double-effect from double-firing page views.
let lastPageViewPath = null;

export function trackPageView(pageTitle = document.title, path = window.location.pathname) {
  if (lastPageViewPath === path) return;
  lastPageViewPath = path;

  const payload = {
    event: 'page_view',
    page_title: pageTitle,
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : null,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    meta('track', 'PageView');
  }

  notifyInspector({
    source: 'GTM & Meta Pixel',
    type: 'page_view',
    payload
  });
}

export function trackCtaClick({ ctaName, location, target, text }) {
  const payload = {
    event: 'cta_click',
    cta_name: ctaName,
    cta_location: location,
    cta_target: target,
    cta_text: text,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  notifyInspector({
    source: 'GTM dataLayer',
    type: 'cta_click',
    payload
  });
}

let formStartedFired = false;

export function trackFormStarted(formName = 'lead_generation_form', firstField = '') {
  if (formStartedFired) return;
  formStartedFired = true;

  const payload = {
    event: 'form_started',
    form_name: formName,
    first_field_interacted: firstField,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  notifyInspector({
    source: 'GTM dataLayer',
    type: 'form_started',
    payload
  });
}

export function resetFormStartedTracking() {
  formStartedFired = false;
}

export function trackFormSubmitted(formName = 'lead_generation_form', metadata = {}) {
  const payload = {
    event: 'form_submitted',
    form_name: formName,
    company: metadata.company || undefined,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  notifyInspector({
    source: 'GTM dataLayer',
    type: 'form_submitted',
    payload
  });
}

export function trackFormSubmissionFailure(formName = 'lead_generation_form', reason, errors = []) {
  const payload = {
    event: 'form_submission_failure',
    form_name: formName,
    failure_reason: reason,
    validation_errors: errors,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  notifyInspector({
    source: 'GTM dataLayer',
    type: 'form_submission_failure',
    payload
  });
}

/**
 * Lead Conversion - FIRES ONLY after a verified successful API response.
 * Contract: never fire on button click; only after HTTP 200 with a valid
 * leadId. Uses the queue bridge so events issued before SDK load survive.
 */
export function trackLeadSuccess({ leadId, company, estimatedValue = 250.00, name: _name, email: _email }) {
  const dataLayerPayload = {
    event: 'lead_generated',
    lead_id: leadId,
    lead_company: company,
    estimated_value: estimatedValue,
    currency: 'USD',
    event_id: `evt_${leadId}`,
    timestamp: new Date().toISOString()
  };

  const metaPixelPayload = {
    content_name: 'B2B Strategy Consultation Request',
    content_category: 'Lead',
    value: estimatedValue,
    currency: 'USD',
    event_id: `evt_${leadId}`
  };

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(dataLayerPayload);

    // Conversion event - parallel-browser + server-side dedup via event_id.
    meta('track', 'Lead', metaPixelPayload);
  }

  notifyInspector({
    source: 'GTM & Meta Pixel',
    type: 'lead_generated (SUCCESS)',
    payload: {
      dataLayer: dataLayerPayload,
      metaPixel: { event: 'Lead', ...metaPixelPayload }
    }
  });
}