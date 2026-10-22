import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { safeEqual } from '@/lib/timing-safe';

// Behind the job bearer so the public test deployment does not hand out upload slots.
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  const storage = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  }).storage;
  const { data, error } = await storage
    .from('payment-proofs')
    .createSignedUploadUrl(`proofs/${randomUUID()}.webp`, { upsert: false });
  if (error) return Response.json({ error: error.message }, { status: 502 });
  return Response.json({ path: data.path, token: data.token });
}
