'use server';

export async function submitSpikeForm(draft: string): Promise<{ ok: true; length: number }> {
  return { ok: true, length: draft.length };
}
