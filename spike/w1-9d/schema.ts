// W1-9d only: a one-table schema to see the migration file name drizzle-kit writes.
import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const w19dProbe = pgTable('w19d_probe', {
  id: integer('id').primaryKey(),
  note: text('note'),
});
