/**
 * Veloce Growth - HubSpot CRM Integration Simulator
 * 
 * Demonstrates:
 * 1. Safe credential isolation (server-side only, never leaked to client)
 * 2. Exponential backoff retry logic for transient failures (429, 503, ETIMEDOUT)
 * 3. Dead-letter queue / audit log for failed CRM syncs
 * 4. Configurable failure simulator for QA testing and assessment review
 */

// Simulated in-memory dead letter queue for failed CRM synchronizations
const deadLetterQueue = [];
let simulateFailureMode = false;

/**
 * Toggle simulated CRM failure mode for testing error handling
 */
export function setSimulateCrmFailure(status) {
  simulateFailureMode = !!status;
}

export function getSimulateCrmFailure() {
  return simulateFailureMode;
}

export function getDeadLetterQueue() {
  return [...deadLetterQueue];
}

/**
 * Simulate delay for realistic network latency
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send lead information to HubSpot CRM (Simulated)
 * Includes exponential backoff retry logic
 */
export async function syncLeadToHubSpot(leadData, maxRetries = 3) {
  const credentialConfigured = !!(process.env.HUBSPOT_API_KEY);

  // Format payload according to HubSpot Contacts v3 API
  const hubspotPayload = {
    properties: {
      firstname: leadData.name.split(' ')[0] || leadData.name,
      lastname: leadData.name.split(' ').slice(1).join(' ') || '',
      email: leadData.email,
      company: leadData.company,
      phone: leadData.phone,
      message: leadData.message,
      lead_source: 'Veloce Marketing Landing Page',
      hs_lead_status: 'NEW',
      hs_analytics_source: 'DIRECT_TRAFFIC'
    }
  };

  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt++;
    try {
      // Simulate realistic API request duration
      await sleep(150 + attempt * 50);

      // Check if simulated failure is active
      if (simulateFailureMode) {
        throw new Error('HubSpot CRM API Rate Limit Exceeded (HTTP 429 Too Many Requests)');
      }

      // Success simulation
      const hubspotContactId = 'hs_' + Math.floor(10000000 + Math.random() * 90000000);

      return {
        success: true,
        crm: 'HubSpot',
        credentialSource: credentialConfigured ? 'env' : 'demo',
        contactId: hubspotContactId,
        syncedAt: new Date().toISOString(),
        attemptsNeeded: attempt,
        payloadSent: hubspotPayload
      };
    } catch (err) {
      lastError = err;
      console.warn(`[CRM Sync] Attempt ${attempt}/${maxRetries} failed: ${err.message}`);

      if (attempt < maxRetries) {
        // Exponential backoff: 200ms, 400ms, 800ms
        const backoffMs = Math.pow(2, attempt) * 100;
        await sleep(backoffMs);
      }
    }
  }

  // If all retries failed, add to Dead Letter Queue for reprocessing
  const failureRecord = {
    leadId: leadData.id,
    email: leadData.email,
    company: leadData.company,
    error: lastError.message,
    failedAt: new Date().toISOString(),
    retriesExhausted: maxRetries,
    payload: hubspotPayload
  };

  deadLetterQueue.push(failureRecord);
  console.error('[CRM Sync] All retries exhausted. Saved to Dead Letter Queue:', failureRecord);

  return {
    success: false,
    crm: 'HubSpot',
    error: lastError.message,
    retriesExhausted: maxRetries,
    queuedForReprocessing: true
  };
}
