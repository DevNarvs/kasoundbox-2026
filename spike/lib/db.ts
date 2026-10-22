import 'server-only';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';

const globalForPool = globalThis as unknown as { spikePool?: Pool };

// Transaction pooler (port 6543); sslmode stays out of DATABASE_URL so the ssl object wins.
export const pool =
  globalForPool.spikePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    min: 0,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 5_000,
    query_timeout: 10_000,
    ssl: { ca: process.env.SUPABASE_DB_CA, rejectUnauthorized: true },
  });

if (!globalForPool.spikePool) {
  globalForPool.spikePool = pool;
  attachDatabasePool(pool);
}

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}
