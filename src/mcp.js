// Dialpad MCP surface — the agent tools. Each tools/call builds a Dialpad
// client from the CALLING tenant's credentials (passed in as `dp`) so one
// tenant can never see another's Dialpad data. Reads are the bulk of the
// surface; the writes are individually flagged "WRITE" in their description so
// they can be gated behind approval in Eesa RBAC.
import { dialpadClient, page } from './dialpad.js';

const PROTOCOL = '2025-06-18';
const enc = encodeURIComponent;

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
const asContact = (c) => ({
  id: c.id,
  name: c.display_name || [c.first_name, c.last_name].filter(Boolean).join(' '),
  emails: c.emails || [],
  phones: c.phones || [],
  company: c.company_name,
  job_title: c.job_title,
  type: c.type,
  owner_id: c.owner_id,
});
const asOffice = (o) => ({
  id: o.id,
  name: o.name,
  country: o.country,
  state: o.state,
  main_line: o.main_line,
  phone_numbers: o.phone_numbers || [],
});
const asGroup = (g) => ({
  id: g.id,
  name: g.name,
  office_id: g.office_id,
  phone_numbers: g.phone_numbers || [],
  description: g.group_description || g.description,
});
const asNumber = (n) =>
  typeof n === 'string'
    ? { number: n }
    : {
        number: n.number || n.e164 || n.value,
        status: n.status,
        target_type: n.target_type,
        target_id: n.target_id,
        label: n.label,
      };

// small schema helpers to cut boilerplate
const S = {
  int: (description) => ({ type: 'integer', description }),
  str: (description) => ({ type: 'string', description }),
  bool: (description) => ({ type: 'boolean', description }),
  arr: (description) => ({ type: 'array', items: { type: 'string' }, description }),
};
const limit = (def) => S.int(`Max results to return (default ${def}).`);

