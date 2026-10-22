import { cacheTag } from 'next/cache';
import { query } from '@/lib/db';
import { updateSpikePrice } from './actions';

// Cached and tagged, so the page shell is prerendered with the price (W1-9a: does updateTag refresh it?).
async function getPrice(): Promise<number> {
  'use cache';
  cacheTag('catalog');
  const rows = await query<{ cents: number }>('select cents from app.spike_price where id = 1');
  return rows[0].cents;
}

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default async function CatalogPage() {
  const cents = await getPrice();
  return (
    <main className="space-y-4 p-6">
      <h1 className="text-lg font-semibold">Catalog (spike)</h1>
      <p data-price={cents}>Package A: {peso.format(cents / 100)}</p>
      <form
        action={async (form: FormData) => {
          'use server';
          await updateSpikePrice(Number(form.get('cents')));
        }}
        className="space-x-2"
      >
        <input name="cents" type="number" min="0" step="1" required className="rounded border px-2 py-1" />
        <button type="submit" className="rounded border px-3 py-1">
          Update price (centavos, admin only)
        </button>
      </form>
    </main>
  );
}
