import { randomUUID } from 'node:crypto';
import { pool } from '@/lib/db';

type BookBody = { date?: string; holdMs?: number };
type Row = { r: { code: 'ok' | 'sold_out' }; started: string; ended: string };

// Which function instance served the call, and when the statement started and ended in the database
// (epoch seconds, microsecond precision), so race.ts can tell real concurrency from a queue.
const INSTANCE = randomUUID().slice(0, 8);

export async function POST(request: Request) {
  const { date, holdMs = 0 } = (await request.json().catch(() => ({}))) as BookBody;
  try {
    const { rows } = await pool.query<Row>(
      `select t.r, extract(epoch from statement_timestamp())::text as started, extract(epoch from clock_timestamp())::text as ended
         from (select app.spike_book($1::date, $2::int) as r) t`,
      [date, Math.min(Math.max(Math.trunc(Number(holdMs)) || 0, 0), 200)],
    );
    const { r, started, ended } = rows[0];
    return Response.json({ code: r.code, instance: INSTANCE, started, ended });
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return Response.json({ code: 'error', detail: err.code ?? err.message ?? String(e), instance: INSTANCE }, { status: 500 });
  }
}
