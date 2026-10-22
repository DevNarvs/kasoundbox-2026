import { Suspense } from 'react';

type Props = { searchParams: Promise<{ mode?: string; stamp?: string }> };

// W1-9e: /spike/sentry?mode=cached&stamp=<n> throws inside a 'use cache' function; mode=live throws while rendering.
async function explodeCached(stamp: string): Promise<string> {
  'use cache';
  throw new Error(`W1-9e test error from a cached function (${stamp})`);
}

async function Boom({ searchParams }: Props) {
  const { mode, stamp = '' } = await searchParams;
  if (mode === 'cached') return <p>{await explodeCached(stamp)}</p>;
  if (mode === 'live') throw new Error(`W1-9e test error from a live render (${stamp})`);
  return <p>Add ?mode=cached or ?mode=live, with a new &amp;stamp= each time.</p>;
}

export default function SentryTestPage(props: Props) {
  return (
    <main className="p-6">
      <Suspense fallback={null}>
        <Boom {...props} />
      </Suspense>
    </main>
  );
}
