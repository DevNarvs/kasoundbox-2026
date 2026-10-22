import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { printChecks, type Check } from '../lib/probe';

// Inputs: the deployed app, the session pooler (as postgres), CRON_SECRET, and two inboxes you can read.
// Run 24 h after applying 0003 (W1-4a-ontime, W1-4f), and again after 7 days (W1-4g, W1-4h).
const base = process.env.SPIKE_BASE_URL;
const sessionUrl = process.env.SPIKE_SESSION_POOLER_URL;
const cronSecret = process.env.CRON_SECRET;
const to = process.env.SPIKE_EMAIL_TO;
const to2 = process.env.SPIKE_EMAIL_TO_2;
if (!base || !sessionUrl || !cronSecret || !to || !to2) {
  throw new Error('Set SPIKE_BASE_URL, SPIKE_SESSION_POOLER_URL, CRON_SECRET, SPIKE_EMAIL_TO, SPIKE_EMAIL_TO_2');
}
const ontimeHours = Number(process.env.SPIKE_ONTIME_HOURS ?? 24);

const EXTENSIONS = ['pg_cron', 'pg_net', 'supabase_vault', 'pgcrypto'];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const manila = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', dateStyle: 'short', timeStyle: 'medium' }).format(d);

type EmailResult = { status: number; id?: string; error?: string; usage?: Record<string, string> };

async function sendEmail(key: string, recipients: string[]): Promise<EmailResult> {
  const res = await fetch(`${base}/api/spike/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${cronSecret}` },
    body: JSON.stringify({ key, to: recipients }),
  });
  const body = (await res.json().catch(() => ({}))) as Omit<EmailResult, 'status'>;
  return { status: res.status, ...body };
}

async function tick(params: string, bearer?: string): Promise<number> {
  const res = await fetch(`${base}/api/spike/tick?${params}`, {
    method: 'POST',
    headers: bearer ? { authorization: `Bearer ${bearer}` } : {},
  });
  return res.status;
}

async function checkExtensions(db: Client): Promise<Check> {
  const { rows } = await db.query<{ extname: string; extversion: string }>('select extname, extversion from pg_extension');
  const have = new Map(rows.map((r) => [r.extname, r.extversion]));
  return {
    id: 'W1-4a',
    pass: EXTENSIONS.every((e) => have.has(e)),
    detail: EXTENSIONS.map((e) => `${e}=${have.get(e) ?? 'MISSING'}`).join(' '),
  };
}

async function checkOnTime(db: Client): Promise<Check> {
  // The time since the last row counts as a gap too, so a job that stopped before the run is caught.
  const { rows } = await db.query<{ n: string; first: Date | null; max_gap: number | null }>(
    `select count(*) as n, min(started_at) as first,
            extract(epoch from greatest(max(gap), now() - max(started_at)))::float8 as max_gap
       from (select started_at, started_at - lag(started_at) over (order by started_at) as gap
               from app.job_runs
              where job = 'every_minute' and started_at > now() - $1::float8 * interval '1 hour') t`,
    [ontimeHours],
  );
  const { n, first, max_gap } = rows[0];
  const spanH = first ? (Date.now() - first.getTime()) / 3_600_000 : 0;
  const covered = spanH >= ontimeHours - 2 / 60; // the first row can land up to a minute after the window opens
  return {
    id: 'W1-4a-ontime',
    pass: covered && max_gap !== null && max_gap <= 120,
    detail: `rows=${n} span=${spanH.toFixed(1)}h of ${ontimeHours}h max_gap=${max_gap?.toFixed(1) ?? '-'}s`,
  };
}

// A pg_net call to a route that sleeps 40 s, with a 30 s timeout. Then: did the function still finish?
async function checkNetTimeout(db: Client): Promise<Check> {
  const note = randomUUID();
  const { rows: args } = await db.query<{ a: string }>(
    `select string_agg(pg_get_function_arguments(p.oid), ' | ') as a
       from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'net' and p.proname = 'http_post'`,
  );
  const defaultTimeout = args[0].a?.match(/timeout_milliseconds integer DEFAULT (\d+)/)?.[1] ?? 'unknown';
  const { rows } = await db.query<{ id: string }>(
    `select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'tick_url')
               || '?source=pg_net_slow&sleep=40&note=' || $1,
        headers := jsonb_build_object('Authorization', 'Bearer ' ||
                   (select decrypted_secret from vault.decrypted_secrets where name = 'job_route_secret')),
        timeout_milliseconds := 30000) as id`,
    [note],
  );
  const reqId = rows[0].id;
  await sleep(35_000);
  const { rows: resp } = await db.query<{ status_code: number | null; timed_out: boolean | null; error_msg: string | null }>(
    'select status_code, timed_out, error_msg from net._http_response where id = $1',
    [reqId],
  );
  await sleep(15_000);
  const { rows: done } = await db.query<{ n: string }>(
    "select count(*) as n from app.job_runs where job = 'tick' and source = 'pg_net_slow' and note = $1",
    [note],
  );
  const r = resp[0];
  const timedOut = !!r && (r.timed_out === true || /time(d)? ?out/i.test(r.error_msg ?? ''));
  return {
    id: 'W1-4b',
    pass: timedOut,
    detail:
      `default timeout_milliseconds=${defaultTimeout}; ` +
      (r ? `response status=${r.status_code} timed_out=${r.timed_out} error=${r.error_msg}` : 'no response row') +
      `; Vercel function finished after the timeout: ${Number(done[0].n) > 0 ? 'yes' : 'no'}`,
  };
}

