import { describe, it, expect } from 'vitest';
import { validateLeadData, processLeadSubmission } from './leadApi.js';

const validLead = {
  name: 'Sarah Jenkins',
  email: 'sarah@company.com',
  company: 'Acme Technologies',
  phone: '+1 (555) 234-5678',
  message: 'We are scaling our B2B pipeline and need a full-funnel demand engine.'
};

describe('validateLeadData', () => {
  it('accepts a fully valid lead payload', () => {
    const result = validateLeadData(validLead);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('rejects a payload with missing/invalid fields', () => {
    const result = validateLeadData({ name: '', email: 'not-an-email', company: '', phone: '123', message: 'short' });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors)).toEqual(
      expect.arrayContaining(['name', 'email', 'company', 'phone', 'message'])
    );
  });

  it('normalizes whitespace/format before validation', () => {
    const result = validateLeadData({
      ...validLead,
      phone: '+44 20 7946 0958',
      email: '   SARAH@COMPANY.COM   '
    });
    expect(result.isValid).toBe(true);
  });
});

describe('processLeadSubmission (duplicate prevention)', () => {
  it('returns a lead id + success once a valid lead is processed', async () => {
    const result = await processLeadSubmission({ ...validLead, idempotencyKey: 'idemp_a' });
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    expect(result.data.leadId).toMatch(/^lead_/);
    expect(result.data.crmSync.status).toBe('synced');
  });

  it('blocks an identical resubmission via the idempotency key', async () => {
    const first = await processLeadSubmission({ ...validLead, idempotencyKey: 'idemp_dup' });
    const second = await processLeadSubmission({ ...validLead, idempotencyKey: 'idemp_dup' });

    expect(second.status).toBe(200);
    expect(second.data.duplicatePrevented).toBe(true);
    expect(second.data.leadId).toBe(first.data.leadId);
  });

  it('returns 400 with validation errors for an invalid payload', async () => {
    const result = await processLeadSubmission({ name: '', idempotencyKey: 'idemp_bad' });
    expect(result.status).toBe(400);
    expect(result.data.success).toBe(false);
    expect(result.data.validationErrors).toBeDefined();
  });
});