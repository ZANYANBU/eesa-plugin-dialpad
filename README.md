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

**53 tools** — 40 reads + 13 writes. Every write is flagged `WRITE` in its
description so it can be gated behind approval in Eesa RBAC. Grouped by resource:

| Resource | Tool | Kind | Dialpad endpoint |
|---|---|---|---|
| Users | `list_users` | read | `GET /users` |
| | `get_user` | read | `GET /users/{id}` |
| | `get_user_caller_ids` | read | `GET /users/{id}/caller_id` |
| | `toggle_user_dnd` | **write** | `PATCH /users/{id}/toggle_dnd` |
| | `initiate_call` | **write** | `POST /users/{id}/initiate_call` |
| Calls | `list_calls` | read | `GET /calls` |
| | `get_call` | read | `GET /calls/{id}` |
| | `get_call_transcript` | read | `GET /transcripts/{id}` |
| | `get_call_ai_recap` | read | `GET /calls/{id}/ai_recap` |
| | `get_call_operators` | read | `GET /calls/{id}/assigned_operators` |
| | `add_call_labels` | **write** | `POST /calls/{id}/labels` |
| | `hangup_call` | **write** | `POST /calls/{id}/actions/hangup` |
| | `create_call_review_sharelink` | **write** | `POST /calls/{id}/review_sharelink` |
| Contacts | `list_contacts` | read | `GET /contacts` |
| | `get_contact` | read | `GET /contacts/{id}` |
| | `create_contact` | **write** | `POST /contacts` |
| | `update_contact` | **write** | `PATCH /contacts/{id}` |
| | `delete_contact` | **write** | `DELETE /contacts/{id}` |
| Departments | `list_departments` | read | `GET /departments` |
| | `get_department` | read | `GET /departments/{id}` |
| | `list_department_operators` | read | `GET /departments/{id}/operators` |
| Offices | `list_offices` | read | `GET /offices` |
| | `get_office` | read | `GET /offices/{id}` |
| | `get_office_plan` | read | `GET /offices/{id}/plan` |
| | `list_office_operators` | read | `GET /offices/{id}/operators` |
| Call centers | `list_call_centers` | read | `GET /call_centers` |
| | `get_call_center` | read | `GET /call_centers/{id}` |
| | `get_call_center_status` | read | `GET /call_centers/{id}/status` |
| | `list_call_center_operators` | read | `GET /call_centers/{id}/operators` |
| | `set_operator_duty_status` | **write** | `PATCH /call_centers/{id}/operators/{uid}/duty_status` |
| | `list_callbacks` | read | `GET /call_centers/{id}/callbacks` |
| | `enqueue_callback` | **write** | `POST /call_centers/{id}/callbacks` |
| Coaching teams | `list_coaching_teams` | read | `GET /coaching_teams` |
| | `get_coaching_team` | read | `GET /coaching_teams/{id}` |
| | `list_coaching_team_members` | read | `GET /coaching_teams/{id}/members` |
| Phone numbers | `list_phone_numbers` | read | `GET /numbers` |
| | `get_phone_number` | read | `GET /numbers/{number}` |
| | `format_phone_number` | read | `POST /phone/format` |
| Rooms / channels | `list_rooms` | read | `GET /rooms` |
| | `list_channels` | read | `GET /channels` |
| Blocked / dispositions | `list_blocked_numbers` | read | `GET /blocked_numbers` |
| | `block_number` | **write** | `POST /blocked_numbers/add` |
| | `unblock_number` | **write** | `POST /blocked_numbers/remove` |
| | `list_dispositions` | read | `GET /dispositions` |
| Company / meetings | `get_company` | read | `GET /company` |
| | `list_sms_opt_outs` | read | `GET /company/sms_opt_out` |
| | `list_meetings` | read | `GET /meetings` |
| | `list_scheduled_messages` | read | `GET /schedules` |
| SMS | `send_sms` | **write** | `POST /sms/send` |
| Analytics | `request_call_stats` | read | `POST /stats` |
| | `get_stats_result` | read | `GET /stats/{request_id}` |
| | `list_scorecards` | read | `GET /scorecards` |
| | `get_wfm_agent_metrics` | read | `GET /wfm/metrics/agent` |

Dialpad base URL: `https://dialpad.com/api/v2` · auth `Authorization: Bearer <key>`.
Analytics is async: `request_call_stats` returns a `request_id`; poll
`get_stats_result` until the export is ready.

Not exposed (intentionally): pure integration/config surfaces — webhooks, event
subscriptions, websockets, OAuth, access-control policies — and destructive admin
ops (delete user/office/department). They are not agent-appropriate.

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
- The 13 writes (SMS, place/hang-up calls, contact CRUD, block/unblock numbers,
  agent duty status, DND, callbacks, call labels/sharelinks) each carry `WRITE`
  in their description — gate them behind approval in Eesa RBAC. All 40 read
  tools are side-effect-free.
