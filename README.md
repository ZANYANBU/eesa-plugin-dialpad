# Dialpad — Eesa federated plugin (multi-tenant)

A standalone Node service that exposes the **Dialpad** cloud phone system to the
Eesa AI agent as MCP tools. Stateless — no database. **Multi-tenant by design:**
every workspace connects its *own* Dialpad API key; the platform forwards that
key per-request, so one tenant can never see another's Dialpad data.

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

## Tools

| Tool | Kind | Dialpad endpoint |
|---|---|---|
| `list_users` | read | `GET /users` |
| `get_user` | read | `GET /users/{id}` |
| `list_calls` | read | `GET /calls` |
| `get_call` | read | `GET /calls/{id}` |
| `get_call_transcript` | read | `GET /transcripts/{call_id}` |
| `list_offices` | read | `GET /offices` |
| `list_departments` | read | `GET /departments` |
| `list_contacts` | read | `GET /contacts` |
| `list_phone_numbers` | read | `GET /numbers` |
| `send_sms` | **write** | `POST /sms/send` |

Dialpad base URL: `https://dialpad.com/api/v2` · auth `Authorization: Bearer <key>`.

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
platform.

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
on every call.

## Security notes

- Never log `X-Mcp-Tenant-Cred-*` values or tool arguments containing PII.
- Verify the HMAC signature in production (`MCP_SIGNING_SECRET` set); reject
  unsigned requests.
- Use HTTPS end-to-end; treat the signing secret like any other secret (rotate,
  store in a secret manager).
- `send_sms` is the only write — gate it behind approval in Eesa RBAC.
