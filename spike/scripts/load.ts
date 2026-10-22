import { Client } from 'pg';
import { printChecks, type Check } from '../lib/probe';

// W1-8a: a burst of catalog reads and bookings at concurrency 10; then record the pooler's server connections.
// Afterwards, screenshot the Vercel usage page.
const base = process.env.SPIKE_BASE_URL;
const sessionUrl = process.env.SPIKE_SESSION_POOLER_URL;
if (!base) throw new Error('Set SPIKE_BASE_URL');
if (!sessionUrl) throw new Error('Set SPIKE_SESSION_POOLER_URL');

const CATALOG_GETS = 500;
const BOOK_POSTS = 100;
const CONCURRENCY = 10;
const SETTLE_MS = 60_000;

type Result = { kind: 'catalog' | 'book'; ok: boolean; status: number; ms: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Far-future dates in their own range (the race and db probes use others).
function randomDate(): string {
  const day = 300_000 + Math.floor(Math.random() * 100_000);
  return new Date(Date.UTC(2100, 0, 1) + day * 86_400_000).toISOString().slice(0, 10);
}

async function timedFetch(kind: Result['kind']): Promise<Result> {
  const t = performance.now();
  try {
    if (kind === 'catalog') {
      const res = await fetch(`${base}/spike/catalog`);
      const html = await res.text();
      return { kind, ok: res.ok && html.includes('data-price'), status: res.status, ms: performance.now() - t };
    }
    const res = await fetch(`${base}/api/spike/book`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ date: randomDate() }),
    });
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    return { kind, ok: body.code === 'ok' || body.code === 'sold_out', status: res.status, ms: performance.now() - t };
  } catch {
    return { kind, ok: false, status: 0, ms: performance.now() - t };
  }
}

function summary(results: Result[], kind: Result['kind']): { ok: number; total: number; text: string } {
  const r = results.filter((x) => x.kind === kind);
  const ms = r.map((x) => x.ms).sort((a, b) => a - b);
  const p = (q: number) => Math.round(ms[Math.min(ms.length - 1, Math.floor(q * ms.length))] ?? 0);
  const statuses = Object.entries(
    r.reduce<Record<number, number>>((acc, x) => ({ ...acc, [x.status]: (acc[x.status] ?? 0) + 1 }), {}),
  )
    .map(([s, n]) => `${s}×${n}`)
    .join(' ');
  const ok = r.filter((x) => x.ok).length;
  return { ok, total: r.length, text: `${kind} ${ok}/${r.length} ok (${statuses}) p50=${p(0.5)}ms p95=${p(0.95)}ms` };
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
    const clients = async () =>
      Number((await db.query<{ n: string }>("select count(*) as n from pg_stat_activity where usename = 'app_rw'")).rows[0].n);
    const before = await clients();

    const queue: Result['kind'][] = [
      ...Array<Result['kind']>(CATALOG_GETS).fill('catalog'),
      ...Array<Result['kind']>(BOOK_POSTS).fill('book'),
    ].sort(() => Math.random() - 0.5);
    const results: Result[] = [];
    const started = performance.now();
    await Promise.all(
      Array.from({ length: CONCURRENCY }, async () => {
        for (let kind = queue.pop(); kind; kind = queue.pop()) results.push(await timedFetch(kind));
      }),
    );
    const seconds = ((performance.now() - started) / 1000).toFixed(1);
    const cat = summary(results, 'catalog');
    const book = summary(results, 'book');
    checks.push({
      id: 'W1-8a-load',
      pass: cat.ok === cat.total && book.ok === book.total,
      detail: `${results.length} requests in ${seconds}s; ${cat.text}; ${book.text}`,
    });

    // Supavisor's server connections, not Vercel's clients to it: a record only. The client verdict is the
    // dashboard's pooler client chart, next to the usage screenshot.
    await sleep(SETTLE_MS);
    const after = await clients();
    checks.push({
      id: 'W1-8a-clients',
      pass: true,
      detail: `recorded: app_rw server connections before=${before} after=${after} (60 s after the burst); verdict from the dashboard's pooler client chart`,
    });
  } catch (e) {
    checks.push({ id: 'load-setup', pass: false, detail: (e as Error).message });
  } finally {
    await db.end().catch(() => {});
  }
  printChecks(checks);
}

main();
