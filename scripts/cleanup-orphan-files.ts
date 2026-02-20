import { config } from 'dotenv';
import { readdir, stat, rm } from 'node:fs/promises';
import * as path from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { mediaAttachments } from '../src/lib/db/schema';

config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function getFilesRecursive(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await getFilesRecursive(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
  } catch {
    // Katalog nie istnieje lub brak dostępu
  }
  return files;
}

async function main() {
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  const cutoffMs = 24 * 60 * 60 * 1000; // 24 godziny
  const cutoffDate = new Date(Date.now() - cutoffMs);

  console.log('[Cleanup] Szukam osieroconych plików w:', uploadsDir);
  console.log('[Cleanup] Próg wiekowy:', cutoffDate.toISOString());

  // Pobierz wszystkie pliki z FS
  const allFiles = await getFilesRecursive(uploadsDir);
  console.log(`[Cleanup] Znaleziono ${allFiles.length} plików w FS`);

  if (allFiles.length === 0) {
    console.log('[Cleanup] Brak plików do sprawdzenia. Koniec.');
    await client.end();
    return;
  }

  // Pobierz wszystkie fileUrl z bazy
  const dbRecords = await db.select({ fileUrl: mediaAttachments.fileUrl }).from(mediaAttachments);
  const dbUrls = new Set(dbRecords.map((r) => r.fileUrl));
  console.log(`[Cleanup] Znaleziono ${dbUrls.size} rekordów w bazie`);

  let deleted = 0;
  let skipped = 0;
  let errors = 0;

  for (const filePath of allFiles) {
    // Przekształć ścieżkę FS na URL (format zgodny z fileUrl w bazie)
    const relativePath = filePath
      .replace(uploadsDir, '')
      .replace(/\\/g, '/');
    const fileUrl = `/api/files${relativePath}`;

    if (dbUrls.has(fileUrl)) {
      skipped++;
      continue;
    }

    // Sprawdź wiek pliku — nie usuwaj świeżych (mogą być w trakcie zapisu)
    try {
      const fileStat = await stat(filePath);
      if (fileStat.mtime > cutoffDate) {
        skipped++;
        continue;
      }
    } catch {
      errors++;
      continue;
    }

    // Usuń osierocony plik
    try {
      await rm(filePath);
      console.log(`[Cleanup] Usunięto: ${fileUrl}`);
      deleted++;
    } catch (error) {
      console.error(`[Cleanup] Błąd usuwania ${filePath}:`, error);
      errors++;
    }
  }

  console.log(
    `[Cleanup] Zakończono. Usunięto: ${deleted}, pominięto: ${skipped}, błędy: ${errors}`
  );

  await client.end();
}

main().catch((error) => {
  console.error('[Cleanup] Krytyczny błąd:', error);
  process.exit(1);
});
