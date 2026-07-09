// Dialpad plugin auth — verify Eesa RS256 tokens via JWKS (jose) + the
// gateway-only shared-secret check. Same trust model as every Eesa plugin:
// the platform mints a short-lived token with audience = this plugin's slug,
// and the gateway attaches X-Eesa-Gateway-Secret. Both are injected by the
// platform — you never set the JWKS URL / issuer / gateway secret yourself.
import { createRemoteJWKSet, jwtVerify } from 'jose';

const AUDIENCE = process.env.PLUGIN_SLUG || 'dialpad';
const ISSUER = process.env.EESA_TOKEN_ISSUER || 'eesa';
const GATEWAY_SECRET = process.env.PLUGIN_GATEWAY_SECRET || '';

const JWKS = createRemoteJWKSet(
  new URL(process.env.EESA_JWKS_URL || 'https://eesa.ai/.well-known/jwks.json'),
);

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

// Verify the incoming Eesa token (RS256, checked against the platform JWKS).
// Returns the caller context (tenant + user) the tools run as.
export async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw new AuthError('missing bearer token');
  }
  const token = authHeader.slice(7).trim();
  let payload;
  try {
    ({ payload } = await jwtVerify(token, JWKS, { issuer: ISSUER, audience: AUDIENCE }));
  } catch (e) {
    throw new AuthError('token verification failed: ' + e.message);
  }
  const tenantId = payload.tenantId || payload.tenant_id;
  if (!tenantId) throw new AuthError('token missing tenantId');
  return {
    sub: String(payload.sub || ''),
    tenantId: String(tenantId),
    scopes: payload.scopes || [],
    surface: payload.surface || 'mcp',
    email: payload.email || '',
    role: payload.role || '',
    raw: payload,
  };
}

// Gateway-only guard: the MCP surface is reachable only through the Eesa
// gateway, which attaches the shared secret. If PLUGIN_GATEWAY_SECRET is unset
// (local dev), the check is skipped.
export function requireGateway(req) {
  if (!GATEWAY_SECRET) return;
  const got = req.get('X-Eesa-Gateway-Secret');
  if (!got || got !== GATEWAY_SECRET) {
    throw new AuthError('gateway secret missing or invalid', 403);
  }
}
