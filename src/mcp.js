// Dialpad MCP surface — the agent tools. Pure JSON-RPC logic; the HTTP/auth
// envelope lives in server.js. Every tool maps onto the Dialpad REST client.
// Reads are the core; send_sms is the single write (gate it in Eesa RBAC).
import { dp, page } from './dialpad.js';

const PROTOCOL = '2025-06-18';

// --- compact mappers: keep the fields an agent actually reasons over --------
const asUser = (u) => ({
  id: u.id,
  name: u.display_name || [u.first_name, u.last_name].filter(Boolean).join(' '),
  emails: u.emails || [],
  office_id: u.office_id,
  state: u.state,
  license: u.license,
  is_admin: u.is_admin,
  is_on_duty: u.is_on_duty,
  is_online: u.is_online,
  is_available: u.is_available,
  phone_numbers: u.phone_numbers || [],
});
const asCall = (c) => ({
  id: c.call_id || c.id,
  direction: c.direction,
  state: c.state,
  from: c.external_number || c.from_number || c.contact?.phone,
  to: c.internal_number || c.to_number || c.target?.phone,
  target: c.target?.name || c.target?.email,
  duration_seconds: c.duration != null ? Math.round(Number(c.duration) / 1000) : c.total_duration,
  was_recorded: c.was_recorded,
  date_started: c.date_started || c.date_connected,
  date_ended: c.date_ended,
});

const TOOLS = [
  {
    name: 'list_users',
    description: 'List Dialpad users (name, email, office, on-duty / online status). Optionally filter by email.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Filter to the user with this email.' },
        limit: { type: 'integer', description: 'Max users to return (default 25).' },
      },
    },
    run: async (a) => page(await dp.get('/users', { email: a.email, limit: a.limit || 25 }), asUser),
  },
  {
    name: 'get_user',
    description: "Get one Dialpad user's full details by user id.",
    inputSchema: {
      type: 'object',
      properties: { user_id: { type: 'string', description: 'Dialpad user id.' } },
      required: ['user_id'],
    },
    run: async (a) => asUser(await dp.get(`/users/${encodeURIComponent(a.user_id)}`)),
  },
  {
    name: 'list_calls',
    description: 'List recent call records (call history). Filter by time window (unix ms) or a target user/office/department id.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: 'Max calls to return (default 25).' },
        started_after: { type: 'integer', description: 'Only calls started after this unix time in milliseconds.' },
        started_before: { type: 'integer', description: 'Only calls started before this unix time in milliseconds.' },
        target_id: { type: 'string', description: 'Restrict to calls for this user/office/department id.' },
        target_type: { type: 'string', description: 'Type of target_id: user | office | department | callcenter.' },
      },
    },
    run: async (a) =>
      page(
        await dp.get('/calls', {
          limit: a.limit || 25,
          started_after: a.started_after,
          started_before: a.started_before,
          target_id: a.target_id,
          target_type: a.target_type,
        }),
        asCall,
      ),
  },
  {
    name: 'get_call',
    description: 'Get the full details of a single call by call id.',
    inputSchema: {
      type: 'object',
      properties: { call_id: { type: 'string', description: 'Dialpad call id.' } },
      required: ['call_id'],
    },
    run: async (a) => await dp.get(`/calls/${encodeURIComponent(a.call_id)}`),
  },
  {
    name: 'get_call_transcript',
    description: 'Get the transcript of a call by call id (when transcription is enabled for the workspace).',
    inputSchema: {
      type: 'object',
      properties: { call_id: { type: 'string', description: 'Dialpad call id.' } },
      required: ['call_id'],
    },
    run: async (a) => await dp.get(`/transcripts/${encodeURIComponent(a.call_id)}`),
  },
  {
    name: 'list_offices',
    description: 'List the offices in the Dialpad company.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer' } } },
    run: async (a) => page(await dp.get('/offices', { limit: a.limit || 50 })),
  },
  {
    name: 'list_departments',
    description: 'List the departments (groups) in the Dialpad company.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer' } } },
    run: async (a) => page(await dp.get('/departments', { limit: a.limit || 50 })),
  },
  {
    name: 'list_contacts',
    description: 'List contacts in the Dialpad company address book.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: 'Max contacts to return (default 25).' },
        owner_id: { type: 'string', description: 'Restrict to a specific owner user id.' },
      },
    },
    run: async (a) => page(await dp.get('/contacts', { limit: a.limit || 25, owner_id: a.owner_id })),
  },
  {
    name: 'list_phone_numbers',
    description: 'List the phone numbers provisioned in the Dialpad company.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer' } } },
    run: async (a) => page(await dp.get('/numbers', { limit: a.limit || 50 })),
  },
  {
    name: 'send_sms',
    description: 'Send an SMS text message from a Dialpad user to one or more numbers. WRITE action — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'Dialpad user id the SMS is sent from.' },
        to_numbers: { type: 'array', items: { type: 'string' }, description: 'Recipient numbers in E.164 (e.g. +14155551234).' },
        text: { type: 'string', description: 'Message body.' },
        from_number: { type: 'string', description: "Optional specific sending number owned by the user." },
      },
      required: ['user_id', 'to_numbers', 'text'],
    },
    run: async (a) =>
      await dp.post('/sms/send', {
        user_id: a.user_id,
        to_numbers: a.to_numbers,
        text: a.text,
        ...(a.from_number ? { from_number: a.from_number } : {}),
      }),
  },
];

const BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));
// tools/list must not leak the run() implementation to the client.
const LISTED = TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));

export async function handleRpc(body, ctx, serverInfo) {
  const { method, params = {} } = body;
  if (method === 'initialize') {
    return { protocolVersion: PROTOCOL, capabilities: { tools: {} }, serverInfo };
  }
  if (method === 'notifications/initialized') return null;
  if (method === 'tools/list') return { tools: LISTED };
  if (method === 'tools/call') {
    const tool = BY_NAME.get(params.name);
    if (!tool) {
      const err = new Error('Unknown tool: ' + params.name);
      err.code = -32601;
      throw err;
    }
    try {
      const result = await tool.run(params.arguments || {}, ctx);
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