const TOOLS = [
  // ---------------------------------------------------------------- USERS ---
  {
    name: 'list_users',
    description: 'List Dialpad users (name, email, office, on-duty / online status). Optionally filter by email or state.',
    inputSchema: {
      type: 'object',
      properties: {
        email: S.str('Filter to the user with this email.'),
        state: S.str('Filter by account state, e.g. active | suspended | deleted.'),
        limit: limit(25),
      },
    },
    run: async (a, dp) => page(await dp.get('/users', { email: a.email, state: a.state, limit: a.limit || 25 }), asUser),
  },
  {
    name: 'get_user',
    description: "Get one Dialpad user's full details by user id.",
    inputSchema: {
      type: 'object',
      properties: { user_id: S.str('Dialpad user id.') },
      required: ['user_id'],
    },
    run: async (a, dp) => asUser(await dp.get(`/users/${enc(a.user_id)}`)),
  },
  {
    name: 'get_user_caller_ids',
    description: 'List the caller-ID numbers a user is allowed to present on outbound calls.',
    inputSchema: {
      type: 'object',
      properties: { user_id: S.str('Dialpad user id.') },
      required: ['user_id'],
    },
    run: async (a, dp) => await dp.get(`/users/${enc(a.user_id)}/caller_id`),
  },
  {
    name: 'toggle_user_dnd',
    description: 'Turn Do-Not-Disturb on or off for a user. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: S.str('Dialpad user id.'),
        do_not_disturb: S.bool('true to enable DND, false to disable.'),
        group_id: S.str('Optional department/call-center id to scope DND to that group.'),
      },
      required: ['user_id', 'do_not_disturb'],
    },
    run: async (a, dp) =>
      await dp.patch(`/users/${enc(a.user_id)}/toggle_dnd`, {
        do_not_disturb: a.do_not_disturb,
        ...(a.group_id ? { group_id: a.group_id } : {}),
      }),
  },
  {
    name: 'initiate_call',
    description:
      "Ring a Dialpad user's device and place an outbound call to a phone number (click-to-call). WRITE — gate with approval in Eesa RBAC.",
    inputSchema: {
      type: 'object',
      properties: {
        user_id: S.str('Dialpad user id that will place the call (their device rings first).'),
        phone_number: S.str('Number to dial, E.164 (e.g. +14155551234).'),
        group_id: S.str('Optional department/call-center id to place the call on behalf of.'),
        outbound_caller_id: S.str('Optional caller-ID number to present.'),
      },
      required: ['user_id', 'phone_number'],
    },
    run: async (a, dp) =>
      await dp.post(`/users/${enc(a.user_id)}/initiate_call`, {
        phone_number: a.phone_number,
        ...(a.group_id ? { group_id: a.group_id } : {}),
        ...(a.outbound_caller_id ? { outbound_caller_id: a.outbound_caller_id } : {}),
      }),
  },

  // ---------------------------------------------------------------- CALLS ---
  {
    name: 'list_calls',
    description: 'List concluded call records (call history). Filter by time window (unix ms) or a target user/office/department/call-center id.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: limit(25),
        started_after: S.int('Only calls started after this unix time in milliseconds.'),
        started_before: S.int('Only calls started before this unix time in milliseconds.'),
        target_id: S.str('Restrict to calls for this user/office/department/call-center id.'),
        target_type: S.str('Type of target_id: user | office | department | callcenter | room.'),
      },
    },
    run: async (a, dp) =>
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
      properties: { call_id: S.str('Dialpad call id.') },
      required: ['call_id'],
    },
    run: async (a, dp) => await dp.get(`/calls/${enc(a.call_id)}`),
  },
  {
    name: 'get_call_transcript',
    description: 'Get the transcript of a call by call id (when transcription is enabled for the workspace).',
    inputSchema: {
      type: 'object',
      properties: { call_id: S.str('Dialpad call id.') },
      required: ['call_id'],
    },
    run: async (a, dp) => await dp.get(`/transcripts/${enc(a.call_id)}`),
  },
  {
    name: 'get_call_ai_recap',
    description: 'Get the AI recap (summary, action items, purposes) for a call by call id, when Ai is enabled.',
    inputSchema: {
      type: 'object',
      properties: { call_id: S.str('Dialpad call id.') },
      required: ['call_id'],
    },
    run: async (a, dp) => await dp.get(`/calls/${enc(a.call_id)}/ai_recap`),
  },
  {
    name: 'get_call_operators',
    description: 'List the operators currently assigned to a live call.',
    inputSchema: {
      type: 'object',
      properties: { call_id: S.str('Dialpad call id.') },
      required: ['call_id'],
    },
    run: async (a, dp) => await dp.get(`/calls/${enc(a.call_id)}/assigned_operators`),
  },
  {
    name: 'add_call_labels',
    description: 'Attach one or more labels/tags to a call. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: {
        call_id: S.str('Dialpad call id.'),
        labels: S.arr('Labels to set on the call.'),
      },
      required: ['call_id', 'labels'],
    },
    run: async (a, dp) => await dp.post(`/calls/${enc(a.call_id)}/labels`, { labels: a.labels }),
  },
  {
    name: 'hangup_call',
    description: 'Hang up (end) a live call by call id. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: { call_id: S.str('Dialpad call id.') },
      required: ['call_id'],
    },
    run: async (a, dp) => await dp.post(`/calls/${enc(a.call_id)}/actions/hangup`, {}),
  },
  {
    name: 'create_call_review_sharelink',
    description: 'Create a shareable review link for a recorded call. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: {
        call_id: S.str('Dialpad call id.'),
        privacy: S.str('Link visibility: public | company (default company).'),
      },
      required: ['call_id'],
    },
    run: async (a, dp) =>
      await dp.post(`/calls/${enc(a.call_id)}/review_sharelink`, { privacy: a.privacy || 'company' }),
  },

  // ------------------------------------------------------------- CONTACTS ---
  {
    name: 'list_contacts',
    description: 'List contacts in the Dialpad company address book. Optionally restrict to one owner.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: limit(25),
        owner_id: S.str('Restrict to contacts owned by this user id.'),
      },
    },
    run: async (a, dp) => page(await dp.get('/contacts', { limit: a.limit || 25, owner_id: a.owner_id }), asContact),
  },
  {
    name: 'get_contact',
    description: 'Get one contact by contact id.',
    inputSchema: {
      type: 'object',
      properties: { contact_id: S.str('Dialpad contact id.') },
      required: ['contact_id'],
    },
    run: async (a, dp) => asContact(await dp.get(`/contacts/${enc(a.contact_id)}`)),
  },
  {
    name: 'create_contact',
    description: 'Create a shared/company contact. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: {
        first_name: S.str('Given name.'),
        last_name: S.str('Family name.'),
        emails: S.arr('Email addresses.'),
        phones: S.arr('Phone numbers in E.164.'),
        company_name: S.str('Company / organisation name.'),
        job_title: S.str('Job title.'),
        owner_id: S.str('Optional owning user id (omit for a shared company contact).'),
      },
      required: ['first_name', 'last_name'],
    },
    run: async (a, dp) =>
      asContact(
        await dp.post('/contacts', {
          first_name: a.first_name,
          last_name: a.last_name,
          emails: a.emails,
          phones: a.phones,
          company_name: a.company_name,
          job_title: a.job_title,
          ...(a.owner_id ? { owner_id: a.owner_id } : {}),
        }),
      ),
  },
  {
    name: 'update_contact',
    description: 'Update fields on an existing contact. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: {
        contact_id: S.str('Dialpad contact id.'),
        first_name: S.str('Given name.'),
        last_name: S.str('Family name.'),
        emails: S.arr('Email addresses (replaces existing).'),
        phones: S.arr('Phone numbers in E.164 (replaces existing).'),
        company_name: S.str('Company / organisation name.'),
        job_title: S.str('Job title.'),
      },
      required: ['contact_id'],
    },
    run: async (a, dp) => {
      const { contact_id, ...patch } = a;
      return asContact(await dp.patch(`/contacts/${enc(contact_id)}`, patch));
    },
  },
  {
    name: 'delete_contact',
    description: 'Delete a contact by id. WRITE / destructive — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: { contact_id: S.str('Dialpad contact id.') },
      required: ['contact_id'],
    },
    run: async (a, dp) => await dp.del(`/contacts/${enc(a.contact_id)}`),
  },

  // ---------------------------------------------------------- DEPARTMENTS ---
  {
    name: 'list_departments',
    description: 'List the departments (groups) in the Dialpad company.',
    inputSchema: { type: 'object', properties: { limit: limit(50) } },
    run: async (a, dp) => page(await dp.get('/departments', { limit: a.limit || 50 }), asGroup),
  },
  {
    name: 'get_department',
    description: 'Get one department by id.',
    inputSchema: {
      type: 'object',
      properties: { department_id: S.str('Dialpad department id.') },
      required: ['department_id'],
    },
    run: async (a, dp) => asGroup(await dp.get(`/departments/${enc(a.department_id)}`)),
  },
  {
    name: 'list_department_operators',
    description: 'List the operators (agents) assigned to a department.',
    inputSchema: {
      type: 'object',
      properties: { department_id: S.str('Dialpad department id.') },
      required: ['department_id'],
    },
    run: async (a, dp) => page(await dp.get(`/departments/${enc(a.department_id)}/operators`)),
  },

  // -------------------------------------------------------------- OFFICES ---
  {
    name: 'list_offices',
    description: 'List the offices in the Dialpad company.',
    inputSchema: { type: 'object', properties: { limit: limit(50) } },
    run: async (a, dp) => page(await dp.get('/offices', { limit: a.limit || 50 }), asOffice),
  },
  {
    name: 'get_office',
    description: 'Get one office by id.',
    inputSchema: {
      type: 'object',
      properties: { office_id: S.str('Dialpad office id.') },
      required: ['office_id'],
    },
    run: async (a, dp) => asOffice(await dp.get(`/offices/${enc(a.office_id)}`)),
  },
  {
    name: 'get_office_plan',
    description: 'Get the billing plan (licenses purchased / used) for an office.',
    inputSchema: {
      type: 'object',
      properties: { office_id: S.str('Dialpad office id.') },
      required: ['office_id'],
    },
    run: async (a, dp) => await dp.get(`/offices/${enc(a.office_id)}/plan`),
  },
  {
    name: 'list_office_operators',
    description: 'List the mainline operators for an office.',
    inputSchema: {
      type: 'object',
      properties: { office_id: S.str('Dialpad office id.') },
      required: ['office_id'],
    },
    run: async (a, dp) => page(await dp.get(`/offices/${enc(a.office_id)}/operators`)),
  },

  // --------------------------------------------------------- CALL CENTERS ---
  {
    name: 'list_call_centers',
    description: 'List the call centers (support queues) in the company.',
    inputSchema: {
      type: 'object',
      properties: { office_id: S.str('Optional office id to filter by.'), limit: limit(50) },
    },
    run: async (a, dp) => page(await dp.get('/call_centers', { office_id: a.office_id, limit: a.limit || 50 }), asGroup),
  },
  {
    name: 'get_call_center',
    description: 'Get one call center by id.',
    inputSchema: {
      type: 'object',
      properties: { call_center_id: S.str('Dialpad call center id.') },
      required: ['call_center_id'],
    },
    run: async (a, dp) => asGroup(await dp.get(`/call_centers/${enc(a.call_center_id)}`)),
  },
  {
    name: 'get_call_center_status',
    description: 'Get the live operational status of a call center (queue depth, on-duty agents, wait times).',
    inputSchema: {
      type: 'object',
      properties: { call_center_id: S.str('Dialpad call center id.') },
      required: ['call_center_id'],
    },
    run: async (a, dp) => await dp.get(`/call_centers/${enc(a.call_center_id)}/status`),
  },
  {
    name: 'list_call_center_operators',
    description: 'List the operators (agents) staffed on a call center.',
    inputSchema: {
      type: 'object',
      properties: { call_center_id: S.str('Dialpad call center id.') },
      required: ['call_center_id'],
    },
    run: async (a, dp) => page(await dp.get(`/call_centers/${enc(a.call_center_id)}/operators`)),
  },
  {
    name: 'set_operator_duty_status',
    description: "Set a call-center agent's on/off-duty status. WRITE — gate with approval in Eesa RBAC.",
    inputSchema: {
      type: 'object',
      properties: {
        call_center_id: S.str('Dialpad call center id.'),
        user_id: S.str('Operator (user) id.'),
        on_duty: S.bool('true to put the agent on duty, false for off duty.'),
        duty_status_reason: S.str('Optional reason label when going off duty.'),
      },
      required: ['call_center_id', 'user_id', 'on_duty'],
    },
    run: async (a, dp) =>
      await dp.patch(`/call_centers/${enc(a.call_center_id)}/operators/${enc(a.user_id)}/duty_status`, {
        on_duty: a.on_duty,
        ...(a.duty_status_reason ? { duty_status_reason: a.duty_status_reason } : {}),
      }),
  },
  {
    name: 'list_callbacks',
    description: 'List queued callbacks for a call center.',
    inputSchema: {
      type: 'object',
      properties: { call_center_id: S.str('Dialpad call center id.'), limit: limit(50) },
      required: ['call_center_id'],
    },
    run: async (a, dp) => page(await dp.get(`/call_centers/${enc(a.call_center_id)}/callbacks`, { limit: a.limit || 50 })),
  },
  {
    name: 'enqueue_callback',
    description: 'Request a callback: add a phone number to a call center callback queue. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: {
        call_center_id: S.str('Dialpad call center id.'),
        phone_number: S.str('Number to call back, E.164.'),
      },
      required: ['call_center_id', 'phone_number'],
    },
    run: async (a, dp) =>
      await dp.post(`/call_centers/${enc(a.call_center_id)}/callbacks`, { phone_number: a.phone_number }),
  },

  // -------------------------------------------------------- COACHING TEAMS ---
  {
    name: 'list_coaching_teams',
    description: 'List coaching teams (supervisor ↔ agent groupings).',
    inputSchema: { type: 'object', properties: { limit: limit(50) } },
    run: async (a, dp) => page(await dp.get('/coaching_teams', { limit: a.limit || 50 })),
  },
  {
    name: 'get_coaching_team',
    description: 'Get one coaching team by id.',
    inputSchema: {
      type: 'object',
      properties: { coaching_team_id: S.str('Dialpad coaching team id.') },
      required: ['coaching_team_id'],
    },
    run: async (a, dp) => await dp.get(`/coaching_teams/${enc(a.coaching_team_id)}`),
  },
  {
    name: 'list_coaching_team_members',
    description: 'List the members of a coaching team.',
    inputSchema: {
      type: 'object',
      properties: { coaching_team_id: S.str('Dialpad coaching team id.') },
      required: ['coaching_team_id'],
    },
    run: async (a, dp) => page(await dp.get(`/coaching_teams/${enc(a.coaching_team_id)}/members`)),
  },

  // -------------------------------------------------------- PHONE NUMBERS ---
  {
    name: 'list_phone_numbers',
    description: 'List the phone numbers provisioned in the Dialpad company (with assignment targets).',
    inputSchema: {
      type: 'object',
      properties: { status: S.str('Optional status filter, e.g. available | pending | assigned.'), limit: limit(50) },
    },
    run: async (a, dp) => page(await dp.get('/numbers', { status: a.status, limit: a.limit || 50 }), asNumber),
  },
  {
    name: 'get_phone_number',
    description: 'Get details for a specific phone number (assignment, office, status).',
    inputSchema: {
      type: 'object',
      properties: { number: S.str('Phone number in E.164 (e.g. +14155551234).') },
      required: ['number'],
    },
    run: async (a, dp) => await dp.get(`/numbers/${enc(a.number)}`),
  },
  {
    name: 'format_phone_number',
    description: 'Normalise / validate a phone number into E.164 and local formats for a country.',
    inputSchema: {
      type: 'object',
      properties: {
        number: S.str('Raw phone number to format.'),
        country_code: S.str('ISO country code hint, e.g. US.'),
      },
      required: ['number'],
    },
    run: async (a, dp) =>
      await dp.post('/phone/format', {
        number: a.number,
        ...(a.country_code ? { country_code: a.country_code } : {}),
      }),
  },

  // ---------------------------------------------------- ROOMS / CHANNELS ----
  {
    name: 'list_rooms',
    description: 'List Dialpad rooms (shared spaces / desk-phone rooms) in an office.',
    inputSchema: {
      type: 'object',
      properties: { office_id: S.str('Optional office id to filter by.'), limit: limit(50) },
    },
    run: async (a, dp) => page(await dp.get('/rooms', { office_id: a.office_id, limit: a.limit || 50 })),
  },
  {
    name: 'list_channels',
    description: 'List messaging channels in the company.',
    inputSchema: {
      type: 'object',
      properties: { state: S.str('Optional state filter, e.g. active | archived.'), limit: limit(50) },
    },
    run: async (a, dp) => page(await dp.get('/channels', { state: a.state, limit: a.limit || 50 })),
  },

  // ------------------------------------------- BLOCKED NUMBERS / DISPOS -----
  {
    name: 'list_blocked_numbers',
    description: 'List numbers blocked company-wide from calling/texting in.',
    inputSchema: { type: 'object', properties: { limit: limit(50) } },
    run: async (a, dp) => page(await dp.get('/blocked_numbers', { limit: a.limit || 50 })),
  },
  {
    name: 'block_number',
    description: 'Block one or more inbound numbers company-wide. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: { numbers: S.arr('Numbers to block, E.164.') },
      required: ['numbers'],
    },
    run: async (a, dp) => await dp.post('/blocked_numbers/add', { numbers: a.numbers }),
  },
  {
    name: 'unblock_number',
    description: 'Remove one or more numbers from the company block list. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: { numbers: S.arr('Numbers to unblock, E.164.') },
      required: ['numbers'],
    },
    run: async (a, dp) => await dp.post('/blocked_numbers/remove', { numbers: a.numbers }),
  },
  {
    name: 'list_dispositions',
    description: 'List call dispositions (outcome codes) configured for the company.',
    inputSchema: {
      type: 'object',
      properties: { target_id: S.str('Optional target id to scope dispositions to.'), limit: limit(50) },
    },
    run: async (a, dp) => page(await dp.get('/dispositions', { target_id: a.target_id, limit: a.limit || 50 })),
  },

  // ------------------------------------------------- COMPANY / MEETINGS -----
  {
    name: 'get_company',
    description: 'Get the Dialpad company profile (name, plan, admin, domains).',
    inputSchema: { type: 'object', properties: {} },
    run: async (a, dp) => await dp.get('/company'),
  },
  {
    name: 'list_sms_opt_outs',
    description: 'List numbers that have opted out of SMS from the company (compliance / do-not-text list).',
    inputSchema: {
      type: 'object',
      properties: { a2p_campaign_id: S.str('Optional A2P campaign id to scope by.'), limit: limit(50) },
    },
    run: async (a, dp) => page(await dp.get('/company/sms_opt_out', { a2p_campaign_id: a.a2p_campaign_id, limit: a.limit || 50 })),
  },
  {
    name: 'list_meetings',
    description: 'List Dialpad Meetings.',
    inputSchema: { type: 'object', properties: { limit: limit(25) } },
    run: async (a, dp) => page(await dp.get('/meetings', { limit: a.limit || 25 })),
  },

  // ---------------------------------------------------- SCHEDULED MESSAGES --
  {
    name: 'list_scheduled_messages',
    description: 'List SMS messages scheduled to send in the future.',
    inputSchema: { type: 'object', properties: { limit: limit(25) } },
    run: async (a, dp) => page(await dp.get('/schedules', { limit: a.limit || 25 })),
  },

  // ----------------------------------------------------- SMS / MESSAGING ----
  {
    name: 'send_sms',
    description: 'Send an SMS text message from a Dialpad user to one or more numbers. WRITE — gate with approval in Eesa RBAC.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: S.str('Dialpad user id the SMS is sent from.'),
        to_numbers: S.arr('Recipient numbers in E.164 (e.g. +14155551234).'),
        text: S.str('Message body.'),
        from_number: S.str('Optional specific sending number owned by the user.'),
      },
      required: ['user_id', 'to_numbers', 'text'],
    },
    run: async (a, dp) =>
      await dp.post('/sms/send', {
        user_id: a.user_id,
        to_numbers: a.to_numbers,
        text: a.text,
        ...(a.from_number ? { from_number: a.from_number } : {}),
      }),
  },

  // --------------------------------------------------- STATS / ANALYTICS ----
  {
    name: 'request_call_stats',
    description:
      'Kick off an async analytics export (call/text volume, durations, etc.) over a day range. Returns a request_id — then poll get_stats_result until it is ready.',
    inputSchema: {
      type: 'object',
      properties: {
        stat_type: S.str('What to measure: calls | texts | voicemails | recordings | csat | dispositions (default calls).'),
        days_ago_start: S.int('Start of the window, in days ago (e.g. 7).'),
        days_ago_end: S.int('End of the window, in days ago (0 = today).'),
        target_id: S.str('Optional user/office/department/call-center id to scope to.'),
        target_type: S.str('Type of target_id: user | office | department | callcenter.'),
        timezone: S.str('IANA timezone for bucketing, e.g. America/Los_Angeles.'),
        group_by: S.str('Optional grouping dimension, e.g. user | office | department.'),
        export_type: S.str('stats (aggregated) or records (row-level). Default stats.'),
      },
    },
    run: async (a, dp) =>
      await dp.post('/stats', {
        stat_type: a.stat_type || 'calls',
        days_ago_start: a.days_ago_start,
        days_ago_end: a.days_ago_end,
        target_id: a.target_id,
        target_type: a.target_type,
        timezone: a.timezone,
        group_by: a.group_by,
        export_type: a.export_type || 'stats',
      }),
  },
  {
    name: 'get_stats_result',
    description: 'Fetch the result of a previously requested analytics export by its request_id (from request_call_stats).',
    inputSchema: {
      type: 'object',
      properties: { request_id: S.str('The request_id returned by request_call_stats.') },
      required: ['request_id'],
    },
    run: async (a, dp) => await dp.get(`/stats/${enc(a.request_id)}`),
  },
  {
    name: 'list_scorecards',
    description: 'List QA scorecards configured for the company (agent call scoring rubrics).',
    inputSchema: { type: 'object', properties: { limit: limit(25) } },
    run: async (a, dp) => page(await dp.get('/scorecards', { limit: a.limit || 25 })),
  },
  {
    name: 'get_wfm_agent_metrics',
    description: 'Get workforce-management agent metrics (adherence, occupancy, productivity) over a day range.',
    inputSchema: {
      type: 'object',
      properties: {
        days_ago_start: S.int('Start of the window, in days ago.'),
        days_ago_end: S.int('End of the window, in days ago (0 = today).'),
        office_id: S.str('Optional office id to scope to.'),
        timezone: S.str('IANA timezone, e.g. America/Los_Angeles.'),
      },
    },
    run: async (a, dp) =>
      await dp.get('/wfm/metrics/agent', {
        days_ago_start: a.days_ago_start,
        days_ago_end: a.days_ago_end,
        office_id: a.office_id,
        timezone: a.timezone,
      }),
  },
];

const BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));
const LISTED = TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));

export const TOOL_NAMES = TOOLS.map((t) => t.name);

export async function handleRpc(body, tenant, serverInfo) {
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
      // Build the client from the CALLING tenant's own Dialpad key. Throws
      // NO_CREDENTIALS (surfaced as isError) if the tenant hasn't connected.
      const dp = dialpadClient({ apiKey: tenant?.creds?.api_key, apiBase: tenant?.creds?.api_base });
      const result = await tool.run(params.arguments || {}, dp);
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
