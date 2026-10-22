import { Client } from 'pg';
import { printChecks, type Check } from '../lib/probe';

const base = process.env.SPIKE_BASE_URL;
const sessionUrl = process.env.SPIKE_SESSION_POOLER_URL;
if (!base) throw new Error('Set SPIKE_BASE_URL');
if (!sessionUrl) throw new Error('Set SPIKE_SESSION_POOLER_URL');

const ROUNDS = 5;
const CONCURRENCY = 20;
const SETTLE_MS = 60_000;
const BAD_DETAIL = /prepared statement|55P03|idle/i;

type BookResult = { code?: string; detail?: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Far-future date no real booking uses (separate range from the db probe's dates).
function randomDate(): string {
  const day = 100_000 + Math.floor(Math.random() * 100_000);
  return new Date(Date.UTC(2100, 0, 1) + day * 86_400_000).toISOString().slice(0, 10);
}

async function count(db: Client, sql: string): Promise<number> {
  const { rows } = await db.query<{ n: string }>(sql);
  return Number(rows[0].n);
}

// A fresh date with set 1 already claimed, so exactly one set is free.
async function prepareDate(db: Client): Promise<string> {
  for (;;) {
    const d = randomDate();
    const { rows } = await db.query<{ n: string }>(
      'select count(*) as n from app.resource_claims where claim_date = $1::date',
      [d],
    );
    if (Number(rows[0].n) > 0) continue;
    await db.query('insert into app.resource_claims (resource_id, claim_date, live) values (1, $1::date, true)', [d]);
    return d;
  }
}

async function book(date: string): Promise<BookResult> {
  try {
    const res = await fetch(`${base}/api/spike/book`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    const body = (await res.json().catch(() => ({}))) as BookResult;
    return body.code ? body : { code: 'error', detail: `HTTP ${res.status}` };
  } catch (e) {
    return { code: 'error', detail: (e as Error).message };
  }
}

async function round(db: Client, n: number): Promise<Check> {
  const date = await prepareDate(db);
  const results = await Promise.all(Array.from({ length: CONCURRENCY }, () => book(date)));
  const ok = results.filter((r) => r.code === 'ok').length;
  const soldOut = results.filter((r) => r.code === 'sold_out').length;
  const errors = results.filter((r) => r.code !== 'ok' && r.code !== 'sold_out');
  const bad = results.filter((r) => r.detail && BAD_DETAIL.test(r.detail));
  const first = errors[0]?.detail ?? bad[0]?.detail;
  return {
    id: `W1-2a-round${n}`,
    pass: ok === 1 && soldOut === CONCURRENCY - 1 && errors.length === 0 && bad.length === 0,
    detail: `date=${date} ok=${ok} sold_out=${soldOut} error=${errors.length}${first ? ` first=${first}` : ''}`,
  };
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
    const clientsSql = "select count(*) as n from pg_stat_activity where usename = 'app_rw'";
    const before = await count(db, clientsSql);

    for (let n = 1; n <= ROUNDS; n++) checks.push(await round(db, n));

    // Without pg_read_all_stats, other roles' state reads as null and the count would be a false 0.
    const { rows } = await db.query<{ ok: boolean }>(
      "select pg_has_role(current_user, 'pg_read_all_stats', 'member') as ok",
    );
    const idle = await count(db, "select count(*) as n from pg_stat_activity where state = 'idle in transaction'");
    checks.push({
      id: 'W1-2a-idle',
      pass: rows[0].ok && idle === 0,
      detail: rows[0].ok ? `idle in transaction=${idle}` : 'setup role cannot read other sessions (needs pg_read_all_stats)',
    });

    await sleep(SETTLE_MS);
    const after = await count(db, clientsSql);
    checks.push({ id: 'W1-2b', pass: after <= before, detail: `app_rw clients before=${before} after=${after}` });
  } catch (e) {
    checks.push({ id: 'race-setup', pass: false, detail: (e as Error).message });
  } finally {
    await db.end().catch(() => {});
  }
  printChecks(checks);
}

main();
