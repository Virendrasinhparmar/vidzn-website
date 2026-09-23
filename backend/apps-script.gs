/**
 * VIDZN — Lead backend (Google Apps Script)
 *
 * What it does
 *  - Receives enquiries from the website forms (home contact + services page).
 *  - Stores each one as a formatted row in the "Leads" sheet, with an ID, priority and status.
 *  - Emails you a clean lead summary, and (optionally) sends the client a branded auto-reply.
 *  - Powers the private lead dashboard (vidzn-leads.html): list leads, update status and notes.
 *
 * Setup: see backend/SETUP.md. Short version:
 *  1. Paste this file into Extensions → Apps Script of a new Google Sheet.
 *  2. Edit CONFIG below (especially ADMIN_KEY and NOTIFY_EMAIL).
 *  3. Run `setup` once, approve permissions.
 *  4. Deploy → New deployment → Web app → Execute as: Me, Access: Anyone. Copy the /exec URL.
 */

const CONFIG = {
  STUDIO_NAME: 'VIDZN',
  SHEET_NAME: 'Leads',
  NOTIFY_EMAIL: 'you@example.com',              // where new-lead alerts go (comma-separate for several)
  ADMIN_KEY: 'CHANGE-ME-to-a-long-random-phrase', // the password the dashboard uses — make it long
  SEND_AUTO_REPLY: true,                          // email the client a confirmation
  REPLY_WITHIN: 'one business day',               // used in the auto-reply copy
  ACCENT: '#b7ff3c',
};

const COLUMNS = [
  'Lead ID', 'Received', 'Status', 'Priority', 'Name', 'Email', 'Phone', 'Company', 'Website',
  'Package', 'Services', 'Budget', 'Timeline', 'Message', 'Source', 'Notes', 'Updated',
];
const KEYS = [
  'id', 'received', 'status', 'priority', 'name', 'email', 'phone', 'company', 'website',
  'package', 'services', 'budget', 'timeline', 'message', 'source', 'notes', 'updated',
];
const STATUSES = ['New', 'Contacted', 'Proposal', 'Won', 'Lost'];
// Must match the option labels in the website form (vidzn-services-inner-page.html).
const BUDGET_SCORE = { 'Under ₹1L': 0, '₹1L - ₹3L': 1, '₹3L - ₹7L': 2, '₹7L+': 3 };
const TIMELINE_SCORE = { 'ASAP': 2, 'Within a month': 2, '1-3 months': 1, 'Just exploring': 0 };
const STATUS_COLORS = { New: '#e8ffd0', Contacted: '#dbeafe', Proposal: '#fef3c7', Won: '#bbf7d0', Lost: '#f3f4f6' };

/* ------------------------------------------------------------------ entry points */

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) || '';
    // Dashboard calls send a JSON body with an `action`; website forms send url-encoded fields.
    if (raw.trim().charAt(0) === '{') return handleAdmin_(JSON.parse(raw));
    return handleLead_(e);
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Server error' });
  }
}

function doGet() {
  return json_({ ok: true, service: CONFIG.STUDIO_NAME + ' leads', time: new Date().toISOString() });
}

/* ------------------------------------------------------------------ website enquiries */

