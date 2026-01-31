# Koncepcja: Załączniki wideo do treningów i rekordów osobistych

**Status:** Do rozważenia w przyszłości
**Data analizy:** 2026-01-23
**Priorytet:** Poza zakresem MVP

---

## Streszczenie

Dokument zawiera analizę i propozycję implementacji funkcjonalności załączania plików wideo do treningów i rekordów osobistych w aplikacji Dziennik Treningowy.

**Kluczowe wnioski:**
- Zalecane rozwiązanie: **Cloudflare R2** (kompatybilne z S3, darmowe do 10GB)
- Koszt szacowany: ~6 zł/miesiąc dla 100 użytkowników
- Upload bezpośrednio z przeglądarki (nie obciąża serwera Mikrus)
- Implementacja wymaga ~3-5 dni pracy

---

## Kontekst i wyzwania

### Obecny stan aplikacji
- MVP skupia się na tekstowych zapisach treningów i rekordów
- Serwer Mikrus 2.1: 1GB RAM, 10GB dysku (ograniczone zasoby)
- PostgreSQL jako baza danych
- Astro 5 + React 19 frontend

### Wyzwania z obsługą wideo
- **Duże pliki:** 50MB-500MB typowo dla wideo treningowych
- **Limit dysku:** 10GB na Mikrus → lokalne przechowywanie nieefektywne
- **RAM:** 1GB → przetwarzanie wideo obciążające serwer
- **Brak CDN:** Wolne ładowanie bez dedykowanej infrastruktury

### Przypadki użycia
- Nagrywanie formy wykonania ćwiczenia (technika)
- Dokumentowanie rekordów osobistych (np. deadlift 200kg)
- Analiza postępów w czasie (porównanie nagrań)
- Dzielenie się osiągnięciami (opcjonalnie w przyszłości)

---

## Rekomendowana architektura

### Opcja A: Cloudflare R2 + Presigned URLs (ZALECANA)

**Dlaczego to najlepsze rozwiązanie:**
✅ Koszt: Darmowe do 10GB storage, $0.015/GB powyżej
✅ Brak opłat za transfer wyjściowy (egress) - główna zaleta vs S3
✅ Kompatybilność S3 - używamy AWS SDK
✅ Upload bezpośrednio z przeglądarki - nie obciąża serwera Mikrus
✅ Presigned URLs - bezpieczne, tymczasowe uprawnienia do uploadu

**Koszty dla różnych scenariuszy:**
```
Scenariusz 1: 50 użytkowników, 5 wideo każdy (100MB średnio)
- Storage: 25GB = $0.38/miesiąc
- Operacje: ~250 uploadów/miesiąc = $0.001
- RAZEM: ~$0.38/miesiąc (~1.50 zł)

Scenariusz 2: 100 użytkowników, 10 wideo każdy (100MB średnio)
- Storage: 100GB = $1.50/miesiąc
- Operacje: ~1000 uploadów/miesiąc = $0.005
- RAZEM: ~$1.50/miesiąc (~6 zł)

Scenariusz 3: 500 użytkowników, 20 wideo każdy (150MB średnio)
- Storage: 1500GB = $22.50/miesiąc
- Operacje: ~10000 uploadów/miesiąc = $0.045
- RAZEM: ~$22.50/miesiąc (~90 zł)
```

**Alternatywne opcje rozważane:**

### Opcja B: Supabase Storage
- ✅ Łatwiejsza konfiguracja niż R2
- ✅ Darmowe 1GB storage
- ⚠️ Może być za mało dla większej liczby użytkowników
- ❌ Opłaty za transfer ($0.09/GB po przekroczeniu limitu)

### Opcja C: YouTube (unlisted videos)
- ✅ Całkowicie darmowe
- ✅ Nieograniczone storage
- ❌ Wymaga konta YouTube dla każdego użytkownika
- ❌ Brak kontroli nad plikami (mogą być usunięte przez Google)
- ❌ Gorsze UX (redirect do YouTube)

### Opcja D: Lokalne przechowywanie (Mikrus)
- ❌ NIE ZALECANE - 10GB limit dysku
- ❌ Brak redundancji (utrata danych przy awarii)
- ✅ Możliwe tylko dla 5-10 wideo na całą aplikację

