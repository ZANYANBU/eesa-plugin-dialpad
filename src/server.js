// Dialpad plugin server — one Coolify container, one surface:
//   GET  /health         liveness (no auth)
//   GET  /manifest       serve the manifest (no auth)
//   POST /mcp            MCP (HMAC signature + per-tenant creds) → agent tools
//
// The MCP body is read RAW (Buffer) because the HMAC signature is computed over
// the exact bytes — reparsing + reserialising would change the formatting and
// break verification.
import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { verifyInbound, extractTenant, authConfigured } from './auth.js';
import { handleRpc } from './mcp.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = JSON.parse(readFileSync(join(__dirname, '..', 'manifest.json'), 'utf-8'));
const serverInfo = { name: MANIFEST.slug, version: MANIFEST.version };

const app = express();

app.get('/health', (req, res) => res.json({ ok: true, plugin: MANIFEST.slug, version: MANIFEST.version }));
app.get('/manifest', (req, res) => res.type('application/json').send(JSON.stringify(MANIFEST)));

app.post('/mcp', express.raw({ type: '*/*', limit: '1mb' }), async (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
  let body;
  try {
    body = raw.length ? JSON.parse(raw.toString('utf8')) : {};
  } catch {
    body = {};
  }
  const isNotification = !('id' in body);
  try {
    verifyInbound(raw, req);
    const tenant = extractTenant(req);
    const result = await handleRpc(body, tenant, serverInfo);
    if (isNotification || result === null) return res.status(202).end();
    return res.json({ jsonrpc: '2.0', id: body.id, result });
  } catch (e) {
    if (isNotification) return res.status(202).end();
    return res
      .status(e.status || 200)
      .json({ jsonrpc: '2.0', id: body.id ?? null, error: { code: e.code || -32000, message: e.message } });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`dialpad plugin listening on :${port}`);
  if (!authConfigured) {
    console.warn('WARNING: no MCP_SIGNING_SECRET or PLUGIN_GATEWAY_SECRET set — inbound auth is OFF (dev only).');
  }
});
