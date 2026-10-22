import { printChecks, type Check } from '../lib/probe';

const base = process.env.SPIKE_BASE_URL;
if (!base) throw new Error('Set SPIKE_BASE_URL');

const manilaToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());

async function main() {
  let body: { region?: string | null; db?: string; manilaToday?: string } = {};
  let error = '';
  try {
    const res = await fetch(`${base}/api/health`);
    if (!res.ok) error = `HTTP ${res.status}`;
    else body = await res.json();
  } catch (e) {
    error = (e as Error).message;
  }
  const checks: Check[] = [
    { id: 'W1-1e', pass: body.region === 'sin1', detail: error || `region=${body.region}` },
    { id: 'health-db', pass: body.db === 'ok', detail: error || `db=${body.db}` },
    { id: 'W1-1f', pass: body.manilaToday === manilaToday, detail: error || `db=${body.manilaToday} expected=${manilaToday}` },
  ];
  printChecks(checks);
}

main();
