// Paste into script.google.com while signed in as woosh.fashion@gmail.com
const MEMO_URL = "https://YOUR-SITE.netlify.app/api/woosh"; // your live app address + /api/woosh
const SECRET   = "PASTE_THE_SAME_SECRET_AS_WOOSH_WEBHOOK_SECRET";
const ALLOWED  = []; // optional: only these senders, e.g. ["shopify.com","laam.pk"]. Empty = all

function sync() {
  const props = PropertiesService.getScriptProperties();
  const last = Number(props.getProperty("last")) || Math.floor(Date.now() / 1000) - 7 * 86400;
  const now = Math.floor(Date.now() / 1000), msgs = [];
  GmailApp.search("in:inbox after:" + (last - 3600), 0, 40).forEach(t => t.getMessages().forEach(m => {
    const from = m.getFrom();
    if (m.getDate().getTime() / 1000 < last - 3600) return;
    if (ALLOWED.length && !ALLOWED.some(a => from.toLowerCase().includes(a))) return;
    msgs.push({ id: m.getId(), from: from, subject: m.getSubject(), date: m.getDate().toISOString(), body: m.getPlainBody().slice(0, 4000) });
  }));
  const r = UrlFetchApp.fetch(MEMO_URL, { method: "post", contentType: "application/json", headers: { "x-woosh-secret": SECRET }, payload: JSON.stringify({ messages: msgs }), muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error("Memo answered " + r.getResponseCode() + ": " + r.getContentText());
  props.setProperty("last", String(now));
}
function install() { // run this once
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("sync").timeBased().everyMinutes(5).create();
}