function handleLead_(e) {
  const p = (e && e.parameter) || {};
  const multi = (e && e.parameters) || {};

  // Honeypot: real people never see or fill this field.
  if (p._gotcha) return json_({ ok: true });

  const lead = {
    name: clean_(p.name, 120),
    email: clean_(p.email, 160).toLowerCase(),
    phone: clean_(p.phone, 40),
    company: clean_(p.company, 160),
    website: clean_(p.website, 200),
    package: clean_(p.package, 40),
    services: (multi.services || (p.services ? [p.services] : [])).map(s => clean_(s, 60)).join(', '),
    budget: clean_(p.budget, 60),
    timeline: clean_(p.timeline, 60),
    message: clean_(p.message, 5000),
    source: clean_(p.source, 60) || 'website',
  };

  if (!lead.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return json_({ ok: false, error: 'Please add your name and a valid email.' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let id;
  try {
    const sheet = sheet_();
    id = nextId_(sheet);
    const now = new Date();
    lead.id = id;
    lead.received = now;
    lead.status = 'New';
    lead.priority = priority_(lead);
    lead.notes = '';
    lead.updated = now;
    sheet.appendRow(KEYS.map(k => sheetSafe_(lead[k])));
    styleRow_(sheet, sheet.getLastRow());
  } finally {
    lock.releaseLock();
  }

  try { notify_(lead); } catch (err) { console.error('notify failed', err); }
  if (CONFIG.SEND_AUTO_REPLY) {
    try { autoReply_(lead); } catch (err) { console.error('auto-reply failed', err); }
  }
  return json_({ ok: true, id: id });
}

/** Rough lead temperature from budget + timeline, so the hottest leads surface first. */
function priority_(lead) {
  let score = (BUDGET_SCORE[lead.budget] || 0) + (TIMELINE_SCORE[lead.timeline] || 0);
  if (lead.package === 'SCALE' || lead.package === 'PARTNER') score += 1;
  if (lead.message.length > 180) score += 1;
  return score >= 4 ? 'Hot' : score >= 2 ? 'Warm' : 'Cold';
}

/* ------------------------------------------------------------------ dashboard API */

function handleAdmin_(body) {
  if (!safeEqual_(String(body.key || ''), CONFIG.ADMIN_KEY) || CONFIG.ADMIN_KEY.indexOf('CHANGE-ME') === 0) {
    return json_({ ok: false, error: 'Unauthorized' });
  }
  const sheet = sheet_();

  if (body.action === 'list') {
    const values = sheet.getDataRange().getValues().slice(1);
    const leads = values.filter(r => r[0]).map(r => {
      const o = {};
      KEYS.forEach((k, i) => { o[k] = r[i] instanceof Date ? r[i].toISOString() : r[i]; });
      return o;
    }).reverse();
    return json_({ ok: true, leads: leads, statuses: STATUSES });
  }

  if (body.action === 'update') {
    const row = findRow_(sheet, body.id);
    if (!row) return json_({ ok: false, error: 'Lead not found' });
    if (body.status !== undefined) {
      if (STATUSES.indexOf(body.status) === -1) return json_({ ok: false, error: 'Bad status' });
      sheet.getRange(row, KEYS.indexOf('status') + 1).setValue(body.status);
    }
    if (body.notes !== undefined) sheet.getRange(row, KEYS.indexOf('notes') + 1).setValue(sheetSafe_(clean_(body.notes, 5000)));
    sheet.getRange(row, KEYS.indexOf('updated') + 1).setValue(new Date());
    styleRow_(sheet, row);
    return json_({ ok: true });
  }

  return json_({ ok: false, error: 'Unknown action' });
}

/* ------------------------------------------------------------------ sheet helpers */

/** Run once from the editor: creates and formats the Leads sheet and triggers the permission prompt. */
function setup() {
  sheet_();
  MailApp.getRemainingDailyQuota();
  Logger.log('Ready. Now deploy as a Web app.');
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (sheet) return sheet;

  sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#090909')
    .setFontFamily('Roboto Mono').setFontSize(9);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  sheet.setRowHeight(1, 34);
  const widths = { 'Lead ID': 110, Received: 140, Status: 100, Priority: 80, Name: 150, Email: 210, Message: 380, Notes: 260, Services: 220 };
  COLUMNS.forEach((c, i) => sheet.setColumnWidth(i + 1, widths[c] || 130));
  sheet.getRange('B:B').setNumberFormat('dd mmm yyyy, hh:mm');
  sheet.getRange('Q:Q').setNumberFormat('dd mmm yyyy, hh:mm');

  const statusCol = sheet.getRange(2, KEYS.indexOf('status') + 1, 1000, 1);
  statusCol.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());

  const rules = STATUSES.map(s => SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(s).setBackground(STATUS_COLORS[s]).setRanges([statusCol]).build());
  const prCol = sheet.getRange(2, KEYS.indexOf('priority') + 1, 1000, 1);
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Hot').setBackground('#fecaca').setBold(true).setRanges([prCol]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Warm').setBackground('#fed7aa').setRanges([prCol]).build());
  sheet.setConditionalFormatRules(rules);

  const extra = sheet.getMaxColumns() - COLUMNS.length;
  if (extra > 0) sheet.deleteColumns(COLUMNS.length + 1, extra);
  return sheet;
}

function styleRow_(sheet, row) {
  sheet.getRange(row, 1, 1, COLUMNS.length).setVerticalAlignment('top').setWrap(true).setFontSize(10);
  sheet.getRange(row, 1).setFontFamily('Roboto Mono').setFontWeight('bold');
}

function nextId_(sheet) {
  const year = new Date().getFullYear();
  const props = PropertiesService.getScriptProperties();
  const key = 'seq_' + year;
  const n = Number(props.getProperty(key) || 0) + 1;
  props.setProperty(key, String(n));
  return 'VZ-' + year + '-' + ('000' + n).slice(-4);
}

function findRow_(sheet, id) {
  const ids = sheet.getRange(2, 1, Math.max(1, sheet.getLastRow() - 1), 1).getValues();
  for (let i = 0; i < ids.length; i++) if (ids[i][0] === id) return i + 2;
  return 0;
}

/* ------------------------------------------------------------------ emails */

function notify_(lead) {
  if (!CONFIG.NOTIFY_EMAIL || CONFIG.NOTIFY_EMAIL === 'you@example.com') return;
  const rows = [
    ['Package', lead.package], ['Services', lead.services], ['Budget', lead.budget], ['Timeline', lead.timeline],
    ['Company', lead.company], ['Website', lead.website], ['Phone', lead.phone], ['Source', lead.source],
  ].filter(r => r[1]);

  const html =
    '<div style="background:#f4f4f1;padding:32px 12px;font-family:Helvetica,Arial,sans-serif">' +
    '<div style="max-width:600px;margin:auto;background:#fff;border-radius:18px;overflow:hidden">' +
      '<div style="background:#090909;color:#f5f5f2;padding:28px 32px">' +
        '<div style="font:600 11px monospace;letter-spacing:2px;color:' + CONFIG.ACCENT + '">NEW LEAD · ' + esc_(lead.id) + ' · ' + lead.priority.toUpperCase() + '</div>' +
        '<div style="font-size:30px;font-weight:800;letter-spacing:-1px;margin-top:10px">' + esc_(lead.name) + '</div>' +
        '<div style="color:#9a9a96;margin-top:4px">' + esc_(lead.company || lead.email) + '</div>' +
      '</div>' +
      '<div style="padding:28px 32px">' +
        '<table style="width:100%;border-collapse:collapse;font-size:14px">' +
          rows.map(r => '<tr><td style="padding:9px 0;color:#888;width:120px;border-bottom:1px solid #eee">' + r[0] +
            '</td><td style="padding:9px 0;border-bottom:1px solid #eee;font-weight:600">' + esc_(r[1]) + '</td></tr>').join('') +
        '</table>' +
        (lead.message ? '<div style="margin-top:22px;padding:18px;background:#f6f6f3;border-radius:12px;line-height:1.6;white-space:pre-wrap">' + esc_(lead.message) + '</div>' : '') +
        '<a href="mailto:' + encodeURIComponent(lead.email) + '?subject=' + encodeURIComponent('Re: your ' + CONFIG.STUDIO_NAME + ' enquiry') +
          '" style="display:inline-block;margin-top:24px;background:#090909;color:#fff;text-decoration:none;padding:14px 22px;border-radius:99px;font-weight:700">Reply to ' + esc_(lead.name.split(' ')[0]) + ' →</a>' +
      '</div>' +
    '</div></div>';

  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    replyTo: lead.email,
    subject: '[' + lead.priority + '] New lead: ' + lead.name + (lead.package ? ' — ' + lead.package : '') + ' (' + lead.id + ')',
    htmlBody: html,
    name: CONFIG.STUDIO_NAME + ' Leads',
  });
}

