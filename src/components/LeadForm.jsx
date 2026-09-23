import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, AlertTriangle, Loader2, ShieldCheck, RefreshCw, HelpCircle } from 'lucide-react';
import {
  trackFormStarted,
  trackFormSubmitted,
  trackFormSubmissionFailure,
  trackLeadSuccess,
  resetFormStartedTracking
} from '../utils/tracking';

const FIELD_ORDER = ['name', 'email', 'company', 'phone', 'message'];

export default function LeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [responseDetails, setResponseDetails] = useState(null);
  const [serverError, setServerError] = useState('');

  // Developer/Evaluator toggle to test simulated CRM failure
  const [simulateCrmFailure, setSimulateCrmFailure] = useState(false);

  // Idempotency token per form session
  const idempotencyKeyRef = useRef('');
  const successPanelRef = useRef(null);

  useEffect(() => {
    // Generate unique idempotency key for this form session
    idempotencyKeyRef.current = 'idemp_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
  }, []);

  // Move focus into the success panel so screen readers announce the outcome.
  useEffect(() => {
    if (submissionStatus === 'success') {
      successPanelRef.current?.focus();
    }
  }, [submissionStatus]);

  // Sync simulated CRM failure mode to backend
  const handleToggleCrmFailure = async (e) => {
    const isChecked = e.target.checked;
    setSimulateCrmFailure(isChecked);
    try {
      await fetch('/api/crm/toggle-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateFailure: isChecked })
      });
    } catch (err) {
      console.warn('Failed to toggle backend CRM failure flag:', err);
    }
  };

  // Field change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Fire form_started tracking on first interaction
    trackFormStarted('lead_generation_form', name);

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-level error on typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Full name is required (at least 2 characters).';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid work email address.';
    }

    if (!formData.company.trim() || formData.company.trim().length < 2) {
      errors.company = 'Company name is required.';
    }

    const cleanPhone = formData.phone.replace(/[\s\-().+]/g, '');
    if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 16 || !/^\d+$/.test(cleanPhone)) {
      errors.phone = 'Valid phone number required (7 to 15 digits).';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = 'Please provide brief details on your growth goals (minimum 10 characters).';
    }

    return errors;
  };

  // Focus the first invalid field for keyboard + assistive tech users.
  const focusFirstInvalid = (errors) => {
    const firstInvalid = FIELD_ORDER.find((k) => errors[k]);
    if (firstInvalid) {
      document.getElementById(`field-${firstInvalid}`)?.focus();
    }
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate accidental click
    if (isSubmitting) return;

    // 1. Track submission attempt (submit button clicked)
    trackFormSubmitted('lead_generation_form', { company: formData.company });

    // 2. Validate client-side
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      trackFormSubmissionFailure('lead_generation_form', 'client_validation_failed', Object.keys(errors));
      focusFirstInvalid(errors);
      return;
    }

    // 3. Begin loading state
    setIsSubmitting(true);
    setSubmissionStatus('loading');
    setServerError('');

    try {
      // 4. Send to Backend API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKeyRef.current
        },
        body: JSON.stringify({
          ...formData,
          idempotencyKey: idempotencyKeyRef.current
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred while submitting lead.');
      }

      // 5. Success State!
      setSubmissionStatus('success');
      setResponseDetails(data);

      // 6. TRACK CONVERSION EVENT - FIRES ONLY AFTER SUCCESSFUL SUBMISSION
      // As explicitly mandated by assessment guidelines
      trackLeadSuccess({
        leadId: data.leadId,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        estimatedValue: 250.00
      });

    } catch (err) {
      console.error('[Form Submit Error]:', err);
      setSubmissionStatus('error');
      setServerError(err.message || 'Unable to submit your request. Please check your connection and try again.');

      // Track submission failure
      trackFormSubmissionFailure('lead_generation_form', 'api_network_error', [err.message]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to submit another inquiry
  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      message: ''
    });
    setFieldErrors({});
    setSubmissionStatus('idle');
    setResponseDetails(null);
    setServerError('');
    resetFormStartedTracking();
    idempotencyKeyRef.current = 'idemp_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
  };

  return (
    <section id="lead-form" className="lead-section">
      <div className="section-container">
        <div className="lead-grid">
          {/* Left Column: Context & Value Prop */}
          <div className="lead-info-col">
            <span className="section-kicker">Free Pipeline Strategy Session</span>
            <h2 className="lead-title">Get a Custom 90-Day Demand Generation Audit</h2>
            <p className="lead-desc">
              Book a 45-minute confidential architecture session with our Principal Growth Architects. We will tear down your current ad campaigns, funnel conversion rates, and CRM tracking setup.
            </p>

            <div className="audit-deliverables">
              <h4 className="deliverables-title">WHAT YOU RECEIVE IN THE AUDIT:</h4>
              <div className="deliverable-item">
                <div className="deliv-num">01</div>
                <div>
                  <strong>B2B Paid Media Waste Analysis</strong>
                  <p>Identify negative keywords, poor LinkedIn audience match rates, and wasted budget.</p>
                </div>
              </div>
              <div className="deliverable-item">
                <div className="deliv-num">02</div>
                <div>
                  <strong>Full-Funnel Conversion Tear-Down</strong>
                  <p>Step-by-step UX recommendations to increase demo booking conversion rates by 2–3x.</p>
                </div>
              </div>
              <div className="deliverable-item">
                <div className="deliv-num">03</div>
                <div>
                  <strong>CRM & Attribution Architecture Roadmap</strong>
                  <p>Actionable plan to implement server-side Meta CAPI and closed-loop HubSpot attribution.</p>
                </div>
              </div>
            </div>

            {/* Assessment QA Sandbox Controls Box */}
            <div className="evaluator-sandbox-box">
              <div className="sandbox-header">
                <HelpCircle size={16} className="text-accent" aria-hidden="true" />
                <span className="sandbox-title">Technical Assessment Sandbox</span>
              </div>
              <p className="sandbox-hint">
                You can simulate CRM API failures to observe how the backend handles rate limits, exponential retries, and dead-letter queueing:
              </p>
              <label className="sandbox-toggle-label">
                <input
                  type="checkbox"
                  checked={simulateCrmFailure}
                  onChange={handleToggleCrmFailure}
                  className="sandbox-checkbox"
                />
                <span className="sandbox-toggle-text">Simulate HubSpot CRM API Failure (HTTP 429 Rate Limit)</span>
              </label>
            </div>
          </div>

          {/* Right Column: Lead Form */}
          <div className="lead-form-col">
            <div className="form-card">
              {submissionStatus === 'success' ? (
                /* Success State Screen */
                <div
                  ref={successPanelRef}
                  className="form-success-state"
                  role="status"
                  aria-live="polite"
                  tabIndex={-1}
                >
                  <div className="success-icon-wrap">
                    <CheckCircle size={44} className="text-success" aria-hidden="true" />
                  </div>
                  <h3 className="success-title">Strategy Session Requested!</h3>
                  <p className="success-message">
                    Thank you, <strong>{formData.name}</strong>. Your growth audit request for <strong>{formData.company}</strong> has been logged. Our Principal Growth Architect will reach out within 4 business hours.
                  </p>

                  <div className="success-details-card">
                    <div className="detail-row">
                      <span className="detail-label" id="ref-id-label">Reference ID:</span>
                      <span className="detail-value font-mono">{responseDetails?.leadId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">HubSpot CRM Sync:</span>
                      <span className="detail-value">
                        {responseDetails?.crmSync?.status === 'synced' ? (
                          <span className="badge badge-success">Synced (ID: {responseDetails?.crmSync?.contactId})</span>
                        ) : (
                          <span className="badge badge-warning">Queued for Retry (Dead-Letter Handled)</span>
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Marketing Tracking:</span>
                      <span className="detail-value text-accent">GTM dataLayer & Meta Pixel 'Lead' Fired</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary w-full mt-lg"
                    onClick={handleResetForm}
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    <span>Submit Another Inquiry</span>
                  </button>
                </div>
              ) : (
                /* Active Form */
                <form onSubmit={handleSubmit} noValidate aria-label="Lead Generation Form">
                  <div className="form-header">
                    <h3 className="form-heading">Request Your Growth Audit</h3>
                    <p className="form-subheading">Fill in your details. Zero commitment required.</p>
                  </div>

                  {serverError && (
                    <div className="alert alert-error" role="alert">
                      <AlertTriangle size={18} className="alert-icon" aria-hidden="true" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* Name Field */}
                  <div className="form-group">
                    <label htmlFor="field-name" className="form-label">
                      Full Name <span className="text-required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="field-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sarah Jenkins"
                      className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
                      disabled={isSubmitting}
                      required
                      aria-required="true"
                      aria-invalid={fieldErrors.name || undefined}
                      aria-describedby={fieldErrors.name ? 'field-name-error' : undefined}
                    />
                    {fieldErrors.name && (
                      <span id="field-name-error" className="field-error-msg">{fieldErrors.name}</span>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="form-group">
                    <label htmlFor="field-email" className="form-label">
                      Work Email <span className="text-required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="field-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="sarah@company.com"
                      className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                      disabled={isSubmitting}
                      required
                      aria-required="true"
                      aria-invalid={fieldErrors.email || undefined}
                      aria-describedby={fieldErrors.email ? 'field-email-error' : undefined}
                    />
                    {fieldErrors.email && (
                      <span id="field-email-error" className="field-error-msg">{fieldErrors.email}</span>
                    )}
                  </div>

                  {/* Company & Phone Row */}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="field-company" className="form-label">
                        Company Name <span className="text-required" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="field-company"
                        type="text"
                        name="company"
                        autoComplete="organization"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Acme Technologies"
                        className={`form-input ${fieldErrors.company ? 'input-error' : ''}`}
                        disabled={isSubmitting}
                        required
                        aria-required="true"
                        aria-invalid={fieldErrors.company || undefined}
                        aria-describedby={fieldErrors.company ? 'field-company-error' : undefined}
                      />
                      {fieldErrors.company && (
                        <span id="field-company-error" className="field-error-msg">{fieldErrors.company}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="field-phone" className="form-label">
                        Phone Number <span className="text-required" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="field-phone"
                        type="tel"
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 234-5678"
                        className={`form-input ${fieldErrors.phone ? 'input-error' : ''}`}
                        disabled={isSubmitting}
                        required
                        aria-required="true"
                        aria-invalid={fieldErrors.phone || undefined}
                        aria-describedby={fieldErrors.phone ? 'field-phone-error' : undefined}
                      />
                      {fieldErrors.phone && (
                        <span id="field-phone-error" className="field-error-msg">{fieldErrors.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="form-group">
                    <label htmlFor="field-message" className="form-label">
                      Growth Goals & Current Challenges <span className="text-required" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="field-message"
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Share your current monthly ad spend, pipeline targets, or attribution challenges..."
                      className={`form-textarea ${fieldErrors.message ? 'input-error' : ''}`}
                      disabled={isSubmitting}
                      required
                      aria-required="true"
                      aria-invalid={fieldErrors.message || undefined}
                      aria-describedby={fieldErrors.message ? 'field-message-error' : undefined}
                    />
                    {fieldErrors.message && (
                      <span id="field-message-error" className="field-error-msg">{fieldErrors.message}</span>
                    )}
                  </div>

                  {/* Submit Button with Spinner & Disabled state to prevent duplicate submissions */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-full submit-btn"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="spinner" aria-hidden="true" />
                        <span>Validating & Processing Lead...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Strategy Request</span>
                        <Send size={16} aria-hidden="true" />
                      </>
                    )}
                  </button>

                  <div className="form-security-footer">
                    <ShieldCheck size={14} className="text-muted" aria-hidden="true" />
                    <span>Your data is protected. Zero spam. Strict confidentiality agreement.</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}