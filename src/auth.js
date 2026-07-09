// Dialpad plugin auth — the Eesa marketplace MCP contract
// (docs/setup/mcp-server-implementation.md). Each tenant brings their OWN
// Dialpad key: the platform forwards it per-request as X-Mcp-Tenant-Cred-*
// headers, signed with an HMAC (X-Mcp-Signature). We verify the signature and
// read the calling tenant's key from the header — there is NO shared global key.
import crypto from 'crypto';

const SIGNING_SECRET = process.env.MCP_SIGNING_SECRET || '';
const GATEWAY_SECRET = process.env.PLUGIN_GATEWAY_SECRET || '';
const MAX_AGE_SECONDS = 300; // 5-minute replay window

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

// Prove the request really came from Eesa. Accept EITHER proof:
//   1) X-Eesa-Gateway-Secret — what the publishing pipeline (deploy / tool sync /
//      integrity test) and the default gateway-only agent path send. Injected
//      automatically as PLUGIN_GATEWAY_SECRET.
//   2) HMAC signature over `${timestamp}.${rawBody}` (Stripe-style) keyed with
//      MCP_SIGNING_SECRET — used when the marketplace connection has a signing
//      secret (per-tenant credential calls). Verified only when present.
// If NEITHER secret is configured, we're in local dev and allow it.
export function verifyInbound(rawBody, req) {
  // 1) Gateway-secret proof.
  if (GATEWAY_SECRET && req.get('X-Eesa-Gateway-Secret') === GATEWAY_SECRET) return;

  // 2) HMAC signature (when the platform signs).
  if (SIGNING_SECRET) {
    const ts = req.get('X-Mcp-Timestamp');
    const sig = req.get('X-Mcp-Signature') || '';
    if (ts && sig.startsWith('sha256=')) {
      const tsInt = Number(ts);
      if (!Number.isFinite(tsInt) || Math.abs(Date.now() / 1000 - tsInt) > MAX_AGE_SECONDS) {
        throw new AuthError('timestamp outside replay window');
      }
      const expected =
        'sha256=' +
        crypto.createHmac('sha256', SIGNING_SECRET).update(`${ts}.${rawBody.toString('utf8')}`).digest('hex');
      const a = Buffer.from(expected);
      const b = Buffer.from(sig);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) return;
      throw new AuthError('bad signature');
    }
  }

  // 3) No inbound secret configured at all → local dev, allow.
  if (!GATEWAY_SECRET && !SIGNING_SECRET) return;

  // A secret is configured but the request carried no valid proof.
  throw new AuthError('missing gateway secret or signature');
}

// Pull the calling tenant + its per-tenant credentials from the X-Mcp-Tenant-*
// headers. Returns { tenantId, creds } where creds mirrors the tenant's
// Subscription configuration — e.g. { api_key, api_base }. NEVER log creds.
export function extractTenant(req) {
  const tenantId = req.get('X-Mcp-Tenant-Id') || null;
  const creds = {};
  for (const [k, v] of Object.entries(req.headers)) {
    // Express lower-cases header names: x-mcp-tenant-cred-api-key -> api_key
    if (k.startsWith('x-mcp-tenant-cred-')) {
      const field = k.slice('x-mcp-tenant-cred-'.length).replace(/-/g, '_');
      creds[field] = Array.isArray(v) ? v[0] : v;
    }
  }
  return { tenantId, creds };
}

export const authConfigured = Boolean(SIGNING_SECRET || GATEWAY_SECRET);
