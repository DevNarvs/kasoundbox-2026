import { createHmac } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';
import { printChecks, type Check } from '../lib/probe';

// Inputs: the deployed app, the session pooler (as postgres), and the admin created by seed-admin.ts.
// SPIKE_TOTP_SECRET is the base32 secret shown at enrollment on /admin/login.
const base = process.env.SPIKE_BASE_URL;
const sessionUrl = process.env.SPIKE_SESSION_POOLER_URL;
const email = process.env.SPIKE_ADMIN_EMAIL;
const password = process.env.SPIKE_ADMIN_PASSWORD;
const totpSecret = process.env.SPIKE_TOTP_SECRET;
if (!base || !sessionUrl || !email || !password || !totpSecret) {
  throw new Error('Set SPIKE_BASE_URL, SPIKE_SESSION_POOLER_URL, SPIKE_ADMIN_EMAIL, SPIKE_ADMIN_PASSWORD, SPIKE_TOTP_SECRET');
}

const ARGON2ID_PREFIX = '$argon2id$v=19$m=19456,t=2,p=1$';
const IP_HEADERS = ['x-vercel-forwarded-for', 'x-real-ip', 'x-forwarded-for'] as const;
const SPOOF = { 'x-forwarded-for': '1.2.3.4', 'x-real-ip': '5.6.7.8' };
const BETTER_AUTH_TABLES = ['account', 'session', 'two_factor', 'user', 'verification'];
// From better-auth/dist/plugins/two-factor/backup-codes/index.d.mts (1.7.12): no one-way hash option.
const BACKUP_CODE_OPTIONS = "library options: 'plain' | 'encrypted' (default) | custom { encrypt, decrypt }";

type IpEcho = Record<(typeof IP_HEADERS)[number], string | null>;

function base32Decode(s: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of s.replace(/=+$/, '').toUpperCase()) {
    value = (value << 5) | alphabet.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

// RFC 6238: SHA-1, 6 digits, 30 s — what an authenticator app computes from the enrollment secret.
function totp(secret: string, now = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30_000)));
  const mac = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  return String((mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
}

type SetCookie = { name: string; value: string; attrs: string[] };

function parseSetCookies(res: Response): SetCookie[] {
  return res.headers.getSetCookie().map((line) => {
    const [pair, ...attrs] = line.split(';').map((p) => p.trim());
    const eq = pair.indexOf('=');
    return { name: pair.slice(0, eq), value: pair.slice(eq + 1), attrs: attrs.map((a) => a.toLowerCase()) };
  });
}

async function postJson(url: string, body: unknown, cookie?: string): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base!, ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  });
}

async function ipEcho(headers: Record<string, string> = {}): Promise<IpEcho> {
  const res = await fetch(`${base}/api/spike/ip`, { headers });
  if (!res.ok) throw new Error(`/api/spike/ip HTTP ${res.status}`);
  return res.json();
}

async function checkHash(db: Client): Promise<Check> {
  const { rows } = await db.query<{ password: string }>(
    'select password from admin_auth.account where password is not null',
  );
  const good = rows.filter((r) => r.password.startsWith(ARGON2ID_PREFIX)).length;
  return {
    id: 'W1-3a',
    pass: rows.length > 0 && good === rows.length,
    detail: `${good}/${rows.length} credential hashes start with ${ARGON2ID_PREFIX}`,
  };
}

// Returns the check and the caller's real IP (from the first unspoofable header), without printing the IP.
async function checkIpHeaders(): Promise<{ check: Check; clientIp: string | null }> {
  try {
    const plain = await ipEcho();
    const spoofed = await ipEcho(SPOOF);
    const unaffected = IP_HEADERS.filter(
      (h) => spoofed[h] !== null && spoofed[h] === plain[h] && !/1\.2\.3\.4|5\.6\.7\.8/.test(spoofed[h] ?? ''),
    );
    const clientIp = unaffected.length ? plain[unaffected[0]]!.split(',')[0].trim() : null;
    const state = IP_HEADERS.map((h) => `${h}=${unaffected.includes(h) ? 'unaffected' : spoofed[h] === null ? 'absent' : 'spoofable'}`);
    return {
      check: { id: 'W1-3b', pass: unaffected.length > 0, detail: `${state.join(' ')}; trust ${unaffected[0] ?? 'none'}` },
      clientIp,
    };
  } catch (e) {
    return { check: { id: 'W1-3b', pass: false, detail: (e as Error).message }, clientIp: null };
  }
}

