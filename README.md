# Dialpad — Eesa federated plugin (multi-tenant, read-only)

A standalone Node service that exposes the **Dialpad** cloud phone system to the
Eesa AI agent as MCP tools. Stateless — no database. **Multi-tenant by design:**
every workspace connects its *own* Dialpad API key; the platform forwards that
key per-request, so one tenant can never see another's Dialpad data.

**The tool surface is the spec.** Every tool is one **GET (read-only)** operation
from the official **Dialpad Platform API v1.0** OpenAPI spec — **102 tools**,
generated, not hand-picked. There are **no writes**: nothing this plugin does can
mutate a Dialpad workspace.

| Surface | Route | Auth | Caller |
|---|---|---|---|
| MCP (agent) | `POST /mcp` | HMAC signature **+ per-tenant cred headers** | Eesa MCP client |
| Health | `GET /health` | none | Coolify / uptime |
| Manifest | `GET /manifest` | none | — |

## How per-tenant credentials work

This follows Eesa's `docs/setup/mcp-server-implementation.md` contract. On each
call the platform sends:

- `X-Mcp-Tenant-Id: <uuid>` — the calling tenant.
- `X-Mcp-Tenant-Cred-Api-Key: <key>` — **that tenant's own Dialpad key**, taken
  from their subscription config field `api_key`.
- `X-Mcp-Tenant-Cred-Api-Base: <url>` — optional, from config `api_base`.
- `X-Mcp-Timestamp` + `X-Mcp-Signature: sha256=…` — HMAC-SHA256 over
  `` `${timestamp}.${rawBody}` `` keyed with the shared `MCP_SIGNING_SECRET`.

The plugin verifies the signature, reads the tenant's key from the header, and
builds a Dialpad client bound to that one key for the duration of the request.
**Nothing is persisted or logged.** There is **no global Dialpad key.**

## Tools — the complete read surface (102)

Generated from [`spec/dialpad-openapi.json`](./spec/dialpad-openapi.json) by
[`scripts/generate-tools.mjs`](./scripts/generate-tools.mjs) into
[`src/tools.generated.js`](./src/tools.generated.js). Tool names are the spec's
`operationId` (e.g. `call.get_call_info` → `call_get_call_info`); each tool's
inputs are the operation's path + query parameters, straight from the spec.

Coverage by Dialpad resource:

| Resource | Tools | Resource | Tools |
|---|---|---|---|
| offices | 11 | rooms | 4 |
| subscriptions (event) | 14 | channels | 3 |
| users | 7 | coaching teams | 3 |
| call centers | 6 | scorecards | 3 |
| call | 4 | access-control policies | 3 |
| message | 4 | departments | 3 |
| numbers · contacts · transcripts | 2 each | blocked numbers · dispositions | 2 each |
| meetings · conference · company | 2 each | webhooks · websockets · wfm | 2 each |
| user devices · call routers · schedule reports | 2 each | stats · digital · agent-groups | 1 each |
| callback · call labels · custom IVRs | 1 each | recording/review sharelinks · app settings | 1 each |

The full authoritative list (name + description) is in
[`manifest.json`](./manifest.json) under `surfaces.mcp.tools`.

Dialpad base URL: `https://dialpad.com/api/v2` · auth `Authorization: Bearer <key>`.

**Regenerating** (when Dialpad publishes a new spec):

```bash
curl -sL https://dialpad.com/static/openapi/platform-v1.0.json -o spec/dialpad-openapi.json
npm run gen        # rewrites src/tools.generated.js + manifest.json tool list
npm run check      # syntax-compile everything
```

### Not included: writes

By design this plugin is **read-only** — POST/PUT/PATCH/DELETE operations
(send SMS, place/hang-up calls, create/edit/delete contacts, block numbers,
etc.) are **not** generated. If a specific write is needed later it can be added
as an explicitly-flagged tool and gated behind approval in Eesa RBAC.

## Env (what the *service* needs — NOT the Dialpad key)

| Var | Purpose |
|---|---|
| `MCP_SIGNING_SECRET` | HMAC secret; same value as the platform's `MCPServerConnection.signing_secret`. Recommended for prod. |
| `PLUGIN_GATEWAY_SECRET` | Alt shared-secret auth; injected automatically by the Eesa publishing pipeline for gateway-only plugins. |
| `PORT` | defaults to 8080 |

The **Dialpad key is per-tenant** and arrives in a header — it is never an env var here.

## Run locally

```bash
cp .env.example .env      # optionally set MCP_SIGNING_SECRET
npm install
npm run check             # syntax-compile every source file
npm start                 # listens on :8080
curl localhost:8080/health
```

To exercise a tool locally you simulate the platform headers
(`X-Mcp-Tenant-Cred-Api-Key: <a Dialpad key>`, plus a valid `X-Mcp-Signature`
if `MCP_SIGNING_SECRET` is set).

## Deploy on Coolify

Dockerfile app → container port **8080** → env `MCP_SIGNING_SECRET` (and/or the
platform-injected `PLUGIN_GATEWAY_SECRET`) → domain
**`dialpad.plugins.bibekpoudel.com`** (TLS auto) → restrict inbound to the Eesa
platform. Coolify does not auto-deploy on git push unless a webhook / Automatic
Deployment is enabled — otherwise click **Redeploy** after merging.

## Onboard in Eesa (Admin → Publishing)

At `https://eesa.ai/admin/publishing`:

- **Git repository (public https):** `https://github.com/ZANYANBU/eesa-plugin-dialpad`
- **Branch:** `main`
- **Build pack:** `dockerfile`
- **Container port:** `8080`
- **manifest.json:** paste [`manifest.json`](./manifest.json)
- **Plugin env:**
  ```
  MCP_SIGNING_SECRET=<a strong random secret — the SAME value on the platform connection>
  ```
  **Do NOT put a Dialpad key here** — it's per-tenant.

Then, so tenants can connect their own key, the marketplace Product for this
plugin must expose the `tenantConfig` fields (`api_key`, optional `api_base`).
A tenant admin **purchases the Dialpad integration and enters their Dialpad API
key** in the setup form; the platform forwards it as `X-Mcp-Tenant-Cred-Api-Key`
on every call. After deploying/updating, **re-run Sync tools** in Eesa so the new
tool list is discovered.

## Security notes

- Never log `X-Mcp-Tenant-Cred-*` values or tool arguments containing PII.
- Verify the HMAC signature in production (`MCP_SIGNING_SECRET` set); reject
  unsigned requests.
- Use HTTPS end-to-end; treat the signing secret like any other secret (rotate,
  store in a secret manager).
- **Read-only:** the plugin issues only GET requests to Dialpad — it cannot
  create, modify, or delete anything in a connected workspace.
