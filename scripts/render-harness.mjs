#!/usr/bin/env node
/**
 * Offline render harness for public/app.html.
 *
 *   node scripts/render-harness.mjs
 *
 * There is no build step and no test framework here on purpose, but the detail
 * view has enough real logic — duration units, transcript grouping, "never draw
 * an empty card" — that it needs to be checkable without a browser, a Dialpad
 * key or a deploy. This loads the actual page, shims just enough DOM to run its
 * IIFE, and renders the detail pane for a set of fixtures.
 *
 * The fixtures below are SYNTHETIC (invented names and numbers) but their SHAPES
 * are copied exactly from live Dialpad API responses, including the details that
 * caused real bugs:
 *
 *   * `duration` / `total_duration` are millisecond FLOATS, not seconds.
 *   * transcript `time` is an ISO-8601 string in a naive local timezone, not an
 *     offset in seconds.
 *   * AI "moments" are interleaved into `lines` with type:"moment", and their
 *     `content` is only the moment's type name, never any dialogue.
 *   * a single conversation shows up as two legs, one carrying `recording_url`
 *     (API-fetchable) and the other `admin_recording_urls` (session-only).
 *
 * Exits non-zero if an assertion fails.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = join(__dirname, '..', 'public', 'app.html');

// ── load the page's script ───────────────────────────────────────────────────
const html = readFileSync(APP, 'utf8');
const src = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const body = src
  .slice(src.indexOf('(function () {') + '(function () {'.length, src.lastIndexOf('})();'))
  .replace(/^\s*'use strict';/, '');

const store = {};
const node = (sel) => (store[sel] ||= {
  _html: '', value: '',
  set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
  set textContent(v) {}, get textContent() { return ''; },
  addEventListener() {}, setAttribute() {}, getAttribute() { return null; },
  querySelector() { return null; }, querySelectorAll() { return []; },
});
const document = {
  querySelector: node,
  querySelectorAll: () => [],
  createElement: () => ({ addEventListener() {}, appendChild() {}, style: {} }),
  documentElement: { setAttribute() {} },
  addEventListener() {},
};
const app = new Function(
  'document', 'window', 'parent', 'setTimeout', 'fetch', 'console',
  '"use strict";' + body + '\nreturn __exports;'
)(document, { addEventListener() {}, location: { origin: 'https://plugin.example' } },
  { postMessage() {} }, () => 0, async () => { throw new Error('offline'); }, console);

// ── fixtures (synthetic values, real shapes) ─────────────────────────────────
const LINES = [
  { content: 'Hey, this is your name please?', name: 'Alex Rivera', time: '2026-08-06T01:24:16.738447', type: 'transcript', user_id: '4531909860376576' },
  { content: 'ai_csat_reboot_ineligible', name: 'Alex Rivera', time: '2026-08-06T01:24:16.738447', type: 'moment', user_id: '4531909860376576' },
  { content: 'call_purpose_category', name: 'Alex Rivera', time: '2026-08-06T01:24:16.738447', type: 'moment', user_id: '4531909860376576' },
  { content: 'whole_call_summary', name: 'Alex Rivera', time: '2026-08-06T01:24:16.738447', type: 'moment', user_id: '4531909860376576' },
  { contact_id: 'ZmFrZS1jb250YWN0', content: 'Hi, I was calling about my order delivery.', name: 'Jordan Lee', time: '2026-08-06T01:24:19.535747', type: 'transcript' },
  { contact_id: 'ZmFrZS1jb250YWN0', content: 'call_purpose', name: 'Jordan Lee', time: '2026-08-06T01:24:19.535747', type: 'moment' },
  { contact_id: 'ZmFrZS1jb250YWN0', content: 'Hello.', name: 'Jordan Lee', time: '2026-08-06T01:25:33.335747', type: 'transcript' },
];

const FIXTURES = [
  {
    label: 'connected call, API-fetchable recording',
    row: { call_id: '1000000000000001', direction: 'inbound', was_recorded: true },
    detail: {
      call_id: '1000000000000001', direction: 'inbound', state: 'hangup', was_recorded: true,
      duration: 119961.031, total_duration: 132179.636,
      date_started: '1785979436005', date_connected: '1785979448224', date_ended: '1785979568185',
      external_number: '+15550100001', contact: { name: 'Jordan Lee' },
      target: { name: 'Support Queue', type: 'department' },
      recording_url: ['https://dialpad.com/r/1111111111111111'],
      recording_details: [{ id: '1111111111111111', recording_type: 'callrecording', url: 'https://dialpad.com/r/1111111111111111' }],
    },
    transcript: { lines: LINES },
    expect: { cards: ['Call', 'Recording', 'Transcript'], player: true, talk: '2m 0s', groups: 3 },
  },
  {
    label: 'other leg of the same conversation — admin recording only',
    row: { call_id: '1000000000000002', direction: 'inbound', was_recorded: false },
    detail: {
      call_id: '1000000000000002', direction: 'inbound', state: 'hangup', was_recorded: false,
      duration: 120318.045, total_duration: 131536.811,
      date_started: '1785979437171', date_connected: '1785979448390', date_ended: '1785979568708',
      external_number: '+15550100001', contact: { name: 'Jordan Lee' },
      target: { name: 'Alex Rivera', type: 'user' },
      admin_recording_urls: ['https://dialpad.com/blob/adminrecording/2222222222222222.mp3'],
    },
    transcript: { lines: LINES },
    expect: { cards: ['Call', 'Recording', 'Transcript'], player: false, talk: '2m 0s', groups: 3 },
  },
  {
    label: 'call that never connected, no recording, no transcript',
    row: { call_id: '1000000000000003', direction: 'inbound', was_recorded: false },
    detail: {
      call_id: '1000000000000003', direction: 'inbound', state: 'hangup', was_recorded: false,
      duration: 0.0, total_duration: 13550.743,
      date_started: '1785994068112', date_ended: '1785994081662',
      external_number: '+15550100002', contact: { name: 'Sam Chen' },
      target: { name: 'Front Desk', type: 'department' },
    },
    transcript: { call_id: '1000000000000003' },
    expect: { cards: ['Call', 'Recording', 'Transcript'], player: false, talk: 'not answered', groups: 0 },
  },
];

// ── run ──────────────────────────────────────────────────────────────────────
const ok = (v) => ({ status: 'fulfilled', value: v });
const rejected = (m) => ({ status: 'rejected', reason: { message: m } });

let failures = 0;
const check = (label, cond, detail) => {
  console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? '  — ' + detail : ''));
  if (!cond) failures++;
};

console.log('duration formatting (Dialpad returns MILLISECONDS)');
check('119961.031ms -> 2m 0s', app.fmtDur(119961.031) === '2m 0s', app.fmtDur(119961.031));
check('13550.743ms -> 14s', app.fmtDur(13550.743) === '14s', app.fmtDur(13550.743));
check('7200000ms -> 2h 0m', app.fmtDur(7200000) === '2h 0m', app.fmtDur(7200000));

for (const f of FIXTURES) {
  console.log('\n' + f.label);
  // AI recap 404s on accounts without the feature; that must render nothing.
  app.renderDetail(f.row.call_id, f.row, ok(f.transcript),
    rejected('Dialpad API 404: not found'), ok(f.detail));
  const out = node('#detailBody').innerHTML;

  const cards = [...out.matchAll(/<div class="card"><h3>([^<]*)<\/h3>/g)].map((m) => m[1]);
  check('cards = ' + JSON.stringify(f.expect.cards), JSON.stringify(cards) === JSON.stringify(f.expect.cards),
    JSON.stringify(cards));

  // no card may be a bare header
  for (let i = 0; i < cards.length; i++) {
    const s = out.indexOf('<h3>' + cards[i] + '</h3>');
    const e = i + 1 < cards.length ? out.indexOf('<h3>' + cards[i + 1] + '</h3>') : out.length;
    const text = out.slice(s, e).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').replace(cards[i], '').trim();
    check('"' + cards[i] + '" card has content', text.length > 0);
  }

  check('AI recap card absent when the tool 404s', !cards.includes('AI recap'));
  check('talk time = ' + f.expect.talk, out.includes(f.expect.talk));
  check('inline player ' + (f.expect.player ? 'present' : 'absent'),
    out.includes('id="recPlay"') === f.expect.player);

  const groups = [...out.matchAll(/<div class="grp (agent|customer)">/g)].length;
  check('transcript groups = ' + f.expect.groups, groups === f.expect.groups, String(groups));

  // The whole point of the transcript fix: AI moments are NOT dialogue.
  for (const noise of ['whole call summary', 'call purpose category', 'ai csat reboot ineligible']) {
    const inParagraph = new RegExp('<p>[^<]*' + noise.replace(/ /g, '[ _]') + '[^<]*</p>', 'i').test(out);
    check('"' + noise + '" is not spoken text', !inParagraph);
  }
  if (f.expect.groups) {
    check('AI moments kept as footnote chips', /class="tags"/.test(out) && /class="chip"/.test(out));
    check('real transcript offsets, not 0:00 everywhere',
      (out.match(/class="at">0:00</g) || []).length <= 1 && /class="at">1:1\d</.test(out));
  }
}

console.log('\n' + (failures ? failures + ' FAILURE(S)' : 'all checks passed'));
process.exit(failures ? 1 : 0);
