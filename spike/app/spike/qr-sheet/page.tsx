import { randomBytes } from 'node:crypto';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { renderSVG } from 'uqr';

// Five QR links with fresh random tokens, to scan from a screen and from paper (W1-6a).
async function Codes() {
  await connection();
  const urls = Array.from({ length: 5 }, () => `${process.env.SITE_URL}/r/${randomBytes(24).toString('base64url')}`);
  return (
    <ol className="grid gap-8 sm:grid-cols-2">
      {urls.map((url) => (
        <li key={url} data-qr-url={url} className="space-y-2">
          <div className="w-56" dangerouslySetInnerHTML={{ __html: renderSVG(url, { ecc: 'M' }) }} />
          <p className="break-all font-mono text-xs">{url}</p>
        </li>
      ))}
    </ol>
  );
}

export default function QrSheetPage() {
  return (
    <main className="space-y-4 p-6">
      <h1 className="text-lg font-semibold">QR sheet (spike)</h1>
      <Suspense fallback={null}>
        <Codes />
      </Suspense>
    </main>
  );
}
