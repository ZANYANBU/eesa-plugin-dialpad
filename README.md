# Dialpad — Eesa federated plugin

A standalone Node service that exposes the **Dialpad** cloud phone system to the
Eesa AI agent as MCP tools. Stateless: it holds no database — every tool is a
thin, authenticated proxy to the Dialpad REST API using the workspace's own API
key.

| Surface | Route | Auth | Caller |
|---|---|---|---|
| MCP (agent) | `POST /mcp` | Eesa JWKS token **+ gateway secret** | Eesa gateway |
| Health | `GET /health` | none | Coolify / uptime |
| Manifest | `GET /manifest` | none | — |

Trust model is identical to every Eesa plugin: the platform mints a short-lived
RS256 token (audience = `dialpad`), the gateway attaches `X-Eesa-Gateway-Secret`,
and this service verifies both against the platform JWKS. **The platform auth env
(JWKS URL, issuer, gateway secret) is injected automatically — you never set it.**

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

`send_sms` is the only mutating tool — gate it behind approval in Eesa RBAC.

## The one secret you provide

`DIALPAD_API_KEY` — a Dialpad company API key
(Dialpad → Admin Settings → Company Settings → API keys). Base URL defaults to
`https://dialpad.com/api/v2`; auth is `Authorization: Bearer <key>`.

> The key is **never** committed to this repo and **never** logged. You paste it
> once into the Eesa publishing UI (see below), which injects it as an env var.

## Run locally

```bash
cp .env.example .env      # fill DIALPAD_API_KEY (and leave PLUGIN_GATEWAY_SECRET blank for local)
npm install
npm run check             # syntax-compile every source file
npm start                 # listens on :8080
curl localhost:8080/health
```

## Deploy on Coolify

Dockerfile app → container port **8080** → set env (`DIALPAD_API_KEY`, and the
platform-injected `PLUGIN_GATEWAY_SECRET` / `EESA_JWKS_URL` / `EESA_TOKEN_ISSUER`)
→ domain **`dialpad.plugins.bibekpoudel.com`** (TLS auto) → restrict inbound to
the Eesa gateway.

## Onboard in Eesa (Admin → Publishing)

At `https://eesa.ai/admin/publishing`, point the pipeline at this repo:

- **Git repository (public https):** `https://github.com/ZANYANBU/eesa-plugin-dialpad`
- **Branch:** `main`
- **Build pack:** `dockerfile`
- **Container port:** `8080`
- **manifest.json:** paste the contents of [`manifest.json`](./manifest.json)
- **Plugin env:**
  ```
  DIALPAD_API_KEY=<your Dialpad company API key>
  ```

The platform auth env (JWKS URL, issuer, gateway secret) is added for you.

Or register the manifest directly:

```bash
curl -X POST https://eesa.ai/api/v1/tools/plugins/register/ \
  -H "Authorization: Bearer <super-admin JWT>" -H "Content-Type: application/json" \
  --data @manifest.json
```

## Notes

- Node 20+ (global `fetch`, no HTTP-client dependency). Deps: `express`, `jose`.
- List endpoints return `{ cursor, items }`; tools return a compact page the
  agent can reason over, plus `cursor` for pagination.
- `send_sms` follows the documented `POST /sms/send` shape; verify against your
  Dialpad plan before relying on it in automations.