---

## Szczegóły implementacji

### 1. Rozszerzenie schematu bazy danych

```typescript
// src/lib/db/schema.ts

export const videoAttachments = pgTable('video_attachments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Powiązanie z treningiem LUB rekordem (jedno z dwóch)
  trainingId: text('training_id').references(() => trainings.id, { onDelete: 'cascade' }),
  personalRecordId: text('personal_record_id').references(() => personalRecords.id, { onDelete: 'cascade' }),

  // Metadane pliku
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(), // w bajtach
  mimeType: text('mime_type').notNull(), // video/mp4, video/webm, video/quicktime
  duration: integer('duration'), // w sekundach (opcjonalne, wymaga przetwarzania)

  // Storage w R2
  storageKey: text('storage_key').notNull(), // unikalny klucz w bucket
  storageUrl: text('storage_url').notNull(), // publiczny URL do odtwarzania
  thumbnailUrl: text('thumbnail_url'), // miniaturka wideo (opcjonalne)

  // Timestamps
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),

  // Opcjonalne pole opisowe
  description: text('description'), // max 500 znaków
});

// Constraint aplikacyjny (nie DB):
// - Musi być powiązane z treningId LUB personalRecordId (nie oba, nie żadne)
// - Max 5 wideo na trening/rekord (limit aplikacyjny)
```

**Indeksy do dodania:**
```sql
CREATE INDEX idx_video_attachments_training_id ON video_attachments(training_id);
CREATE INDEX idx_video_attachments_personal_record_id ON video_attachments(personal_record_id);
CREATE INDEX idx_video_attachments_user_id ON video_attachments(user_id);
```

### 2. Konfiguracja Cloudflare R2

**Kroki setup (jednorazowe):**

1. **Załóż konto Cloudflare** (darmowe)
   - Przejdź do https://dash.cloudflare.com/sign-up
   - Weryfikuj email

2. **Utwórz R2 bucket**
   - Dashboard → R2 → Create bucket
   - Nazwa: `training-diary-videos`
   - Region: Automatic (najbliższe użytkownikom)

3. **Wygeneruj API credentials**
   - R2 → Manage R2 API Tokens
   - Create API Token
   - Permissions: Object Read & Write
   - Zapisz: Access Key ID + Secret Access Key

4. **Skonfiguruj CORS** (pozwala na upload z przeglądarki)
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:4321", "https://your-domain.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. **Opcjonalnie: Publiczny dostęp**
   - Settings → Public Access → Enable
   - Pozwala na odtwarzanie wideo bez presigned URLs (prostsze)

**Dodaj do `.env`:**
```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=training-diary-videos
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev  # Jeśli public access enabled
```

### 3. Instalacja dependencies

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Rozmiar pakietów:**
- @aws-sdk/client-s3: ~500KB (gzipped)
- @aws-sdk/s3-request-presigner: ~50KB (gzipped)

### 4. Serwis do zarządzania wideo

