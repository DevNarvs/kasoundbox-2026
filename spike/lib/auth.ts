import { hash, verify } from '@node-rs/argon2';
import { betterAuth } from 'better-auth';
import { headers } from 'next/headers';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pool } from '@/lib/db';
import { account, session, twoFactor as twoFactorTable, user, verification } from '@/lib/auth-schema';

// argon2id is the library default; parameters from Global Constraints (OWASP minimum).
const ARGON2 = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export const auth = betterAuth({
  baseURL: process.env.SITE_URL,
  trustedOrigins: process.env.SITE_URL ? [process.env.SITE_URL] : [],
  database: drizzleAdapter(drizzle({ client: pool }), {
    provider: 'pg',
    schema: { user, session, account, verification, twoFactor: twoFactorTable },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    password: {
      hash: (password) => hash(password, ARGON2),
      verify: ({ hash: stored, password }) => verify(stored, password),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: false },
  },
  advanced: {
    useSecureCookies: true,
    defaultCookieAttributes: { httpOnly: true, secure: true, sameSite: 'strict' },
    // No raw IP on session rows (NFR-13). It also leaves the built-in limiter keyless, so it never limits.
    ipAddress: { disableIpTracking: true },
  },
  telemetry: { enabled: false },
  plugins: [twoFactor({ issuer: 'DJB Kasoundbox', backupCodeOptions: { storeBackupCodes: 'encrypted' } })],
});

export async function requireAdminForSpike(): Promise<{ userId: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('unauthorized');
  return { userId: session.user.id };
}
