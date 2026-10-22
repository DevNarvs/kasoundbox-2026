import { pool } from '@/lib/db';

type BookBody = { date?: string };

export async function POST(request: Request) {
  const { date } = (await request.json().catch(() => ({}))) as BookBody;
  try {
    const { rows } = await pool.query<{ r: { code: 'ok' | 'sold_out' } }>('select app.spike_book($1::date) as r', [date]);
    return Response.json({ code: rows[0].r.code });
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return Response.json({ code: 'error', detail: err.code ?? err.message ?? String(e) }, { status: 500 });
  }
}
