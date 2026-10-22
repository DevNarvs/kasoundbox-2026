import dns from 'node:dns/promises';
import { Client, type ClientConfig } from 'pg';
import { connection, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { report, type Check } from '@/lib/probe';

export const maxDuration = 60;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// W1-1a-wrong: a self-signed CA (CN=wrong) that signs nothing, so verification against it must fail.
const WRONG_CA = `-----BEGIN CERTIFICATE-----
MIIDATCCAemgAwIBAgIUTFVKmFmUkP8Tep2nOK8OVOBJ0ZowDQYJKoZIhvcNAQEL
BQAwEDEOMAwGA1UEAwwFd3JvbmcwHhcNMjYxMDIyMDE0MTAyWhcNMzYxMDE5MDE0
MTAyWjAQMQ4wDAYDVQQDDAV3cm9uZzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC
AQoCggEBAN1zYYSXRwYXfuzurMEc8dK6WtyISwwMUT9AuklvKX6hmtv/SKi7oZBL
rhOKsWLYcHRB00qBvTJRBTUAN7odIcHeuNCKT/C/kSX3cru9tt1uJndodgFyeDQT
hUlLy/OZifbotB8lQ3vLEwzxFwVFOq0Zsf+wAtrrm1gxMqt4WQxob2HxtI0ZjCxT
kfPq01lrx/wP51semCEXhU2vFdRxZJKoMXDfGnRf4tTxbeeoIzaGDCclANhp10Gp
oNWLGKN0jsw3PH8bMQYgGvnby0nf7ZAL5BeIUtkiqmbeSNj96i9Q9ZbjhhGZlcyB
VO8KDirdw9Dd+sgEhGiHjwOGG/FeWQMCAwEAAaNTMFEwHQYDVR0OBBYEFPo8tBmD
wdQKpqEPjKzWzG6L+C1UMB8GA1UdIwQYMBaAFPo8tBmDwdQKpqEPjKzWzG6L+C1U
MA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBABH0zwchrMKbvNFf
bvIHo4Z1sWTmUam5a3scCOv3MWL9HcYrHJpoWQmnHHk76vmQglkvNTZorb9Er0On
urE+HGkxoH7Dx+aFYDMTe77tnZRBVmaxDbbhGeR4rmBbfQ/R9WOa8+TKn3CAC4IX
pKCCXDb1Z2WUtLqWtZq8muXZlv+DK9mCzS809xjp4Rpj1wb3Anx5s7E0m7k2n3UN
JraALQI0T3j2kRyICFfKhLw2sfm4OJRMUdMRbCiaK2sXE0vN9PALrZionHwJMCCj
pmY5gaDkfcRUKzk9yEsJYtZ9pA/RcEztEwvPQhMo4GM5hUuhQolL/vsvTeJcjgT7
nHKZKVQ=
-----END CERTIFICATE-----`;

// A cold sample counts only if this instance started for it.
const COLD_UPTIME_S = 60;
// Errors that mean the host was never reached (DNS, routing, timeout), as opposed to auth or TLS errors.
const UNREACHABLE = /ENOTFOUND|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH|EADDRNOTAVAIL|EAFNOSUPPORT|ETIMEDOUT|timeout/i;

function clientFor(url: string | undefined, ca: string | undefined): Client {
  const config: ClientConfig = {
    connectionString: url,
    connectionTimeoutMillis: 5_000,
    // A hung query (for example after the pooler drops an idle session) fails its check instead of the route.
    query_timeout: 15_000,
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

  const wrong = clientFor(url, WRONG_CA);
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

// The app's URL must be the transaction pooler (6543) as app_rw, with TLS set in code, not in the URL.
function poolerUrlProblems(raw: string | undefined): string[] {
  if (!raw) return ['DATABASE_URL not set'];
  const url = new URL(raw);
  const problems: string[] = [];
  if (url.port !== '6543') problems.push(`port ${url.port || 'default'} is not 6543`);
  if (!decodeURIComponent(url.username).startsWith('app_rw')) problems.push(`user ${url.username} is not app_rw`);
  if (url.searchParams.has('sslmode')) problems.push('sslmode in the URL');
  return problems;
}

async function checkHosts(): Promise<Check[]> {
  const { rows } = await pool.query<{ u: string }>('select current_user as u');
  const problems = poolerUrlProblems(process.env.DATABASE_URL);
  const pooler: Check = {
    id: 'W1-1c-pooler',
    pass: rows[0]?.u === 'app_rw' && problems.length === 0,
    detail: `current_user=${rows[0]?.u}${problems.length ? `; ${problems.join('; ')}` : '; DATABASE_URL is 6543 as app_rw'}`,
  };

  const directUrl = process.env.SPIKE_DIRECT_DATABASE_URL;
  const direct: Check = { id: 'W1-1c-direct', pass: false, detail: 'SPIKE_DIRECT_DATABASE_URL not set' };
  if (directUrl) {
    const host = new URL(directUrl).hostname.replace(/^\[|\]$/g, '');
    const records = async (fn: (h: string) => Promise<string[]>) => (await fn(host).catch(() => [])).length;
    const dnsNote = `AAAA=${await records(dns.resolve6)} A=${await records(dns.resolve4)}`;
    const d = clientFor(directUrl, process.env.SUPABASE_DB_CA);
    try {
      await d.connect();
      direct.detail = `direct host reachable (connected); ${dnsNote}`;
    } catch (e) {
      const err = e as { code?: string; message?: string };
      const what = `${err.code ?? ''} ${err.message ?? ''}`.trim();
      direct.pass = UNREACHABLE.test(what);
      direct.detail = `${direct.pass ? 'unreachable as expected' : 'host reached (not a network error)'}: ${what}; ${dnsNote}`;
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

// A failure inside one group fails only that group's checks.
async function guard(ids: string[], fn: () => Promise<Check | Check[]>): Promise<Check[]> {
  try {
    return [await fn()].flat();
  } catch (e) {
    return ids.map((id) => ({ id, pass: false, detail: sqlState(e) }));
  }
}

export async function GET(request: NextRequest) {
  await connection();
  const params = request.nextUrl.searchParams;

  if (params.get('cold') === '1') {
    const uptime = Math.round(process.uptime());
    const t = performance.now();
    try {
      await pool.query('select 1');
      const ms = Math.round(performance.now() - t);
      return report([
        {
          id: 'W1-1d-cold',
          pass: uptime < COLD_UPTIME_S,
          detail: `first select 1 ${ms}ms; instance uptime ${uptime}s${uptime < COLD_UPTIME_S ? '' : ' (warm instance: not a cold sample)'}`,
        },
      ]);
    } catch (e) {
      return report([{ id: 'W1-1d-cold', pass: false, detail: sqlState(e) }]);
    }
  }

  const checks: Check[] = [
    ...(await guard(['W1-1a-ok', 'W1-1a-wrong'], checkTls)),
    ...(await guard(['W1-1b-statement', 'W1-1b-lock', 'W1-1b-idle', 'W1-1b-config'], checkTimeouts)),
    ...(await guard(['W1-1c-pooler', 'W1-1c-direct'], checkHosts)),
  ];
  if (params.get('latency') === '1') checks.push(...(await guard(['W1-1d'], checkLatency)));
  return report(checks);
}
