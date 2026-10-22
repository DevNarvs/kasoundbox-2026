import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client, type ClientConfig } from 'pg';
import { connection, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { report, type Check } from '@/lib/probe';

export const maxDuration = 60;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function clientFor(url: string | undefined, ca: string | undefined): Client {
  const config: ClientConfig = {
    connectionString: url,
    connectionTimeoutMillis: 5_000,
    ssl: { ca, rejectUnauthorized: true },
  };
  return new Client(config);
}

function sqlState(e: unknown): string {
  const err = e as { code?: string; message?: string };
  return err.code ?? err.message ?? String(e);
}

// Far-future dates that no real booking uses; unique per call.
let dateSeq = 0;
function freshDate(): string {
  const day = 400_000 + ((Date.now() / 1000) % 100_000 | 0) + dateSeq++;
  return new Date(Date.UTC(2100, 0, 1) + day * 86_400_000).toISOString().slice(0, 10);
}

function percentile(samples: number[], p: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  return Math.round(sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] * 10) / 10;
}

async function timed(fn: () => Promise<unknown>, n: number): Promise<number[]> {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = performance.now();
    await fn();
    out.push(performance.now() - t);
  }
  return out;
}

async function checkTls(): Promise<Check[]> {
  const url = process.env.DATABASE_URL;
  const ok = clientFor(url, process.env.SUPABASE_DB_CA);
  const okCheck: Check = { id: 'W1-1a-ok', pass: false, detail: '' };
  try {
    await ok.connect();
    await ok.query('select 1');
    okCheck.pass = true;
    okCheck.detail = 'verified TLS with SUPABASE_DB_CA';
  } catch (e) {
    okCheck.detail = sqlState(e);
  } finally {
    await ok.end().catch(() => {});
  }

  const wrongCa = await readFile(path.join(process.cwd(), 'fixtures', 'wrong-ca.pem'), 'utf8');
  const wrong = clientFor(url, wrongCa);
  const wrongCheck: Check = { id: 'W1-1a-wrong', pass: false, detail: 'connected with the wrong CA' };
  try {
    await wrong.connect();
  } catch (e) {
    const msg = (e as Error).message;
    wrongCheck.pass = /certificate|self[- ]signed|unable to verify/i.test(msg);
    wrongCheck.detail = msg;
  } finally {
    await wrong.end().catch(() => {});
  }
  return [okCheck, wrongCheck];
}

async function checkTimeouts(): Promise<Check[]> {
  const url = process.env.DATABASE_URL;
  const ca = process.env.SUPABASE_DB_CA;
  const checks: Check[] = [];

  const s = clientFor(url, ca);
  await s.connect();
  try {
    await s.query('select pg_sleep(6)');
    checks.push({ id: 'W1-1b-statement', pass: false, detail: 'pg_sleep(6) completed' });
  } catch (e) {
    checks.push({ id: 'W1-1b-statement', pass: sqlState(e) === '57014', detail: sqlState(e) });
  } finally {
    await s.end().catch(() => {});
  }

  // Client A holds the capacity lock inside an open transaction; B must give up after lock_timeout.
  const a = clientFor(url, ca);
  const b = clientFor(url, ca);
  await a.connect();
  await b.connect();
  try {
    await a.query('begin');
    await a.query('select app.spike_book($1::date)', [freshDate()]);
    try {
      await b.query('select app.spike_book($1::date)', [freshDate()]);
      checks.push({ id: 'W1-1b-lock', pass: false, detail: 'B got the lock' });
    } catch (e) {
      checks.push({ id: 'W1-1b-lock', pass: sqlState(e) === '55P03', detail: sqlState(e) });
    }
    await a.query('rollback').catch(() => {});
  } finally {
    await a.end().catch(() => {});
    await b.end().catch(() => {});
  }

  const c = clientFor(url, ca);
  const seen: string[] = [];
  c.on('error', (e) => seen.push(sqlState(e)));
  await c.connect();
  try {
    await c.query('begin');
    await c.query('select 1');
    await sleep(11_000);
    await c.query('select 1');
    checks.push({ id: 'W1-1b-idle', pass: seen.includes('25P03'), detail: seen.join(',') || 'query after idle succeeded' });
  } catch (e) {
    seen.push(sqlState(e));
    const msg = (e as Error).message ?? '';
    checks.push({
      id: 'W1-1b-idle',
      pass: seen.includes('25P03') || /idle-in-transaction/i.test(msg),
      detail: `${seen.join(',')} ${msg}`.trim(),
    });
  } finally {
    await c.end().catch(() => {});
  }

  const { rows } = await pool.query<{ rolconfig: string[] | null }>(
    "select rolconfig from pg_roles where rolname = 'app_rw'",
  );
  const cfg = rows[0]?.rolconfig ?? [];
  const want = ['statement_timeout=5s', 'lock_timeout=2s', 'idle_in_transaction_session_timeout=10s'];
  checks.push({ id: 'W1-1b-config', pass: want.every((w) => cfg.includes(w)), detail: cfg.join(' ') });
  return checks;
}

async function checkHosts(): Promise<Check[]> {
  const { rows } = await pool.query<{ u: string }>('select current_user as u');
  const pooler: Check = { id: 'W1-1c-pooler', pass: rows[0]?.u === 'app_rw', detail: `current_user=${rows[0]?.u}` };

  const directUrl = process.env.SPIKE_DIRECT_DATABASE_URL;
  const direct: Check = { id: 'W1-1c-direct', pass: false, detail: 'SPIKE_DIRECT_DATABASE_URL not set' };
  if (directUrl) {
    const d = clientFor(directUrl, process.env.SUPABASE_DB_CA);
    try {
      await d.connect();
      direct.detail = 'direct host reachable';
    } catch (e) {
      direct.pass = true;
      direct.detail = `unreachable as expected: ${(e as Error).message}`;
    } finally {
      await d.end().catch(() => {});
    }
  }
  return [pooler, direct];
}

async function checkLatency(): Promise<Check> {
  try {
    const one = await timed(() => pool.query('select 1'), 100);
    const cal = await timed(
      () =>
        pool.query(
          'select count(*) from app.resource_claims where claim_date between $1::date and $1::date + 30 and live',
          [freshDate()],
        ),
      100,
    );
    const book = await timed(() => pool.query('select app.spike_book($1::date)', [freshDate()]), 100);
    const fmt = (name: string, s: number[]) => `${name} p50=${percentile(s, 50)}ms p95=${percentile(s, 95)}ms`;
    return { id: 'W1-1d', pass: true, detail: [fmt('select1', one), fmt('calendar', cal), fmt('book', book)].join('; ') };
  } catch (e) {
    return { id: 'W1-1d', pass: false, detail: sqlState(e) };
  }
}

export async function GET(request: NextRequest) {
  await connection();
  const params = request.nextUrl.searchParams;

  if (params.get('cold') === '1') {
    const t = performance.now();
    try {
      await pool.query('select 1');
      const ms = Math.round(performance.now() - t);
      return report([{ id: 'W1-1d-cold', pass: true, detail: `first select 1 ${ms}ms; uptime ${Math.round(process.uptime())}s` }]);
    } catch (e) {
      return report([{ id: 'W1-1d-cold', pass: false, detail: sqlState(e) }]);
    }
  }

  const checks: Check[] = [...(await checkTls()), ...(await checkTimeouts()), ...(await checkHosts())];
  if (params.get('latency') === '1') checks.push(await checkLatency());
  return report(checks);
}
