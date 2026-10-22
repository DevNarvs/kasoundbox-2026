import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { printChecks, type Check } from '../lib/probe';

// Uploads go from this script straight to Storage with the publishable key, as the browser will.
// Run once with the Data API on, then turn it off in the dashboard and run with SPIKE_DATA_API=off (W1-5c).
const base = process.env.SPIKE_BASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const cronSecret = process.env.CRON_SECRET;
if (!base || !supabaseUrl || !publishableKey || !cronSecret) {
  throw new Error('Set SPIKE_BASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, CRON_SECRET');
}
const dataApiOff = process.env.SPIKE_DATA_API === 'off';

const bucket = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false } }).storage.from('payment-proofs');
const fixture = (name: string) => readFile(path.join(process.cwd(), 'fixtures', name));

type Slot = { path: string; token: string };
type Outcome = { ok: boolean; message: string };

async function newSlot(): Promise<Slot> {
  const res = await fetch(`${base}/api/spike/upload-url`, {
    method: 'POST',
    headers: { authorization: `Bearer ${cronSecret}` },
  });
  if (!res.ok) throw new Error(`/api/spike/upload-url HTTP ${res.status}`);
  return res.json();
}

async function upload(slot: Slot, file: string, contentType: string): Promise<Outcome> {
  const { data, error } = await bucket.uploadToSignedUrl(slot.path, slot.token, await fixture(file), { contentType });
  if (error) {
    const status = (error as { statusCode?: string; status?: number }).statusCode ?? (error as { status?: number }).status;
    return { ok: false, message: `${status ?? ''} ${error.message}`.trim() };
  }
  return { ok: true, message: `stored ${data?.path}` };
}

async function attempt(id: string, fn: () => Promise<Check>): Promise<Check> {
  try {
    return await fn();
  } catch (e) {
    return { id, pass: false, detail: (e as Error).message };
  }
}

async function main() {
  const checks: Check[] = [];
  let okSlot: Slot | null = null;

  checks.push(
    await attempt('W1-5a-ok', async () => {
      okSlot = await newSlot();
      const r = await upload(okSlot, 'ok.webp', 'image/webp');
      return { id: 'W1-5a-ok', pass: r.ok, detail: r.message };
    }),
    await attempt('W1-5a-big', async () => {
      const r = await upload(await newSlot(), 'big.jpg', 'image/jpeg');
      return { id: 'W1-5a-big', pass: !r.ok, detail: r.ok ? `accepted (${r.message})` : `refused: ${r.message}` };
    }),
    await attempt('W1-5a-svg', async () => {
      const r = await upload(await newSlot(), 'evil.svg', 'image/svg+xml');
      // Recorded only: the same bytes declared as image/webp show whether Storage looks past the declared type.
      const spoofed = await upload(await newSlot(), 'evil.svg', 'image/webp');
      return {
        id: 'W1-5a-svg',
        pass: !r.ok,
        detail: `${r.ok ? `accepted (${r.message})` : `refused: ${r.message}`}; declared as image/webp: ${spoofed.ok ? 'accepted' : `refused: ${spoofed.message}`}`,
      };
    }),
    await attempt('W1-5b', async () => {
      if (!okSlot) return { id: 'W1-5b', pass: false, detail: 'no slot from W1-5a-ok' };
      const r = await upload(okSlot, 'ok.webp', 'image/webp');
      return { id: 'W1-5b', pass: true, detail: `second upload with the same token: ${r.ok ? 'accepted' : `refused: ${r.message}`}` };
    }),
  );

  if (dataApiOff) {
    checks.push(
      await attempt('W1-5c', async () => {
        // Evidence that the Data API really is off for this run (status as returned; its shape is recorded).
        const rest = await fetch(`${supabaseUrl}/rest/v1/`, { headers: { apikey: publishableKey! } });
        const r = await upload(await newSlot(), 'ok.webp', 'image/webp');
        return { id: 'W1-5c', pass: r.ok, detail: `REST root HTTP ${rest.status}; upload ${r.ok ? 'works' : `fails: ${r.message}`}` };
      }),
    );
  }
  printChecks(checks);
}

main();
