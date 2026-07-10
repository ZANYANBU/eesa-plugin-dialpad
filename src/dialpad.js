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
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v)) {
        for (const item of v) if (item !== undefined && item !== null && item !== '') url.searchParams.append(k, String(item));
      } else {
        url.searchParams.set(k, String(v));
      }
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
    patch: (path, body, query) => request('PATCH', path, { body, query }),
    del: (path, query) => request('DELETE', path, { query }),
  };
}

// Dialpad list endpoints return { cursor, items }; a few older ones use a
// resource-named array. Normalise any of them to a compact { count, cursor,
// items } page and, when a mapper is given, project each row to the fields an
// agent actually reasons over.
export function page(json, mapper) {
  const items = Array.isArray(json)
    ? json
    : json.items ||
      json.users ||
      json.contacts ||
      json.calls ||
      json.offices ||
      json.departments ||
      json.call_centers ||
      json.coaching_teams ||
      json.rooms ||
      json.channels ||
      json.meetings ||
      json.numbers ||
      json.operators ||
      json.members ||
      json.callbacks ||
      json.dispositions ||
      json.blocked_numbers ||
      json.schedules ||
      json.scorecards ||
      [];
  return {
    count: items.length,
    cursor: json.cursor || null,
    items: mapper ? items.map(mapper) : items,
  };
}
