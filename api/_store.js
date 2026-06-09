/* Pour Decisions — tiny persistence layer.
 *
 * Uses a Vercel KV / Upstash Redis REST store when its env vars are present
 * (KV_REST_API_URL + KV_REST_API_TOKEN — Vercel injects these automatically
 * when you attach a KV store to the project). No npm dependency required:
 * we talk to the REST API directly.
 *
 * When the store isn't configured yet, helpers report `configured:false`
 * and the front-end falls back to on-device storage, so nothing breaks.
 */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

export const kvConfigured = () => Boolean(KV_URL && KV_TOKEN);

async function kvCommand(args) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  const data = await res.json();
  return data.result;
}

/** Read a JSON array stored under `key`. Returns [] if missing. */
export async function readList(key) {
  const raw = await kvCommand(['GET', key]);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

/** Overwrite the JSON array stored under `key`. */
export async function writeList(key, list) {
  await kvCommand(['SET', key, JSON.stringify(list)]);
}

/** Shared admin PIN check. Defaults to 7687 ("POUR") until ADMIN_PIN is set. */
export function checkPin(req) {
  const expected = process.env.ADMIN_PIN || '7687';
  const got = req.headers['x-admin-pin'] || '';
  return String(got) === String(expected);
}

export function sendJson(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
