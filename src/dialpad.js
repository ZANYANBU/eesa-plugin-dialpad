// Thin Dialpad REST client (https://developers.dialpad.com). Every call uses
// the workspace's own API key from DIALPAD_API_KEY — the key is NEVER logged
// and NEVER leaves this service. Node 20 has global fetch, so no deps.
const BASE = (process.env.DIALPAD_API_BASE || 'https://dialpad.com/api/v2').replace(/\/+$/, '');
const API_KEY = process.env.DIALPAD_API_KEY || '';

function authHeaders() {
  if (!API_KEY) throw new Error('DIALPAD_API_KEY is not configured for this plugin.');
  return { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };
}

async function request(method, path, { query, body } = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error(`Dialpad request failed: ${e.message}`);
  }
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.error?.message || json?.detail || json?.message || text || `HTTP ${res.status}`;
    const err = new Error(`Dialpad API ${res.status}: ${msg}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export const dp = {
  get: (path, query) => request('GET', path, { query }),
  post: (path, body, query) => request('POST', path, { body, query }),
};

// List endpoints return { cursor, items }. Normalise to a compact page the
// agent can reason over without drowning in fields.
export function page(json, mapper) {
  const items = json.items || json.users || json.contacts || json.calls || [];
  return {
    count: items.length,
    cursor: json.cursor || null,
    items: mapper ? items.map(mapper) : items,
  };
}