// Signs in (password, then TOTP if enrolled) and returns the cookie header for later requests.
async function checkCookie(): Promise<{ check: Check; cookie: string | null }> {
  const id = 'W1-3c';
  try {
    const signIn = await postJson(`${base}/api/auth/sign-in/email`, { email, password });
    if (!signIn.ok) return { check: { id, pass: false, detail: `sign-in HTTP ${signIn.status}` }, cookie: null };
    let cookies = parseSetCookies(signIn);
    const body = (await signIn.json()) as { twoFactorRedirect?: boolean };
    let step = 'password only';
    if (body.twoFactorRedirect) {
      const pending = cookies.filter((c) => c.value).map((c) => `${c.name}=${c.value}`).join('; ');
      const verify = await postJson(`${base}/api/auth/two-factor/verify-totp`, { code: totp(totpSecret!) }, pending);
      if (!verify.ok) return { check: { id, pass: false, detail: `verify-totp HTTP ${verify.status}` }, cookie: null };
      cookies = parseSetCookies(verify);
      step = 'password + TOTP';
    }
    const session = cookies.find((c) => c.name.endsWith('.session_token') && c.value);
    if (!session) return { check: { id, pass: false, detail: `no session cookie (${step})` }, cookie: null };
    const flags = {
      prefix: session.name.startsWith('__Secure-'),
      httpOnly: session.attrs.includes('httponly'),
      secure: session.attrs.includes('secure'),
      strict: session.attrs.includes('samesite=strict'),
    };
    return {
      check: {
        id,
        pass: Object.values(flags).every(Boolean),
        detail: `${session.name} ${Object.entries(flags).map(([k, v]) => `${k}=${v}`).join(' ')} (${step})`,
      },
      cookie: `${session.name}=${session.value}`,
    };
  } catch (e) {
    return { check: { id, pass: false, detail: (e as Error).message }, cookie: null };
  }
}

// The action ID comes from the page's progressive-enhancement form; the signed-in call is the control.
async function checkProtectedAction(cookie: string | null): Promise<Check> {
  const id = 'W1-3d';
  try {
    const page = await fetch(`${base}/admin/spike-action`);
    const actionId = (await page.text()).match(/\$ACTION_ID_([0-9a-f]+)/)?.[1];
    if (!actionId) return { id, pass: false, detail: `no action ID on /admin/spike-action (HTTP ${page.status})` };
    const call = async (withCookie: boolean) => {
      const res = await fetch(`${base}/admin/spike-action`, {
        method: 'POST',
        headers: {
          'next-action': actionId,
          'content-type': 'text/plain;charset=UTF-8',
          accept: 'text/x-component',
          origin: base!,
          ...(withCookie && cookie ? { cookie } : {}),
        },
        body: '[]',
      });
      return { status: res.status, ok: (await res.text()).includes('"ok":true') };
    };
    const anon = await call(false);
    const signedIn = cookie ? await call(true) : null;
    return {
      id,
      pass: !anon.ok && signedIn?.ok === true,
      detail: `no cookie: HTTP ${anon.status} ok=${anon.ok}; signed in: ${signedIn ? `HTTP ${signedIn.status} ok=${signedIn.ok}` : 'no session'}`,
    };
  } catch (e) {
    return { id, pass: false, detail: (e as Error).message };
  }
}

async function checkNoRawIp(db: Client, clientIp: string | null): Promise<Check> {
  const id = 'W1-3e';
  if (!clientIp) return { id, pass: false, detail: 'client IP unknown (W1-3b found no trusted header)' };
  const needles = [...new Set([clientIp, clientIp.replace(/^::ffff:/i, '')])];
  const { rows: cols } = await db.query<{ table_name: string; column_name: string }>(
    `select table_name, column_name from information_schema.columns
      where table_schema = 'admin_auth' and data_type in ('text', 'character varying')`,
  );
  const hits: string[] = [];
  for (const c of cols) {
    const { rows } = await db.query<{ n: string }>(
      `select count(*) as n from admin_auth."${c.table_name}" where ${needles.map((_, i) => `"${c.column_name}" like '%' || $${i + 1} || '%'`).join(' or ')}`,
      needles,
    );
    if (Number(rows[0].n) > 0) hits.push(`${c.table_name}.${c.column_name}`);
  }
  return { id, pass: hits.length === 0, detail: hits.length ? `raw IP found in ${hits.join(', ')}` : `no raw IP in ${cols.length} text columns` };
}

