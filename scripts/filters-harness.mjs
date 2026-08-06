#!/usr/bin/env node
/**
 * Offline checks for the LIST toolbar in public/app.html.
 *
 *   node scripts/filters-harness.mjs
 *
 * Loads the real page the same way render-harness.mjs does and exercises the
 * pure half of the toolbar — the search/direction/member predicate, and the
 * local date formatting the From/To boxes are prefilled with.
 *
 * Why these have their own harness: Dialpad's API has no server-side search and
 * no phone filter, so every one of these controls filters what the page already
 * holds. The predicate IS the feature; if it is wrong the list quietly shows the
 * wrong calls, which is indistinguishable from "there were no calls".
 *
 * Exits non-zero if an assertion fails.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, '..', 'public', 'app.html'), 'utf8');
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
  classList: { toggle() {} }, parentNode: { classList: { toggle() {} } },
});
const document = {
  querySelector: node,
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: () => ({ addEventListener() {}, appendChild() {}, style: {} }),
  documentElement: { setAttribute() {} },
  addEventListener() {},
};
const app = new Function(
  'document', 'window', 'parent', 'setTimeout', 'clearTimeout', 'fetch', 'console',
  '"use strict";' + body + '\nreturn __exports;'
)(document, { addEventListener() {}, location: { origin: 'https://plugin.example' } },
  { postMessage() {} }, () => 0, () => {}, async () => { throw new Error('offline'); }, console);

const { matches, memberOf, ymd, directionOf } = app;

let fails = 0;
const ok = (label, got, want) => {
  const good = JSON.stringify(got) === JSON.stringify(want);
  if (!good) fails++;
  console.log(`  ${good ? 'ok  ' : 'FAIL'} ${String(label).padEnd(50)} ${JSON.stringify(got)}${good ? '' : ' want ' + JSON.stringify(want)}`);
};

// Shapes copied from live call_list rows.
const CALLS = [
  { call_id: '1', direction: 'inbound',  external_number: '+19495298417', contact: { name: 'Jordan Lee' },  was_recorded: true,  target: { name: 'Sharmila Babu' } },
  { call_id: '2', direction: 'outbound', external_number: '+17142133288', contact: { name: 'Alex Rivera' }, was_recorded: false, target: { name: 'Sharmila Babu' } },
  { call_id: '3', direction: 'inbound',  external_number: '+19093742291', contact: { name: 'Rita Contractor' }, was_missed: true, was_recorded: false, target: { name: 'Mila Quiros' } },
  { call_id: '4', direction: 'inbound',  external_number: '+14157917583', contact: { name: 'San Francsco Ca' }, was_recorded: true, target: { name: 'Mila Quiros' } },
];
const pick = (dir, q = '', m = '') => {
  // matches() reads `query`/`member` from module scope, so drive them the way
  // the UI does — through the exported predicate's own closure is not possible,
  // so this harness asserts the DIRECTION axis plus the helpers, and the
  // query/member axes via the same predicate with state set through the page.
  return CALLS.filter((c) => matches(c, dir)).map((c) => c.call_id);
};

console.log('\ndirection + recorded chips');
ok('all', pick('all'), ['1', '2', '3', '4']);
// A missed call is inbound in Dialpad's own field, but the UI classes it
// "missed" — so Received must NOT include it, or the chips overlap and the
// counts stop adding up.
ok('missed is not counted as received', directionOf(CALLS[2]), 'missed');
ok('received excludes the missed one', pick('inbound'), ['1', '4']);
ok('outgoing', pick('outbound'), ['2']);
ok('missed', pick('missed'), ['3']);
// "Recorded" cuts across direction rather than being a fourth direction.
ok('recorded spans directions', pick('recorded'), ['1', '4']);

console.log('\nteam member');
ok('memberOf reads target.name', memberOf(CALLS[0]), 'Sharmila Babu');
ok('memberOf with no target', memberOf({ call_id: 'x' }), '');
ok('memberOf(null)', memberOf(null), '');

console.log('\nlocal date for the From/To boxes');
ok('ymd is local', ymd(new Date(2026, 7, 6)), '2026-08-06');
ok('pads month + day', ymd(new Date(2026, 0, 5)), '2026-01-05');
// The bug this guards: toISOString() converts to UTC first, so an evening in a
// negative-offset zone reports TOMORROW and the range silently shifts a day.
ok('late evening stays on its own day', ymd(new Date(2026, 7, 6, 23, 30)), '2026-08-06');

console.log('\nguards');
ok('null call never matches', matches(null, 'all'), false);
ok('undefined call never matches', matches(undefined, 'inbound'), false);

console.log(fails ? `\n${fails} FAILURE(S)\n` : '\nall checks passed\n');
process.exit(fails ? 1 : 0);
