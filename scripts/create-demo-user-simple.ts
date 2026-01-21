import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../src/lib/db/schema';
import crypto from 'crypto';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('💡 Run: export DATABASE_URL="your-database-url"');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function createDemoUser() {
  console.log('Creating demo user with verified email...');

  const demoEmail = 'demo@test.pl';
  const userId = crypto.randomUUID();

  try {
    // Utwórz użytkownika z już zweryfikowanym emailem
    await db.insert(users).values({
      id: userId,
      name: 'Demo User',
      email: demoEmail,
      emailVerified: true, // Od razu zweryfikowany
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Demo user created successfully!');
    console.log('');
    console.log('══════════════════════════════════════════════════════════');
    console.log('  👤 Użytkownik: Demo User');
    console.log('  📧 Email:      demo@test.pl');
    console.log('  ✅ Email:      Zweryfikowany');
    console.log('');
    console.log('  ⚠️  Użytkownik nie ma jeszcze hasła!');
    console.log('  💡 Aby ustawić hasło:');
    console.log('     1. Przejdź do: http://localhost:4321/auth/forgot-password');
    console.log('     2. Wpisz email: demo@test.pl');
    console.log('     3. Link do resetowania hasła pojawi się w konsoli serwera');
    console.log('══════════════════════════════════════════════════════════');
    console.log('');
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('❌ Użytkownik demo@test.pl już istnieje!');
    } else {
      console.error('❌ Błąd podczas tworzenia użytkownika:', error);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDemoUser();
