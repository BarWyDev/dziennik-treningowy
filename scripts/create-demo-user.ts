import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

// Funkcja do hashowania hasła (format Better Auth z bcrypt)
async function hashPassword(password: string): Promise<string> {
  // Better Auth używa bcrypt, ale możemy użyć scrypt dla prostoty
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}.${derivedKey.toString('hex')}`;
}

async function createDemoUser() {
  console.log('Creating demo user...');

  const demoEmail = 'demo@example.com';
  const demoPassword = 'Demo123!';
  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();

  try {
    // Sprawdź, czy użytkownik już istnieje
    const existingUsers = await db
      .select()
      .from(users)
      .where((users) => users.email === demoEmail)
      .limit(1);

    if (existingUsers.length > 0) {
      console.log('Demo user already exists!');
      console.log('Email:', demoEmail);
      console.log('Password:', demoPassword);
      return;
    }

    // Utwórz użytkownika
    await db.insert(users).values({
      id: userId,
      name: 'Demo User',
      email: demoEmail,
      emailVerified: true, // Od razu zweryfikowany
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Utwórz konto z hasłem
    const hashedPassword = await hashPassword(demoPassword);
    await db.insert(accounts).values({
      id: accountId,
      accountId: demoEmail,
      providerId: 'credential',
      userId: userId,
      accessToken: hashedPassword, // Better Auth przechowuje hasło w accessToken dla credential provider
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Demo user created successfully!');
    console.log('');
    console.log('═══════════════════════════════════');
    console.log('📧 Email:    demo@example.com');
    console.log('🔑 Password: Demo123!');
    console.log('═══════════════════════════════════');
    console.log('');
    console.log('You can now login at: http://localhost:4321/auth/login');
  } catch (error) {
    console.error('Error creating demo user:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDemoUser();
