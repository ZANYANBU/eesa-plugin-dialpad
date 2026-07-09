// Thin Dialpad REST client, bound to ONE tenant's key. A fresh client is built
// per request from the X-Mcp-Tenant-Cred-* headers — the key is never persisted,
// never logged, and never shared across tenants. Node 20 has global fetch.
const DEFAULT_BASE = 'https://dialpad.com/api/v2';

export function dialpadClient({ apiKey, apiBase } = {}) {
  if (!apiKey) {
    const err = new Error(
      'This workspace has not connected Dialpad yet. Add your Dialpad API key in the ' +
        'integration setup (Purchased Tools → Dialpad).',
    );
    err.code = 'NO_CREDENTIALS';
    throw err;
  }
  const base = (apiBase || DEFAULT_BASE).replace(/\/+$/, '');

  async function request(method, path, { query, body } = {}) {
    const url = new URL(base + path);
    for (const [k, v] of Object.entries(query || {})) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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

  return {
    get: (path, query) => request('GET', path, { query }),
    post: (path, body, query) => request('POST', path, { body, query }),
  };
}

// List endpoints return { cursor, items }. Normalise to a compact page.
export function page(json, mapper) {
  const items = json.items || json.users || json.contacts || json.calls || [];
  return {
    count: items.length,
    cursor: json.cursor || null,
    items: mapper ? items.map(mapper) : items,
  };
}
