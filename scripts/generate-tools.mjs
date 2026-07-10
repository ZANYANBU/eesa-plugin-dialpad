// Generate the READ-ONLY MCP tool surface directly from the official Dialpad
// OpenAPI spec (spec/dialpad-openapi.json). Every GET operation under /api/v2
// becomes one tool. Re-run whenever Dialpad publishes a new spec:
//   node scripts/generate-tools.mjs
// Emits:  src/tools.generated.js   (the tool metadata array)
// Updates: manifest.json           (surfaces.mcp.tools + version + description)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const spec = JSON.parse(readFileSync(join(ROOT, 'spec', 'dialpad-openapi.json'), 'utf8'));

const API_PREFIX = '/api/v2';

const sanitizeName = (opId) =>
  opId.replace(/[^a-z0-9]+/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase();

const mapType = (schema = {}) => {
  const t = schema.type;
  if (t === 'integer') return 'integer';
  if (t === 'number') return 'number';
  if (t === 'boolean') return 'boolean';
  if (t === 'array') return 'array';
  return 'string';
};

const firstSentence = (s) => {
  if (!s) return '';
  const clean = String(s).replace(/\s+/g, ' ').trim();
  const m = clean.match(/^(.{0,180}?[.!?])(\s|$)/);
  return (m ? m[1] : clean.slice(0, 180)).trim();
};

const tools = [];
const seen = new Map();

for (const [path, ops] of Object.entries(spec.paths || {})) {
  const op = ops.get;
  if (!op) continue; // READ ONLY: GET operations only
  if (!path.startsWith(API_PREFIX)) continue; // skip /oauth2/authorize (browser redirect, not JSON)

  const name = sanitizeName(op.operationId || `get ${path}`);
  if (seen.has(name)) throw new Error(`name collision: ${name} (${op.operationId} vs ${seen.get(name)})`);
  seen.set(name, op.operationId);

  const params = op.parameters || [];
  const pathParams = params.filter((p) => p.in === 'path').map((p) => p.name);
  const queryParams = params.filter((p) => p.in === 'query').map((p) => p.name);

  const properties = {};
  const required = [];
  for (const p of params) {
    if (p.in !== 'path' && p.in !== 'query') continue;
    const prop = { type: mapType(p.schema), description: firstSentence(p.description) || `${p.in} parameter ${p.name}` };
    if (prop.type === 'array') prop.items = { type: mapType(p.schema?.items) };
    properties[p.name] = prop;
    if (p.required) required.push(p.name);
  }

  const desc = (firstSentence(op.summary) || firstSentence(op.description) || `Read ${path}`).replace(/\s*\[read-only\]\s*$/i, '');

  tools.push({
    name,
    description: `${desc} [read-only]`.slice(0, 300),
    tag: (op.tags || [])[0] || 'misc',
    path: path.slice(API_PREFIX.length) || '/',
    pathParams,
    queryParams,
    inputSchema: { type: 'object', properties, ...(required.length ? { required } : {}) },
  });
}

tools.sort((a, b) => (a.tag + a.name).localeCompare(b.tag + b.name));

// --- emit src/tools.generated.js -------------------------------------------
const header =
  '// AUTO-GENERATED from spec/dialpad-openapi.json by scripts/generate-tools.mjs.\n' +
  '// Do NOT edit by hand — re-run the generator instead. Every entry is one GET\n' +
  `// (read-only) Dialpad operation. Generated: ${tools.length} tools.\n\n` +
  'export const GENERATED_TOOLS = ';
writeFileSync(join(ROOT, 'src', 'tools.generated.js'), header + JSON.stringify(tools, null, 2) + ';\n');

// --- update manifest.json ---------------------------------------------------
const manifestPath = join(ROOT, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.version = '2.0.0';
manifest.scopes = ['dialpad:read'];
manifest.description =
  `Dialpad cloud phone system as agent tools — the complete READ-ONLY surface of the official Dialpad ` +
  `Platform API v1.0 (${tools.length} GET endpoints: calls, transcripts, AI recaps, users, contacts, ` +
  `offices, departments, call centers, coaching teams, numbers, rooms, channels, meetings, analytics/stats/` +
  `scorecards/WFM, and more). Multi-tenant: each workspace connects its own Dialpad API key. No writes.`;
manifest.surfaces.mcp.tools = tools.map((t) => ({ name: t.name, description: t.description }));
manifest.roles = [
  { key: 'viewer', label: 'Viewer', description: `Read-only access to all ${tools.length} Dialpad read endpoints.` },
];
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// --- report -----------------------------------------------------------------
const byTag = {};
for (const t of tools) byTag[t.tag] = (byTag[t.tag] || 0) + 1;
console.log(`generated ${tools.length} read-only tools`);
console.log('longest name :', tools.map((t) => t.name).reduce((a, b) => (a.length > b.length ? a : b)));
const over64 = tools.filter((t) => t.name.length > 64).map((t) => t.name);
console.log('names > 64ch :', over64.length ? over64.join(', ') : '(none)');
console.log('by tag       :', JSON.stringify(byTag));
