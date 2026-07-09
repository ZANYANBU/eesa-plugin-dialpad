// Dialpad plugin server — one Coolify container, one surface:
//   GET  /health         liveness (no auth)
//   GET  /manifest       serve the manifest (no auth)
//   POST /mcp            MCP (gateway secret + Eesa token) → agent tools
import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { requireGateway, verifyToken } from './auth.js';
import { handleRpc } from './mcp.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = JSON.parse(readFileSync(join(__dirname, '..', 'manifest.json'), 'utf-8'));
const serverInfo = { name: MANIFEST.slug, version: MANIFEST.version };

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true, plugin: MANIFEST.slug, version: MANIFEST.version }));
app.get('/manifest', (req, res) => res.json(MANIFEST));

// ---- MCP surface: gateway-only + Eesa token, JSON-RPC 2.0 ----
app.post('/mcp', async (req, res) => {
  const body = req.body || {};
  const isNotification = !('id' in body);
  try {
    requireGateway(req);
    const ctx = await verifyToken(req.get('Authorization'));
    const result = await handleRpc(body, ctx, serverInfo);
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
app.listen(port, () => console.log(`dialpad plugin listening on :${port}`));