```typescript
// src/lib/video-storage.ts

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${import.meta.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = import.meta.env.R2_BUCKET_NAME;
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * Generuje presigned URL do uploadu wideo (ważny 1h)
 * Upload wykonuje się bezpośrednio z przeglądarki do R2
 */
export async function generatePresignedUploadUrl(
  key: string,
  mimeType: string,
  expiresIn = 3600 // 1 hour
): Promise<string> {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error('Unsupported video type. Allowed: MP4, WebM, QuickTime');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Usuwa wideo z R2 bucket
 */
export async function deleteVideo(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Zwraca publiczny URL do wideo (wymaga public access w bucket)
 */
export function getPublicUrl(key: string): string {
  return `${import.meta.env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Generuje unikalny klucz storage dla wideo
 * Format: {type}/{userId}/{timestamp}-{random}
 */
export function generateStorageKey(
  userId: string,
  type: 'training' | 'record'
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${type}/${userId}/${timestamp}-${random}`;
}
```

### 5. API Endpoints

**Endpoint 1: Generowanie presigned URL do uploadu**

```typescript
// src/pages/api/videos/upload-url.ts

import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth';
import { generatePresignedUploadUrl, generateStorageKey, getPublicUrl } from '@/lib/video-storage';
import { z } from 'zod';

const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string(),
  fileSize: z.number().min(1).max(500 * 1024 * 1024), // 500MB max
  attachTo: z.enum(['training', 'record']),
  entityId: z.string().uuid(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, mimeType, fileSize, attachTo, entityId } = uploadRequestSchema.parse(body);

    // Generuj unikalny klucz storage
    const storageKey = generateStorageKey(session.user.id, attachTo);

    // Generuj presigned URL (ważny 1h)
    const uploadUrl = await generatePresignedUploadUrl(storageKey, mimeType);
    const publicUrl = getPublicUrl(storageKey);

    return new Response(
      JSON.stringify({
        uploadUrl,      // Tutaj frontend wykona PUT request
        storageKey,     // Do zapisania w bazie po udanym upload
        publicUrl,      // URL do odtwarzania wideo
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate upload URL' }),
      { status: 500 }
    );
  }
};
```

**Endpoint 2: CRUD dla video metadata**

```typescript
// src/pages/api/videos/index.ts

import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { videoAttachments, trainings, personalRecords } from '@/lib/db/schema';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

const createVideoSchema = z.object({
  trainingId: z.string().uuid().optional(),
  personalRecordId: z.string().uuid().optional(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().min(1),
  mimeType: z.string(),
  duration: z.number().optional(),
  storageKey: z.string(),
  storageUrl: z.string().url(),
  description: z.string().max(500).optional(),
}).refine(
  (data) => !!(data.trainingId || data.personalRecordId),
  { message: 'Must provide either trainingId or personalRecordId' }
).refine(
  (data) => !(data.trainingId && data.personalRecordId),
  { message: 'Cannot provide both trainingId and personalRecordId' }
);

// POST - Zapisz metadata po zakończeniu uploadu
export const POST: APIRoute = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createVideoSchema.parse(body);

    // Sprawdź ownership treningu/rekordu
    if (data.trainingId) {
      const training = await db.query.trainings.findFirst({
        where: and(
          eq(trainings.id, data.trainingId),
          eq(trainings.userId, session.user.id)
        ),
      });
      if (!training) {
        return new Response(JSON.stringify({ error: 'Training not found' }), { status: 404 });
      }
    }

    if (data.personalRecordId) {
      const record = await db.query.personalRecords.findFirst({
        where: and(
          eq(personalRecords.id, data.personalRecordId),
          eq(personalRecords.userId, session.user.id)
        ),
      });
      if (!record) {
        return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404 });
      }
    }

    // Sprawdź limit wideo (max 5 na trening/rekord)
    const existingCount = await db.query.videoAttachments.findMany({
      where: and(
        eq(videoAttachments.userId, session.user.id),
        data.trainingId
          ? eq(videoAttachments.trainingId, data.trainingId)
          : eq(videoAttachments.personalRecordId, data.personalRecordId!)
      ),
    });

    if (existingCount.length >= 5) {
      return new Response(
        JSON.stringify({ error: 'Maximum 5 videos per training/record' }),
        { status: 400 }
      );
    }

    // Zapisz w bazie
    const [video] = await db.insert(videoAttachments).values({
      userId: session.user.id,
      ...data,
    }).returning();

    return new Response(JSON.stringify(video), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating video attachment:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create video attachment' }),
      { status: 500 }
    );
  }
};

// GET - Pobierz wszystkie wideo dla treningu/rekordu
export const GET: APIRoute = async ({ request, url }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const trainingId = url.searchParams.get('trainingId');
  const recordId = url.searchParams.get('recordId');

  if (!trainingId && !recordId) {
    return new Response(
      JSON.stringify({ error: 'Must provide trainingId or recordId' }),
      { status: 400 }
    );
  }

  try {
    const videos = await db.query.videoAttachments.findMany({
      where: and(
        eq(videoAttachments.userId, session.user.id),
        trainingId
          ? eq(videoAttachments.trainingId, trainingId)
          : eq(videoAttachments.personalRecordId, recordId!)
      ),
      orderBy: (videos, { desc }) => [desc(videos.uploadedAt)],
    });

    return new Response(JSON.stringify(videos), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch videos' }),
      { status: 500 }
    );
  }
};
```

**Endpoint 3: Usuwanie wideo**

```typescript
// src/pages/api/videos/[id].ts

import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { videoAttachments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { deleteVideo } from '@/lib/video-storage';

export const DELETE: APIRoute = async ({ request, params }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const videoId = params.id;

  try {
    // Pobierz wideo i sprawdź ownership
    const video = await db.query.videoAttachments.findFirst({
      where: and(
        eq(videoAttachments.id, videoId!),
        eq(videoAttachments.userId, session.user.id)
      ),
    });

    if (!video) {
      return new Response(JSON.stringify({ error: 'Video not found' }), { status: 404 });
    }

    // Usuń z R2
    await deleteVideo(video.storageKey);

    // Usuń z bazy danych
    await db.delete(videoAttachments).where(eq(videoAttachments.id, videoId!));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete video' }),
      { status: 500 }
    );
  }
};
```

### 6. Komponenty React

**Komponent 1: VideoUploader - Upload wideo z progress bar**

```tsx
// src/components/features/videos/VideoUploader.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { UploadIcon, AlertCircleIcon } from 'lucide-react';

interface VideoUploaderProps {
  entityId: string;
  entityType: 'training' | 'record';
  onUploadComplete: () => void;
}

export function VideoUploader({ entityId, entityType, onUploadComplete }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset stanu
    setError(null);
    setProgress(0);

    // Walidacja rozmiaru
    if (file.size > 500 * 1024 * 1024) {
      setError('Plik jest zbyt duży. Maksymalny rozmiar to 500MB.');
      return;
    }

    // Walidacja typu
    if (!file.type.startsWith('video/')) {
      setError('Wybierz plik wideo (MP4, WebM, MOV)');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Krok 1: Pobierz presigned URL z backendu
      console.log('[Upload] Step 1: Requesting presigned URL...');
      const urlResponse = await fetch('/api/videos/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          attachTo: entityType,
          entityId,
        }),
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, storageKey, publicUrl } = await urlResponse.json();
      console.log('[Upload] Step 2: Got presigned URL, uploading to R2...');

      // Krok 2: Upload pliku bezpośrednio do R2 z tracking progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Progress tracking
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setProgress(percentComplete);
            console.log(`[Upload] Progress: ${percentComplete}%`);
          }
        });

        // Success
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            console.log('[Upload] Step 3: Upload successful');
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        // Error
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        // Timeout (10 minutes)
        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout - plik jest zbyt duży lub połączenie zbyt wolne'));
        });

        xhr.timeout = 600000; // 10 min
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // Krok 3: Zapisz metadata w bazie danych
      console.log('[Upload] Step 4: Saving metadata to database...');
      const metadataResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [entityType === 'training' ? 'trainingId' : 'personalRecordId']: entityId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          storageKey,
          storageUrl: publicUrl,
        }),
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw new Error(errorData.error || 'Failed to save video metadata');
      }

      console.log('[Upload] Complete! Calling onUploadComplete...');
      onUploadComplete();

      // Reset input
      e.target.value = '';
    } catch (error) {
      console.error('[Upload] Error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Nie udało się przesłać wideo. Spróbuj ponownie.'
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id={`video-upload-${entityId}`}
      />

      <label htmlFor={`video-upload-${entityId}`}>
        <Button
          as="span"
          disabled={uploading}
          className="cursor-pointer"
          type="button"
        >
          <UploadIcon className="w-4 h-4 mr-2" />
          {uploading ? `Przesyłanie... ${progress}%` : 'Dodaj wideo'}
        </Button>
      </label>

      {uploading && (
        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {progress < 100 ? 'Przesyłanie...' : 'Zapisywanie...'}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Maksymalny rozmiar pliku: 500MB. Obsługiwane formaty: MP4, WebM, MOV
      </p>
    </div>
  );
}
```

**Komponent 2: VideoList - Wyświetlanie i zarządzanie wideo**

```tsx
// src/components/features/videos/VideoList.tsx

import { useState, useEffect } from 'react';
import { TrashIcon, DownloadIcon, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Video {
  id: string;
  fileName: string;
  storageUrl: string;
  fileSize: number;
  uploadedAt: string;
  description?: string;
  mimeType: string;
}

interface VideoListProps {
  entityId: string;
  entityType: 'training' | 'record';
  refresh: number; // Zmiana tego triggera odświeżenie
}

export function VideoList({ entityId, entityType, refresh }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [entityId, refresh]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const param = entityType === 'training' ? 'trainingId' : 'recordId';
      const response = await fetch(`/api/videos?${param}=${entityId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Nie udało się załadować wideo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string, fileName: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć wideo "${fileName}"?`)) return;

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      setVideos(videos.filter((v) => v.id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Nie udało się usunąć wideo. Spróbuj ponownie.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Ładowanie wideo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Brak załączonych wideo
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-medium text-gray-900">
        Załączone wideo ({videos.length}/5)
      </h3>

      {videos.map((video) => (
        <div
          key={video.id}
          className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
        >
          {/* Video player */}
          <video
            controls
            className="w-full max-h-96 bg-black"
            preload="metadata"
          >
            <source src={video.storageUrl} type={video.mimeType} />
            Twoja przeglądarka nie obsługuje odtwarzania wideo.
          </video>

          {/* Video metadata */}
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {video.fileName}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>{formatFileSize(video.fileSize)}</span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {formatDate(video.uploadedAt)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  as="a"
                  href={video.storageUrl}
                  download={video.fileName}
                  title="Pobierz wideo"
                >
                  <DownloadIcon className="w-4 h-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(video.id, video.fileName)}
                  title="Usuń wideo"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {video.description && (
              <p className="text-sm text-gray-600 border-t pt-3">
                {video.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Komponent 3: Sekcja wideo (wrapper)**

```tsx
// src/components/features/videos/VideoSection.tsx

import { useState } from 'react';
import { VideoUploader } from './VideoUploader';
import { VideoList } from './VideoList';
import { VideoIcon } from 'lucide-react';

interface VideoSectionProps {
  entityId: string;
  entityType: 'training' | 'record';
}

export function VideoSection({ entityId, entityType }: VideoSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    // Trigger odświeżenia listy wideo
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section className="space-y-4 border-t pt-6 mt-6">
      <div className="flex items-center gap-2">
        <VideoIcon className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900">
          Załączniki wideo
        </h2>
      </div>

      <VideoUploader
        entityId={entityId}
        entityType={entityType}
        onUploadComplete={handleUploadComplete}
      />

      <VideoList
        entityId={entityId}
        entityType={entityType}
        refresh={refreshKey}
      />
    </section>
  );
}
```

### 7. Integracja w stronach

**Integracja w stronie szczegółów treningu:**

```astro
<!-- src/pages/trainings/[id]/index.astro -->

---
import AppLayout from '@/layouts/AppLayout.astro';
import { VideoSection } from '@/components/features/videos/VideoSection';
// ... existing imports

// ... existing training fetch logic
---

<AppLayout title={`Trening ${training.date}`}>
  <!-- Existing training details -->
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Szczegóły treningu</h1>

    <!-- ... existing sections ... -->

    <!-- Video section -->
    <VideoSection
      client:load
      entityId={training.id}
      entityType="training"
    />
  </div>
</AppLayout>
```

**Integracja w stronie rekordu osobistego:**

```astro
<!-- src/pages/personal-records/[id]/index.astro -->

---
import AppLayout from '@/layouts/AppLayout.astro';
import { VideoSection } from '@/components/features/videos/VideoSection';
// ... existing imports

// ... existing record fetch logic
---

<AppLayout title={`Rekord: ${record.activityName}`}>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Szczegóły rekordu</h1>

    <!-- ... existing sections ... -->

    <!-- Video section -->
    <VideoSection
      client:load
      entityId={record.id}
      entityType="record"
    />
  </div>
</AppLayout>
```

---

## Limity i zasady biznesowe

### Limity techniczne
- **Max rozmiar pliku:** 500MB (konfigurowalny w `video-storage.ts`)
- **Max wideo na trening/rekord:** 5 (wymuszane w API)
- **Dozwolone formaty:** MP4, WebM, QuickTime
- **Timeout uploadu:** 10 minut
- **Presigned URL expiration:** 1 godzina

### Zasady usuwania
- Usunięcie treningu → automatyczne usunięcie wideo (CASCADE)
- Usunięcie rekordu → automatyczne usunięcie wideo (CASCADE)
- Usunięcie użytkownika → automatyczne usunięcie wszystkich wideo (CASCADE)
- Manualnie usunięte wideo → usuwane z R2 i bazy atomowo

### Bezpieczeństwo
- ✅ Presigned URLs - tylko właściciel może uploadować
- ✅ Ownership check - tylko właściciel może usuwać
- ✅ File type validation - tylko video/* dozwolone
- ✅ Size limit - max 500MB
- ✅ CORS configured - tylko z dozwolonych domen
- ⚠️ Brak skanowania zawartości - możliwe wideo z niewłaściwą treścią (do rozważenia w przyszłości)

---

## Deployment i konfiguracja produkcyjna

### Mikrus 2.1

**Nie wymaga zmian w RAM/CPU** - upload odbywa się bezpośrednio z przeglądarki do R2.

**Zmiany w konfiguracji:**

1. **Zmienne środowiskowe (production):**
   ```bash
   # Na serwerze Mikrus
   nano .env

   # Dodaj:
   R2_ACCOUNT_ID=xxx
   R2_ACCESS_KEY_ID=xxx
   R2_SECRET_ACCESS_KEY=xxx
   R2_BUCKET_NAME=training-diary-videos
   R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
   ```

2. **Restart aplikacji:**
   ```bash
   pm2 restart dziennik-treningowy
   ```

### CORS w R2 (Production)

```json
[
  {
    "AllowedOrigins": [
      "https://dziennik-treningowy.pl",
      "https://www.dziennik-treningowy.pl"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### Monitoring kosztów R2

**Cloudflare Dashboard:**
- R2 → Analytics
- Monitoruj: Storage Used, Class A/B Operations
- Ustaw alerty dla budżetu (np. powiadomienie przy >$5/miesiąc)

**Opcjonalnie - limit storage per user:**
```typescript
// W API przed uploadem sprawdź:
const userStorage = await db.query.videoAttachments.findMany({
  where: eq(videoAttachments.userId, session.user.id),
});

const totalSize = userStorage.reduce((sum, v) => sum + v.fileSize, 0);
const MAX_USER_STORAGE = 2 * 1024 * 1024 * 1024; // 2GB per user

if (totalSize + fileSize > MAX_USER_STORAGE) {
  return new Response(
    JSON.stringify({ error: 'Przekroczono limit 2GB na użytkownika' }),
    { status: 400 }
  );
}
```

---

## Migracja bazy danych

### Krok 1: Wygeneruj migrację

```bash
pnpm db:generate
```

### Krok 2: Przejrzyj wygenerowany plik migracji

```sql
-- drizzle/0XXX_video_attachments.sql

CREATE TABLE "video_attachments" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "training_id" text REFERENCES "trainings"("id") ON DELETE CASCADE,
  "personal_record_id" text REFERENCES "personal_records"("id") ON DELETE CASCADE,
  "file_name" text NOT NULL,
  "file_size" integer NOT NULL,
  "mime_type" text NOT NULL,
  "duration" integer,
  "storage_key" text NOT NULL,
  "storage_url" text NOT NULL,
  "thumbnail_url" text,
  "uploaded_at" timestamp DEFAULT now() NOT NULL,
  "description" text
);

CREATE INDEX "idx_video_attachments_training_id" ON "video_attachments"("training_id");
CREATE INDEX "idx_video_attachments_personal_record_id" ON "video_attachments"("personal_record_id");
CREATE INDEX "idx_video_attachments_user_id" ON "video_attachments"("user_id");
```

### Krok 3: Uruchom migrację

```bash
# Development
pnpm db:migrate

# Production (na Mikrus)
pnpm db:migrate
```

### Krok 4: Weryfikacja

```bash
# Sprawdź czy tabela istnieje
pnpm db:studio

# Lub w PostgreSQL:
psql $DATABASE_URL -c "\d video_attachments"
```

---

## Testowanie

### Test Case 1: Upload wideo
1. Zaloguj się do aplikacji
2. Otwórz szczegóły treningu
3. Kliknij "Dodaj wideo"
4. Wybierz plik MP4 (np. 50MB)
5. Obserwuj progress bar
6. **Oczekiwany wynik:** Wideo pojawia się na liście, można odtworzyć

### Test Case 2: Limit rozmiaru pliku
1. Spróbuj uploadować plik >500MB
2. **Oczekiwany wynik:** Błąd "Plik jest zbyt duży..."

### Test Case 3: Limit liczby wideo
1. Dodaj 5 wideo do jednego treningu
2. Spróbuj dodać 6-te
3. **Oczekiwany wynik:** Błąd "Maximum 5 videos per training/record"

### Test Case 4: Usuwanie wideo
1. Dodaj wideo do treningu
2. Kliknij przycisk usuń
3. Potwierdź dialog
4. **Oczekiwany wynik:** Wideo znika, plik usunięty z R2

### Test Case 5: CASCADE delete
1. Dodaj wideo do treningu
2. Usuń cały trening
3. **Oczekiwany wynik:** Wideo automatycznie usunięte z bazy i R2

### Test Case 6: Nieprawidłowy typ pliku
1. Spróbuj uploadować plik .pdf lub .jpg
2. **Oczekiwany wynik:** Błąd "Wybierz plik wideo..."

### Test Case 7: Responsywność
1. Otwórz na telefonie
2. Upload wideo
3. **Oczekiwany wynik:** Video player dopasowany do ekranu, kontrolki działają

---

## Potencjalne rozszerzenia (przyszłość)

### Faza 2: Miniaturki wideo
- Generowanie thumbnail przy uploadzie (np. pierwszy frame)
- Wyświetlanie preview przed odtworzeniem
- Biblioteka: `@ffmpeg/ffmpeg` (działa w przeglądarce przez WebAssembly)

### Faza 3: Kompresja wideo
- Automatyczna kompresja dużych plików
- Konwersja do H.264 dla lepszej kompatybilności
- Cloudflare Stream ($1/1000 min) zamiast R2

### Faza 4: Adnotacje wideo
- Zaznaczanie momentów w wideo (np. "tutaj technika się psuje")
- Timestamped comments
- Porównanie wideo side-by-side (postęp w czasie)

### Faza 5: Sharing
- Generowanie public links (opcjonalne)
- Udostępnianie wideo trenerowi bez konta
- Watermark z nazwą aplikacji

---

## Szacowany czas implementacji

| Etap | Czas | Osoba |
|------|------|-------|
| Konfiguracja R2 | 1h | Dev |
| Schema + migracja | 1h | Dev |
| Video storage service | 2h | Dev |
| API endpoints | 3h | Dev |
| Komponenty React | 4h | Dev |
| Integracja w stronach | 2h | Dev |
| Testowanie manualne | 2h | Dev/QA |
| Bugfixing | 2h | Dev |
| **RAZEM** | **17h** (~3 dni) | - |

---

## Decyzja: Kiedy implementować?

### ✅ Implementuj jeśli:
- Masz budżet ~6-10 zł/miesiąc na hosting wideo
- Użytkownicy aktywnie proszą o tę funkcję
- Competitive advantage - inne fitness apps mają wideo
- Wartość edukacyjna dla użytkowników (analiza techniki)

### ❌ Odłóż jeśli:
- MVP nie ma jeszcze traction (brak użytkowników)
- Budżet jest krytyczny
- Priorytetem są inne funkcje (np. social features, analytics)
- Brak zapotrzebowania ze strony użytkowników

---

## Podsumowanie

**Propozycja:** Cloudflare R2 z presigned URLs to optymalne rozwiązanie dla Mikrus 2.1.

**Kluczowe zalety:**
- ✅ Niski koszt (~6 zł/miesiąc dla 100 użytkowników)
- ✅ Brak obciążenia serwera (upload client-side)
- ✅ Skalowalność (można dodać setki użytkowników bez zmian infrastruktury)
- ✅ Prosta implementacja (~3 dni pracy)

**Uwagi:**
- Nie jest to funkcja MVP - można zaimplementować po walidacji product-market fit
- Alternatywnie: zacząć od YouTube unlisted links (zero kosztu, gorsze UX)
- Monitoring kosztów R2 jest kluczowy przy wzroście użytkowników

---

**Dokument stworzony:** 2026-01-23
**Autor:** Claude Code
**Wersja:** 1.0
