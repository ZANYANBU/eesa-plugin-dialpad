// Dialpad MCP surface — READ ONLY. Every tool is one GET operation from the
// official Dialpad Platform API v1.0 OpenAPI spec. The tool list is generated
// (src/tools.generated.js, via scripts/generate-tools.mjs) so it IS the spec,
// not a hand-picked subset. Each tools/call builds a Dialpad client from the
// CALLING tenant's own credentials, so one tenant can never see another's data.
import { dialpadClient, page } from './dialpad.js';
import { GENERATED_TOOLS } from './tools.generated.js';

const PROTOCOL = '2025-06-18';

const BY_NAME = new Map(GENERATED_TOOLS.map((t) => [t.name, t]));
const LISTED = GENERATED_TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));
export const TOOL_NAMES = GENERATED_TOOLS.map((t) => t.name);

// Substitute {path} params into the URL; collect the declared query params.
function buildRequest(def, args) {
  let path = def.path;
  for (const p of def.pathParams) {
    const v = args[p];
    if (v === undefined || v === null || v === '') throw new Error(`Missing required path parameter: ${p}`);
    path = path.replace(`{${p}}`, encodeURIComponent(String(v)));
  }
  const query = {};
  for (const p of def.queryParams) {
    if (args[p] !== undefined && args[p] !== null && args[p] !== '') query[p] = args[p];
  }
  return { path, query };
}

// Compact a { items, cursor } list envelope to { count, cursor, items }; pass a
// single detail object straight through.
function shape(json) {
  if (json && typeof json === 'object' && !Array.isArray(json) && (Array.isArray(json.items) || 'cursor' in json)) {
    return page(json);
  }
  return json;
}

export async function handleRpc(body, tenant, serverInfo) {
  const { method, params = {} } = body;
  if (method === 'initialize') {
    return { protocolVersion: PROTOCOL, capabilities: { tools: {} }, serverInfo };
  }
  if (method === 'notifications/initialized') return null;
  if (method === 'tools/list') return { tools: LISTED };
  if (method === 'tools/call') {
    const def = BY_NAME.get(params.name);
    if (!def) {
      const err = new Error('Unknown tool: ' + params.name);
      err.code = -32601;
      throw err;
    }
    try {
      // Build the client from the CALLING tenant's own Dialpad key. Throws
      // NO_CREDENTIALS (surfaced as isError) if the tenant hasn't connected.
      const dp = dialpadClient({ apiKey: tenant?.creds?.api_key, apiBase: tenant?.creds?.api_base });
      const { path, query } = buildRequest(def, params.arguments || {});
      const result = shape(await dp.get(path, query));
      const text = typeof result === 'string' ? result : JSON.stringify(result);
      return { content: [{ type: 'text', text }], isError: false };
    } catch (e) {
      return { content: [{ type: 'text', text: 'Error: ' + e.message }], isError: true };
    }
  }
  const err = new Error('Unknown method: ' + method);
  err.code = -32601;
  throw err;
}
