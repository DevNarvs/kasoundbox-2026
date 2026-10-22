import { printChecks, type Check } from '../lib/probe';

const base = process.env.SPIKE_BASE_URL;
if (!base) throw new Error('Set SPIKE_BASE_URL');

// Default run: every W1-1a..W1-1d check. COLD=1: only the cold-start sample (run after 15+ minutes with no
// traffic at all; it passes only if the instance started for this request).
const path = process.env.COLD === '1' ? '/api/spike/db?cold=1' : '/api/spike/db?latency=1';

const expected =
  process.env.COLD === '1'
    ? ['W1-1d-cold']
    : [
        'W1-1a-ok',
        'W1-1a-wrong',
        'W1-1b-statement',
        'W1-1b-lock',
        'W1-1b-idle',
        'W1-1b-config',
        'W1-1c-pooler',
        'W1-1c-direct',
        'W1-1d',
      ];

async function main() {
  let checks: Check[] = [];
  let error = '';
  try {
    const t = performance.now();
    const res = await fetch(`${base}${path}`);
    const body = await res.json().catch(() => ({}));
    const clientMs = Math.round(performance.now() - t);
    checks = Array.isArray(body.checks) ? body.checks : [];
    if (!checks.length) error = `HTTP ${res.status}`;
    // The cold sample as the visitor sees it, next to a warm request made right after.
    if (process.env.COLD === '1' && checks[0]) {
      const w = performance.now();
      await fetch(`${base}${path}`);
      checks[0].detail += `; client ${clientMs}ms cold, ${Math.round(performance.now() - w)}ms warm`;
    }
  } catch (e) {
    error = (e as Error).message;
  }
  const byId = new Map(checks.map((c) => [c.id, c]));
  printChecks(
    expected.map((id) => byId.get(id) ?? { id, pass: false, detail: error || 'missing from response' }),
  );
}

main();
