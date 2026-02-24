import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
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

const defaultTrainingTypes = [
  {
    name: 'Siłowy',
    description: 'Trening z obciążeniem, ćwiczenia z hantlami, sztangą lub na maszynach',
    icon: 'dumbbell',
    isDefault: true,
  },
  {
    name: 'Cardio',
    description: 'Ćwiczenia aerobowe - bieganie, rower, orbitrek',
    icon: 'heart-pulse',
    isDefault: true,
  },
  {
    name: 'HIIT',
    description: 'Trening interwałowy o wysokiej intensywności',
    icon: 'zap',
    isDefault: true,
  },
  {
    name: 'Rozciąganie',
    description: 'Stretching, joga, pilates',
    icon: 'stretch',
    isDefault: true,
  },
  {
    name: 'Pływanie',
    description: 'Ćwiczenia w wodzie - pływanie, aqua aerobik',
    icon: 'waves',
    isDefault: true,
  },
  {
    name: 'Bieganie',
    description: 'Biegi na zewnątrz lub na bieżni',
    icon: 'footprints',
    isDefault: true,
  },
  {
    name: 'Rower',
    description: 'Jazda na rowerze - szosowym, treningowym lub stacjonarnym',
    icon: 'bike',
    isDefault: true,
  },
  {
    name: 'Sporty zespołowe',
    description: 'Piłka nożna, siatkówka, koszykówka i inne',
    icon: 'users',
    isDefault: true,
  },
  {
    name: 'Trening funkcjonalny',
    description: 'Funkcjonalny trening o wysokiej intensywności łączący elementy siłowe i wytrzymałościowe',
    icon: 'flame',
    isDefault: true,
  },
  {
    name: 'Dwubój',
    description: 'Trening siłowy - wyciskanie leżąc i martwy ciąg',
    icon: 'weight',
    isDefault: true,
  },
  {
    name: 'Sporty walki',
    description: 'Boks, MMA, judo, karate, zapasy i inne sztuki walki',
    icon: 'sword',
    isDefault: true,
  },
  {
    name: 'Inne',
    description: 'Inne rodzaje aktywności fizycznej',
    icon: 'activity',
    isDefault: true,
  },
];

async function seed() {
  console.log('Seeding default training types...');

  try {
    for (const trainingType of defaultTrainingTypes) {
      // Check if this default training type already exists
      const [existing] = await db
        .select()
        .from(trainingTypes)
        .where(
          and(
            eq(trainingTypes.name, trainingType.name),
            eq(trainingTypes.isDefault, true)
          )
        )
        .limit(1);

      if (existing) {
        console.log(`Training type "${trainingType.name}" already exists, skipping...`);
        continue;
      }

      await db.insert(trainingTypes).values(trainingType);
      console.log(`Added training type: ${trainingType.name}`);
    }

    console.log('Successfully seeded default training types!');
  } catch (error) {
    console.error('Error seeding training types:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
