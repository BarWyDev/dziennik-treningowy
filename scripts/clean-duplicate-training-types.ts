import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and, inArray, sql } from 'drizzle-orm';
import postgres from 'postgres';
import { trainingTypes } from '../src/lib/db/schema';

// Load environment variables from .env file
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function cleanDuplicates() {
  console.log('Cleaning duplicate default training types...');

  try {
    // Get all default training types
    const allDefaultTypes = await db
      .select()
      .from(trainingTypes)
      .where(eq(trainingTypes.isDefault, true))
      .orderBy(trainingTypes.name, trainingTypes.createdAt);

    // Group by name to find duplicates
    const typesByName = new Map<string, typeof allDefaultTypes>();

    for (const type of allDefaultTypes) {
      if (!typesByName.has(type.name)) {
        typesByName.set(type.name, []);
      }
      typesByName.get(type.name)!.push(type);
    }

    // For each group, keep the first one and delete the rest
    let totalDeleted = 0;

    for (const [name, types] of typesByName.entries()) {
      if (types.length > 1) {
        console.log(`Found ${types.length} duplicates of "${name}"`);

        // Keep the first one, delete the rest
        const toDelete = types.slice(1).map(t => t.id);

        if (toDelete.length > 0) {
          await db
            .delete(trainingTypes)
            .where(inArray(trainingTypes.id, toDelete));

          console.log(`  Deleted ${toDelete.length} duplicate(s) of "${name}"`);
          totalDeleted += toDelete.length;
        }
      }
    }

    console.log(`\nCleaning complete! Deleted ${totalDeleted} duplicate training types.`);
  } catch (error) {
    console.error('Error cleaning duplicates:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanDuplicates();
