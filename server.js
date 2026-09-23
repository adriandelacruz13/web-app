/**
 * Veloce Growth - Production & API Server
 * Runs on Port 3000 (independent of WordPress container on 8080)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { processLeadSubmission, getAllLeads } from './src/services/leadApi.js';
import { setSimulateCrmFailure, getSimulateCrmFailure, getDeadLetterQueue } from './src/services/crmService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Endpoints
app.post('/api/leads', async (req, res) => {
  try {
    const result = await processLeadSubmission(req.body);
    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error('Lead processing error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/leads', (req, res) => {
  return res.json({ leads: getAllLeads() });
});

app.get('/api/crm/status', (req, res) => {
  return res.json({
    failureSimulationActive: getSimulateCrmFailure(),
    deadLetterQueue: getDeadLetterQueue()
  });
});

app.post('/api/crm/toggle-failure', (req, res) => {
  setSimulateCrmFailure(req.body.simulateFailure);
  return res.json({
    success: true,
    failureSimulationActive: getSimulateCrmFailure()
  });
});

// Serve static build from dist
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Veloce Growth Server] Running on http://localhost:${PORT}`);
});
