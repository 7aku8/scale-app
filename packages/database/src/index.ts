import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://myuser:mypassword@localhost:5432/poultry_db';

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export * from './schema';
