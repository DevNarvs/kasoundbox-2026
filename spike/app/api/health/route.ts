import { connection } from 'next/server';
import { query } from '@/lib/db';

// An instant where the Manila date (23 Oct) differs from the UTC date (22 Oct), converted by the database and by
// this function's own Intl data, so W1-1f can tell Manila from UTC at any hour.
const FIXED_INSTANT = '2026-10-22T16:30:00Z';

export async function GET() {
  await connection();
  const region = process.env.VERCEL_REGION ?? null;
  const intl = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date(FIXED_INSTANT));
  try {
    const [row] = await query<{ manila_today: string; fixed: string }>(
      `select (now() at time zone 'Asia/Manila')::date::text as manila_today,
              ($1::timestamptz at time zone 'Asia/Manila')::date::text as fixed`,
      [FIXED_INSTANT],
    );
    return Response.json({ region, db: 'ok', manilaToday: row.manila_today, fixed: { db: row.fixed, intl } });
  } catch {
    return Response.json({ region, db: 'error', manilaToday: '', fixed: { db: '', intl } });
  }
}
