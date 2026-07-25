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

// Embedded UI surface (surfaces.ui). A static conversation-history page, loaded
// by Eesa's plugins/[slug]/app iframe shell. It holds NO credential: it receives
// a short-lived UI-session token over postMessage and fetches call data through
// Eesa's gateway (which injects the tenant's Dialpad key). Framing is therefore
// intentionally allowed FROM Eesa — the shell embeds this page in an iframe.
const UI_FILE = join(__dirname, '..', 'public', 'app.html');
app.get('/app', (req, res) => {
  // Don't send X-Frame-Options: DENY here; this page is meant to be embedded by
  // the Eesa shell. The gateway session token is what authorises data access,
  // not the framing, so embedding the static shell is harmless on its own.
  res.type('text/html').sendFile(UI_FILE);
});

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
