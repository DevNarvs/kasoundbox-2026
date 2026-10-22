import { randomBytes } from 'node:crypto';
import { auth } from '../lib/auth';
import { pool } from '../lib/db';

// Creates the spike admin through Better Auth's own context, so the hash is made exactly as at login.
// Run: npx tsx --conditions=react-server --env-file=.env.local scripts/seed-admin.ts
async function main() {
  const email = process.env.SPIKE_ADMIN_EMAIL;
  if (!email) throw new Error('Set SPIKE_ADMIN_EMAIL');
  const password = randomBytes(15).toString('base64url'); // 20 characters
  const ctx = await auth.$context;
  const user = await ctx.internalAdapter.createUser(
    { email, name: 'Spike Admin', emailVerified: true },
    { method: 'admin' },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: 'credential',
    accountId: user.id,
    password: await ctx.password.hash(password),
  });
  console.log(`created ${email}; password (shown once): ${password}`);
}

main().finally(() => pool.end());
