import { connection, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { safeEqual } from '@/lib/timing-safe';

export const maxDuration = 60;

// Vercel Cron sends GET; pg_net sends POST. ?sleep=<s> (max 50) delays the work, for the pg_net timeout probe.
async function handle(request: NextRequest) {
  await connection();
  const secret = process.env.CRON_SECRET;
  const bearer = request.headers.get('authorization') ?? '';
  if (!secret || !safeEqual(bearer, `Bearer ${secret}`)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const params = request.nextUrl.searchParams;
  const seconds = Math.min(Number(params.get('sleep')) || 0, 50);
  if (seconds > 0) await new Promise((r) => setTimeout(r, seconds * 1000));
  await pool.query('select app.spike_log_job($1, $2, $3)', [
    'tick',
    params.get('source') ?? 'unknown',
    params.get('note') ?? request.headers.get('user-agent'),
  ]);
  return Response.json({ ok: true });
}

export const GET = handle;
export const POST = handle;
