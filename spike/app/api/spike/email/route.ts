import { after, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { safeEqual } from '@/lib/timing-safe';

type EmailBody = { key?: string; to?: string | string[] };

// Behind the job bearer so the test deployment is not an open mail relay.
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { key, to } = (await request.json().catch(() => ({}))) as EmailBody;
  if (!key || !to) return Response.json({ error: 'key and to are required' }, { status: 400 });

  const res = await fetch(`${process.env.SPIKE_RESEND_URL ?? 'https://api.resend.com'}/emails`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'content-type': 'application/json',
      'idempotency-key': key,
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject: 'Kasoundbox spike email', text: `Probe key ${key}` }),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  const usage = Object.fromEntries([...res.headers].filter(([name]) => /quota|ratelimit/i.test(name)));

  // Runs once the response has been sent; the 2 s delay makes "after the reply" visible in the timestamps.
  after(async () => {
    await new Promise((r) => setTimeout(r, 2_000));
    await pool.query('select app.spike_log_job($1, $2, $3)', ['after', 'vercel', key]);
  });

  if (!res.ok) return Response.json({ error: body.message ?? `resend HTTP ${res.status}`, usage }, { status: 502 });
  return Response.json({ id: body.id, usage });
}
