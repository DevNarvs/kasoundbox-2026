'use server';

import { requireAdminForSpike } from '@/lib/auth';

export async function spikeProtectedAction(): Promise<{ ok: true }> {
  await requireAdminForSpike();
  return { ok: true };
}