function autoReply_(lead) {
  const first = esc_(lead.name.split(' ')[0]);
  const html =
    '<div style="background:#090909;padding:40px 16px;font-family:Helvetica,Arial,sans-serif;color:#f5f5f2">' +
    '<div style="max-width:560px;margin:auto">' +
      '<div style="font-size:26px;font-weight:800;letter-spacing:-1px">' + CONFIG.STUDIO_NAME + '<span style="color:' + CONFIG.ACCENT + '">●</span></div>' +
      '<div style="font-size:40px;font-weight:800;letter-spacing:-2px;line-height:1;margin:40px 0 20px">Got it, ' + first + '.</div>' +
      '<p style="color:#b5b5b0;font-size:16px;line-height:1.6">Thanks for telling us about ' + esc_(lead.company || 'your project') +
        '. A real person from the studio will read this and get back to you within ' + esc_(CONFIG.REPLY_WITHIN) + '.</p>' +
      '<p style="color:#b5b5b0;font-size:16px;line-height:1.6">If anything changes in the meantime, just reply to this email.</p>' +
      '<div style="margin-top:34px;padding-top:18px;border-top:1px solid #2a2a2a;font:11px monospace;letter-spacing:2px;color:#777">REF ' + esc_(lead.id) + ' · WE DESIGN WHAT\'S NEXT.</div>' +
    '</div></div>';
  MailApp.sendEmail({
    to: lead.email,
    subject: 'We got your enquiry — ' + CONFIG.STUDIO_NAME,
    htmlBody: html,
    name: CONFIG.STUDIO_NAME,
    replyTo: CONFIG.NOTIFY_EMAIL !== 'you@example.com' ? CONFIG.NOTIFY_EMAIL.split(',')[0].trim() : undefined,
  });
}

/* ------------------------------------------------------------------ utils */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function clean_(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}
/** Leading = + - @ would be evaluated as a formula by Sheets; the apostrophe forces plain text. */
function sheetSafe_(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}
function esc_(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function safeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
