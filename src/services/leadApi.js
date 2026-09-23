/**
 * Veloce Growth - Lead Processing Engine
 * Handles:
 * - Schema validation
 * - Accidental duplicate submission prevention (Idempotency tokens)
 * - Data sanitization
 * - Dispatching to CRM
 */

import { syncLeadToHubSpot } from './crmService.js';

// In-memory persistent stores for demonstration
const leadsDatabase = [];
const idempotencyCache = new Map(); // token -> cached response

/**
 * Validate lead form fields
 */
export function validateLeadData(data) {
  const errors = {};

  // Name validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.name = 'Please provide your full name (minimum 2 characters).';
  }

  // Email validation (strict regex)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = 'Please provide a valid work email address.';
  }

  // Company validation
  if (!data.company || typeof data.company !== 'string' || data.company.trim().length < 2) {
    errors.company = 'Company name is required.';
  }

  // Phone validation (international / flexible digits)
  const phoneClean = (data.phone || '').replace(/[\s\-().+]/g, '');
  if (!phoneClean || phoneClean.length < 7 || phoneClean.length > 16 || !/^\d+$/.test(phoneClean)) {
    errors.phone = 'Please provide a valid phone number (7-15 digits).';
  }

  // Message validation
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.message = 'Please share a brief project scope or goal (minimum 10 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Process lead submission with duplicate prevention & CRM sync
 */
export async function processLeadSubmission(payload) {
  const { name, email, company, phone, message, idempotencyKey } = payload || {};

  // 1. Check for Duplicate Submission via Idempotency Key
  if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
    console.warn(`[Lead Engine] Duplicate submission blocked with key: ${idempotencyKey}`);
    const cachedResponse = idempotencyCache.get(idempotencyKey);
    return {
      status: 200,
      data: {
        ...cachedResponse,
        duplicatePrevented: true,
        message: 'Lead received previously. Thank you!'
      }
    };
  }

  // 2. Validate payload
  const validation = validateLeadData({ name, email, company, phone, message });
  if (!validation.isValid) {
    return {
      status: 400,
      data: {
        success: false,
        error: 'Validation failed',
        validationErrors: validation.errors
      }
    };
  }

  // 3. Create clean lead object
  const leadId = 'lead_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const leadRecord = {
    id: leadId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    company: company.trim(),
    phone: phone.trim(),
    message: message.trim(),
    submittedAt: new Date().toISOString(),
    status: 'ACTIVE'
  };

  // 4. Dispatch to CRM simulator
  const crmResult = await syncLeadToHubSpot(leadRecord);

  // 5. Save to local database
  leadRecord.crmSync = crmResult;
  leadsDatabase.push(leadRecord);

  const responseData = {
    success: true,
    leadId: leadRecord.id,
    message: 'Thank you! Your growth consultation request has been received.',
    lead: {
      name: leadRecord.name,
      email: leadRecord.email,
      company: leadRecord.company
    },
    crmSync: {
      status: crmResult.success ? 'synced' : 'queued_for_retry',
      crm: crmResult.crm,
      contactId: crmResult.contactId || null
    }
  };

  // 6. Cache idempotency key for 10 minutes to prevent re-submission
  if (idempotencyKey) {
    idempotencyCache.set(idempotencyKey, responseData);
    setTimeout(() => idempotencyCache.delete(idempotencyKey), 10 * 60 * 1000);
  }

  return {
    status: 200,
    data: responseData
  };
}

export function getAllLeads() {
  return [...leadsDatabase];
}
