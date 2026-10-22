import { printChecks, type Check } from '../lib/probe';

const base = process.env.SPIKE_BASE_URL;
if (!base) throw new Error('Set SPIKE_BASE_URL');

const manilaToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());
// 00:30 Manila on 23 Oct is still 22 Oct in UTC, so this instant tells the two apart at any hour of the run.
const FIXED_MANILA_DATE = '2026-10-23';

async function main() {
  let body: { region?: string | null; db?: string; manilaToday?: string; fixed?: { db?: string; intl?: string } } = {};
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
    {
      id: 'W1-1f',
      pass: body.manilaToday === manilaToday && body.fixed?.db === FIXED_MANILA_DATE && body.fixed?.intl === FIXED_MANILA_DATE,
      detail:
        error ||
        `today db=${body.manilaToday} expected=${manilaToday}; 2026-10-22T16:30Z → db=${body.fixed?.db} intl=${body.fixed?.intl} expected=${FIXED_MANILA_DATE}`,
    },
  ];
  printChecks(checks);
}

main();
