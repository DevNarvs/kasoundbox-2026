'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { unstable_isUnrecognizedActionError } from 'next/navigation';
import { submitSpikeForm } from './actions';

const DRAFT_KEY = 'spike-form-draft';

// W1-9b: no skew protection on Hobby, so a tab opened before a redeploy calls an action the new build
// does not have. The draft is kept in sessionStorage, so it survives the reload.
function isStaleAction(err: unknown): boolean {
  return (
    unstable_isUnrecognizedActionError(err) ||
    /Failed to find Server Action|was not found on the server/i.test(err instanceof Error ? err.message : String(err))
  );
}

export default function FormPage() {
  const draft = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<'idle' | 'sent' | 'stale' | 'error'>('idle');

  useEffect(() => {
    try {
      if (draft.current) draft.current.value = sessionStorage.getItem(DRAFT_KEY) ?? '';
    } catch {
      // Storage blocked: the form still works, the draft just is not kept.
    }
  }, []);

  function save() {
    try {
      sessionStorage.setItem(DRAFT_KEY, draft.current?.value ?? '');
    } catch {}
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await submitSpikeForm(draft.current?.value ?? '');
      setStatus('sent');
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
    } catch (err) {
      setStatus(isStaleAction(err) ? 'stale' : 'error');
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-lg font-semibold">Form (spike)</h1>
      <form onSubmit={submit} className="space-y-2">
        <textarea ref={draft} name="draft" onInput={save} rows={4} className="block w-full rounded border px-2 py-1" />
        <button type="submit" className="rounded border px-3 py-1">
          Submit
        </button>
      </form>
      {status === 'sent' && <p>Sent.</p>}
      {status === 'error' && <p role="alert">Something went wrong. Please try again.</p>}
      {status === 'stale' && (
        <p role="alert">
          A new version is available —{' '}
          <button type="button" onClick={() => window.location.reload()} className="underline">
            reload
          </button>
        </p>
      )}
    </main>
  );
}
