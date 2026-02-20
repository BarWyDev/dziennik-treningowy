import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString, {
  max: 5,           // mws03.mikr.us to współdzielona baza - 5 połączeń wystarczy
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 15, // szybszy timeout dla zewnętrznej bazy
});

export const db = drizzle(client, { schema });

export * from './schema';
