import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { processLeadSubmission, getAllLeads } from './src/services/leadApi.js';
import { setSimulateCrmFailure, getSimulateCrmFailure, getDeadLetterQueue } from './src/services/crmService.js';

function apiMiddlewarePlugin() {
  return {
    name: 'vite-api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Parse JSON body helper
        const parseJsonBody = () => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                resolve({});
              }
            });
          });
        };

        const sendJson = (statusCode, data) => {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = statusCode;
          res.end(JSON.stringify(data));
        };

        // GET /api/health (dev parity with production)
        if (req.url === '/api/health' && req.method === 'GET') {
          return sendJson(200, {
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
          });
        }

        // POST /api/leads
        if (req.url === '/api/leads' && req.method === 'POST') {
          try {
            const body = await parseJsonBody();
            const result = await processLeadSubmission(body);
            return sendJson(result.status, result.data);
          } catch (err) {
            return sendJson(500, { success: false, error: err.message });
          }
        }

        // GET /api/leads (List all leads for review)
        if (req.url === '/api/leads' && req.method === 'GET') {
          return sendJson(200, { leads: getAllLeads() });
        }

        // GET /api/crm/status
        if (req.url === '/api/crm/status' && req.method === 'GET') {
          return sendJson(200, {
            failureSimulationActive: getSimulateCrmFailure(),
            deadLetterQueue: getDeadLetterQueue()
          });
        }

        // POST /api/crm/toggle-failure
        if (req.url === '/api/crm/toggle-failure' && req.method === 'POST') {
          const body = await parseJsonBody();
          setSimulateCrmFailure(body.simulateFailure);
          return sendJson(200, {
            success: true,
            failureSimulationActive: getSimulateCrmFailure()
          });
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiMiddlewarePlugin()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'es2020',
    // Split the immutable React runtime into its own cacheable chunk while
    // keeping the lucide icon imports tree-shaken in the app bundle.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
            return 'vendor-react';
          }
          return undefined;
        }
      }
    }
  }
});
