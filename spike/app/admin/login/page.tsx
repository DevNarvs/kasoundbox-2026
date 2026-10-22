'use client';

import { useState, type FormEvent } from 'react';
import { createAuthClient } from 'better-auth/react';
import { twoFactorClient } from 'better-auth/client/plugins';

const authClient = createAuthClient({ plugins: [twoFactorClient()] });

type Step = 'password' | 'enroll' | 'totp' | 'done';
type Enrollment = { uri: string; secret: string; backupCodes: string[] };

const input = 'block w-full rounded border px-2 py-1';
const button = 'rounded border px-3 py-1';

// Spike login: email and password, then a TOTP code. A first login enrolls the authenticator app.
export default function LoginPage() {
  const [step, setStep] = useState<Step>('password');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const pw = String(form.get('password'));
    const { data, error } = await authClient.signIn.email({ email: String(form.get('email')), password: pw });
    if (error) return setError(error.message ?? 'Sign-in failed');
    setPassword(pw);
    setStep(data && 'twoFactorRedirect' in data && data.twoFactorRedirect ? 'totp' : 'enroll');
  }

  async function enroll() {
    setError('');
    const { data, error } = await authClient.twoFactor.enable({ password });
    if (error || !data || !('totpURI' in data)) return setError(error?.message ?? 'Could not start enrollment');
    const secret = new URL(data.totpURI).searchParams.get('secret') ?? '';
    setEnrollment({ uri: data.totpURI, secret, backupCodes: data.backupCodes });
  }

  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const code = String(new FormData(e.currentTarget).get('code'));
    const { error } = await authClient.twoFactor.verifyTotp({ code });
    if (error) return setError(error.message ?? 'Wrong code');
    setStep('done');
  }

  const codeForm = (
    <form onSubmit={verify} className="space-y-2">
      <label className="block">
        6-digit code
        <input name="code" inputMode="numeric" autoComplete="one-time-code" required className={input} />
      </label>
      <button type="submit" className={button}>
        Verify
      </button>
    </form>
  );

  return (
    <main className="mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-lg font-semibold">Admin login (spike)</h1>
      {error && <p role="alert">{error}</p>}

      {step === 'password' && (
        <form onSubmit={signIn} className="space-y-2">
          <label className="block">
            Email
            <input name="email" type="email" autoComplete="username" required className={input} />
          </label>
          <label className="block">
            Password
            <input name="password" type="password" autoComplete="current-password" required className={input} />
          </label>
          <button type="submit" className={button}>
            Sign in
          </button>
        </form>
      )}

      {step === 'enroll' && !enrollment && (
        <button type="button" onClick={enroll} className={button}>
          Set up the authenticator app
        </button>
      )}

      {step === 'enroll' && enrollment && (
        <div className="space-y-2">
          <p>Add this key to the authenticator app, then enter its first code. Keep the key for check-auth.ts.</p>
          <p className="break-all font-mono">{enrollment.secret}</p>
          <p className="break-all text-xs">{enrollment.uri}</p>
          <p>Backup codes (shown once):</p>
          <ul className="font-mono">
            {enrollment.backupCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {codeForm}
        </div>
      )}

      {step === 'totp' && codeForm}

      {step === 'done' && (
        <p>
          Signed in. <a href="/admin/spike-action">Protected action page</a>
        </p>
      )}
    </main>
  );
}
