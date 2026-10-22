// W1-9d only: `npx drizzle-kit generate --config w1-9d/drizzle.config.ts` writes into w1-9d/migrations
// with Supabase-style names; then `supabase migration list` must accept them (see README).
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './w1-9d/schema.ts',
  out: './w1-9d/migrations',
  migrations: { prefix: 'supabase' },
});
