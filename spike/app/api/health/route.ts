import { connection } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  await connection();
  const region = process.env.VERCEL_REGION ?? null;
  try {
    const [row] = await query<{ manila_today: string }>(
      "select (now() at time zone 'Asia/Manila')::date::text as manila_today",
    );
    return Response.json({ region, db: 'ok', manilaToday: row.manila_today });
  } catch {
    return Response.json({ region, db: 'error', manilaToday: '' });
  }
}
