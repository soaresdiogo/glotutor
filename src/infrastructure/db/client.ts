import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://localhost:5432/glotutor';

const pool = new Pool({ connectionString });

export const db = drizzle({ client: pool, schema });
export type DbClient = typeof db;