async function checkTotpStorage(db: Client): Promise<Check> {
  const { rows } = await db.query<{ secret: string; backup_codes: string }>(
    'select secret, backup_codes from admin_auth.two_factor',
  );
  if (!rows.length) return { id: 'W1-3f', pass: false, detail: 'no two_factor row (enroll TOTP first)' };
  const raw = base32Decode(totpSecret!).toString('utf8');
  const readable = rows.some((r) => r.secret === totpSecret || r.secret.includes(raw));
  const backup = rows[0].backup_codes.trim().startsWith('[') ? 'plain JSON' : 'not plain (encrypted)';
  return {
    id: 'W1-3f',
    pass: !readable,
    detail: `secret ${readable ? 'READABLE' : 'not readable'} in row; backup codes stored ${backup}; ${BACKUP_CODE_OPTIONS}`,
  };
}

async function checkTables(db: Client, signedIn: boolean): Promise<Check> {
  const { rows } = await db.query<{ table_schema: string; table_name: string; cols: string }>(
    `select table_schema, table_name, string_agg(column_name, ',' order by ordinal_position) as cols
       from information_schema.columns
      where table_name = any($1) and table_schema in ('admin_auth', 'public')
      group by 1, 2 order by 1, 2`,
    [BETTER_AUTH_TABLES],
  );
  const inSchema = rows.filter((r) => r.table_schema === 'admin_auth').map((r) => r.table_name);
  const inPublic = rows.filter((r) => r.table_schema === 'public').map((r) => r.table_name);
  const allThere = BETTER_AUTH_TABLES.every((t) => inSchema.includes(t));
  return {
    id: 'W1-3g',
    pass: allThere && inPublic.length === 0 && signedIn,
    detail:
      rows.map((r) => `${r.table_schema}.${r.table_name}(${r.cols})`).join(' ') +
      (signedIn ? '' : ' — sign-in through the adapter failed'),
  };
}

async function listJs(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listJs(p)));
    else if (entry.name.endsWith('.mjs')) out.push(p);
  }
  return out;
}

// The env names Better Auth reads, from the installed package (better-auth and its own @better-auth/core).
async function checkEnvNames(): Promise<Check> {
  const root = path.join(process.cwd(), 'node_modules', 'better-auth');
  const files = [...(await listJs(path.join(root, 'dist'))), ...(await listJs(path.join(root, 'node_modules', '@better-auth', 'core', 'dist')))];
  const names = new Set<string>();
  for (const f of files) {
    for (const m of (await readFile(f, 'utf8')).matchAll(/(?:env\.|getEnvVar\(")((?:BETTER_)?AUTH_[A-Z_]+)/g)) names.add(m[1]);
  }
  const want = ['BETTER_AUTH_SECRETS', 'BETTER_AUTH_URL'];
  return {
    id: 'W1-3h',
    pass: want.every((w) => names.has(w)),
    detail: `reads ${[...names].sort().join(', ') || 'nothing found'}`,
  };
}

// A query error fails only its own check.
async function guard(id: string, fn: () => Promise<Check>): Promise<Check> {
  try {
    return await fn();
  } catch (e) {
    return { id, pass: false, detail: (e as Error).message };
  }
}

async function main() {
  const db = new Client({
    connectionString: sessionUrl,
    connectionTimeoutMillis: 5_000,
    ssl: { ca: process.env.SUPABASE_DB_CA, rejectUnauthorized: true },
  });
  const checks: Check[] = [];
  try {
    await db.connect();
    const ip = await checkIpHeaders();
    const login = await checkCookie();
    checks.push(
      await guard('W1-3a', () => checkHash(db)),
      ip.check,
      login.check,
      await checkProtectedAction(login.cookie),
      await guard('W1-3e', () => checkNoRawIp(db, ip.clientIp)),
      await guard('W1-3f', () => checkTotpStorage(db)),
      await guard('W1-3g', () => checkTables(db, login.cookie !== null)),
    );
  } catch (e) {
    checks.push({ id: 'auth-setup', pass: false, detail: (e as Error).message });
  } finally {
    await db.end().catch(() => {});
  }
  checks.push(await checkEnvNames());
  printChecks(checks);
}

main();
