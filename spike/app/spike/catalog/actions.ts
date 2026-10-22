'use server';

import { updateTag } from 'next/cache';
import { requireAdminForSpike } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function updateSpikePrice(cents: number): Promise<void> {
  await requireAdminForSpike();
  if (!Number.isInteger(cents) || cents < 0) throw new Error('invalid price');
  await pool.query('select app.spike_set_price($1)', [cents]);
  updateTag('catalog');
}