async function checkEmails(db: Client): Promise<Check[]> {
  const key = randomUUID();
  const first = await sendEmail(key, [to!]);
  const respondedAt = new Date();
  const second = await sendEmail(key, [to!]);
  const same = first.status === 200 && second.status === 200 && !!first.id && first.id === second.id;
  const c: Check = {
    id: 'W1-4c',
    pass: same,
    detail: `ids ${first.id ?? first.error ?? first.status} / ${second.id ?? second.error ?? second.status}; manual: confirm one email at ${to}`,
  };

  const two = await sendEmail(randomUUID(), [to!, to2!]);
  const d: Check = {
    id: 'W1-4d',
    pass: two.status === 200 && !!two.id,
    detail: `id ${two.id ?? two.error ?? two.status}; usage headers ${JSON.stringify(two.usage ?? {})}; manual: record how the Resend dashboard counts this send`,
  };

  await sleep(5_000);
  const { rows } = await db.query<{ first: Date | null }>(
    "select min(started_at) as first from app.job_runs where job = 'after' and note = $1",
    [key],
  );
  const afterAt = rows[0].first;
  const e: Check = {
    id: 'W1-4e',
    pass: !!afterAt && afterAt.getTime() > respondedAt.getTime(),
    detail: afterAt
      ? `response at ${respondedAt.toISOString()}, after() row at ${afterAt.toISOString()} (+${afterAt.getTime() - respondedAt.getTime()} ms)`
      : 'no after() row',
  };
  return [c, d, e];
}

async function checkCronAuth(db: Client): Promise<Check> {
  const none = await tick('source=probe_nobearer');
  const wrong = await tick('source=probe_wrong', 'not-the-secret');
  const note = randomUUID();
  const firstOk = await tick(`source=probe_twice&note=${note}`, cronSecret);
  const secondOk = await tick(`source=probe_twice&note=${note}`, cronSecret);
  const { rows: twice } = await db.query<{ n: string }>(
    "select count(*) as n from app.job_runs where job = 'tick' and note = $1",
    [note],
  );
  const { rows: vercel } = await db.query<{ started_at: Date; note: string | null }>(
    `select started_at, note from app.job_runs
      where job = 'tick' and source = 'vercel' and started_at > now() - interval '48 hours' order by started_at`,
  );
  const runs = vercel.map((r) => `${manila(r.started_at)} (${r.note})`).join(', ');
  return {
    id: 'W1-4f',
    pass: none === 401 && wrong === 401 && firstOk === 200 && secondOk === 200 && Number(twice[0].n) === 2 && vercel.length > 0,
    detail: `no bearer ${none}; wrong bearer ${wrong}; twice → ${twice[0].n} rows (${firstOk}/${secondOk}); Vercel Cron runs (Manila): ${runs || 'none'}`,
  };
}

async function checkHeartbeat(db: Client): Promise<Check> {
  const { rows } = await db.query<{ status_code: number | null }>(
    `select r.status_code from app.job_runs j left join net._http_response r on r.id = j.note::bigint
      where j.job = 'heartbeat' and j.started_at > now() - interval '1 hour'`,
  );
  const ok = rows.filter((r) => r.status_code !== null && r.status_code >= 200 && r.status_code < 300).length;
  return {
    id: 'W1-4g',
    pass: ok > 0,
    detail: `check-ins accepted in the last hour: ${ok}/${rows.length}; manual: Sentry shows them, and pausing spike_heartbeat for 15 min raises an alert`,
  };
}

async function checkKeepAlive(db: Client): Promise<Check> {
  const { rows } = await db.query<{ recent: string; days: string }>(
    `select count(*) filter (where started_at > now() - interval '26 hours') as recent,
            count(distinct (started_at at time zone 'Asia/Manila')::date) as days
       from app.job_runs where job = 'keepalive' and started_at > now() - interval '7 days'`,
  );
  return {
    id: 'W1-4h',
    pass: Number(rows[0].recent) > 0,
    detail: `keep-alive ran on ${rows[0].days} of the last 7 days; manual: no Supabase pause warning over 7 days (other week-1 traffic also reached the project)`,
  };
}

// A query error fails only the checks it covers.
async function guard(ids: string | string[], fn: () => Promise<Check | Check[]>): Promise<Check[]> {
  try {
    return [await fn()].flat();
  } catch (e) {
    return [ids].flat().map((id) => ({ id, pass: false, detail: (e as Error).message }));
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
    checks.push(
      ...(await guard('W1-4a', () => checkExtensions(db))),
      ...(await guard('W1-4a-ontime', () => checkOnTime(db))),
      ...(await guard('W1-4f', () => checkCronAuth(db))),
      ...(await guard(['W1-4c', 'W1-4d', 'W1-4e'], () => checkEmails(db))),
      ...(await guard('W1-4b', () => checkNetTimeout(db))),
      ...(await guard('W1-4g', () => checkHeartbeat(db))),
      ...(await guard('W1-4h', () => checkKeepAlive(db))),
    );
  } catch (e) {
    checks.push({ id: 'jobs-setup', pass: false, detail: (e as Error).message });
  } finally {
    await db.end().catch(() => {});
  }
  printChecks(checks.sort((a, b) => a.id.localeCompare(b.id)));
}

main();
