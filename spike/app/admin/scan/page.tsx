'use client';

import { useState, type ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import type { IScannerError } from '@yudiel/react-qr-scanner';

// The WASM is served from /zxing/ (the library's default is a CDN). Called before any decode.
async function loadZXing() {
  const ponyfill = await import('barcode-detector/ponyfill');
  ponyfill.prepareZXingModule({
    overrides: { locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? `/zxing/${path}` : prefix + path) },
  });
  return ponyfill;
}

// The scanner code loads only on this page, in the browser.
const Scanner = dynamic(
  async () => {
    await loadZXing();
    return (await import('@yudiel/react-qr-scanner')).Scanner;
  },
  { ssr: false, loading: () => <p>Loading scanner…</p> },
);

// The library's default asks for at least 640×640, which a 480p laptop camera refuses ("overconstrained").
const CONSTRAINTS: MediaTrackConstraints = { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } };

// Only our own /r/<token> links on this host count.
function tokenFrom(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.host !== window.location.host) return null;
    return url.pathname.match(/^\/r\/([A-Za-z0-9_-]{16,})$/)?.[1] ?? null;
  } catch {
    return null;
  }
}

export default function ScanPage() {
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [cameraError, setCameraError] = useState<IScannerError | null>(null);

  function handle(raw: string | undefined) {
    const t = raw ? tokenFrom(raw) : null;
    if (t) {
      setToken(t);
      setMessage('');
    } else {
      setMessage(raw ? 'Not one of our QR codes' : 'No QR code found');
    }
  }

  async function decodeScreenshot(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { BarcodeDetector } = await loadZXing();
    const codes = await new BarcodeDetector({ formats: ['qr_code'] }).detect(file);
    handle(codes[0]?.rawValue);
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-lg font-semibold">Scan a QR code (spike)</h1>
      {!cameraError && !token && (
        <Scanner
          constraints={CONSTRAINTS}
          formats={['qr_code']}
          sound={false}
          onScan={(codes) => handle(codes[0]?.rawValue)}
          onError={(err) => setCameraError(err)}
        />
      )}
      {cameraError && (
        <div className="space-y-2">
          <p>
            {cameraError.kind === 'permission-denied'
              ? 'Camera blocked — upload a screenshot instead'
              : `Camera unavailable (${cameraError.kind}) — upload a screenshot instead`}
          </p>
          <input type="file" accept="image/*" onChange={decodeScreenshot} />
        </div>
      )}
      {message && <p role="alert">{message}</p>}
      {token && (
        <p data-token={token}>
          Token: <span className="break-all font-mono">{token}</span>
        </p>
      )}
    </main>
  );
}
