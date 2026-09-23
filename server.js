/**
 * Veloce Growth - Production API & Static Server
 *
 * Enterprise-grade hardening:
 *  - Helmet security headers (CSP, HSTS, referrer policy, nosniff)
 *  - gzip/brotli compression for all responses
 *  - In-memory rate limiting on lead/CRM write endpoints
 *  - Immutable long-term caching for hashed build assets
 *  - No-cache policy for index.html to always ship the latest build
 *  - Explicit CORS allowlist (disabled by default: same-origin architecture)
 *  - Proper JSON 404 + centralized error handling for /api
 *  - /api/health endpoint for load balancer / uptime monitoring
 *  - Credentials isolated server-side (.env) - never exposed to client
 */

import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { processLeadSubmission, getAllLeads } from './src/services/leadApi.js';
import { setSimulateCrmFailure, getSimulateCrmFailure, getDeadLetterQueue } from './src/services/crmService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');
const PIXEL_ID = process.env.META_PIXEL_ID || '1098472918234891';
const DEFAULT_URL = 'https://velocegrowth.com/';

app.disable('x-powered-by');

/* ----------------------------- Security ------------------------------- */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://connect.facebook.net',
          'https://www.googletagmanager.com',
          'https://www.google-analytics.com'
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'https://images.unsplash.com'],
        connectSrc: [
          "'self'",
          'https://connect.facebook.net',
          'https://www.facebook.com',
          'https://www.google-analytics.com',
          'https://*.google-analytics.com',
          'https://www.googletagmanager.com',
          'https://*.googletagmanager.com'
        ],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"]
      }
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    crossOriginEmbedderPolicy: false
  })
);

app.use(compression());

/* Note: same-origin architecture by default. Enable CORS only for an explicit
   comma-separated allowlist via the CORS_ORIGIN environment variable. */
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
if (corsOrigins.length > 0) {
  app.use(cors({ origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins }));
}

app.use(express.json({ limit: '32kb' }));

/* --------------------------- Rate Limiting ---------------------------- */
const leadSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // max 30 submissions per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many submission attempts. Please try again after 15 minutes.'
  }
});

const crmSandboxLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.'
  }
});

/* -------------------------- API Endpoints ----------------------------- */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: path.basename(__dirname) || 'web-app'
  });
});

app.post('/api/leads', leadSubmissionLimiter, async (req, res) => {
  try {
    const result = await processLeadSubmission(req.body);
    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error('Lead processing error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/leads', crmSandboxLimiter, (req, res) => {
  return res.json({ leads: getAllLeads() });
});

app.get('/api/crm/status', crmSandboxLimiter, (req, res) => {
  return res.json({
    failureSimulationActive: getSimulateCrmFailure(),
    deadLetterQueue: getDeadLetterQueue()
  });
});

app.post('/api/crm/toggle-failure', crmSandboxLimiter, (req, res) => {
  setSimulateCrmFailure(req.body.simulateFailure);
  return res.json({
    success: true,
    failureSimulationActive: getSimulateCrmFailure()
  });
});

// JSON 404 for any unknown /api routes (never the SPA HTML fallback).
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

/* ----------------------- Static + Caching Policy ---------------------- */
const hashedAsset = /\.(js|css|svg|png|jpe?g|gif|webp|avif|woff2?|ico|webmanifest)$/i;

app.use(
  express.static(DIST_DIR, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (hashedAsset.test(filePath)) {
        // Build assets are content-hashed by Vite -> safe to cache long-term.
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    }
  })
);

// robots.txt + sitemap.txt should be short-cached to allow search crawler freshness.
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`User-agent: *\nAllow: /\n\nSitemap: ${DEFAULT_URL}sitemap.xml\n`);
});

app.get('/csp-report.json', (req, res) => res.status(204).end());

// SPA fallback (only for navigations; API already handled above).
app.use((req, res, next) => {
  if (req.method !== 'GET' || !req.accepts('html')) {
    return next();
  }
  if (path.extname(req.path)) {
    return next(); // unknown file -> 404 below
  }
  const indexPath = path.join(DIST_DIR, 'index.html');
  return res.sendFile(indexPath);
});

// Final 404 (non-HTML/non-API) + centralized error handler.
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  return res.status(404).send('Not found');
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Malformed JSON payload' });
  }
  console.error('[Server Error]', err);
  if (req.path.startsWith('/api')) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
  return res.status(500).send('Internal server error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Veloce Growth Server] Running on http://localhost:${PORT}`);
  console.log(`[Security] Helmet CSP active | Rate limiting active | Credentials isolated in .env`);
  console.log(`[Tracking] Meta Pixel ID configured: ${PIXEL_ID}`);
});