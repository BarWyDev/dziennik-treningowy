# Decyzja Infrastrukturalna - Dziennik Treningowy

**Data:** 4 lutego 2026
**Autor:** AI Assistant
**Status:** Rekomendacja zatwierdzona

---

## 1. Przegląd wymagań projektu

### 1.1 Wymagania runtime

| Komponent | Wymaganie | Uzasadnienie |
|-----------|-----------|--------------|
| **Runtime** | Node.js 22 LTS | Astro 5 SSR wymaga Node.js 18+ |
| **RAM** | ~150-200MB | Astro SSR + PM2 overhead |
| **CPU** | Niskie obciążenie | SSR generuje HTML, PDF po stronie klienta |
| **Baza danych** | PostgreSQL 15+ | Drizzle ORM, Better Auth |
| **Storage** | 10GB+ | Aplikacja + media użytkowników |

### 1.2 Wymagania funkcjonalne

| Funkcja | Wymaganie infrastrukturalne |
|---------|----------------------------|
| Upload mediów | Storage dla obrazów (JPEG, PNG, WebP, HEIC) i wideo (MP4, MOV, WebM) |
| Limity plików | Max 50MB/plik, 5 obrazów + 1 wideo per encja |
| Email | Zewnętrzna usługa (Resend) - 3000/mies. darmowo |
| SSL/HTTPS | Certyfikat SSL wymagany |
| Sesje | 7-dniowe wygasanie, HTTP-only cookies |

### 1.3 Szacowane zużycie storage

```
Średnio na aktywnego użytkownika:
- 5 zdjęć × 2MB = 10MB
- 1 wideo × 30MB = 30MB
- Razem: ~40MB/użytkownika

Projekcja:
- 100 użytkowników = ~4GB mediów
- 250 użytkowników = ~10GB mediów (limit Mikrus 2.1)
- 500 użytkowników = ~20GB mediów (wymaga upgrade)
```

---

## 2. Analiza Mikrus jako platformy produkcyjnej

### 2.1 Dostępne plany VPS

| Plan | RAM | Dysk | Cena/rok | Uwagi |
|------|-----|------|----------|-------|
| **Mikrus 1.0** | 384 MB | 5 GB | ~35 PLN | Za mały dla Node.js SSR |
| **Mikrus 2.1** | 1 GB | 10 GB | ~65-85 PLN | **Rekomendowany dla MVP** |
| **Mikrus 3.0** | >1 GB | >10 GB | ~130 PLN | Więcej zasobów |

**Źródło:** [mikr.us](https://mikr.us/), [recenzja FSGeek](https://fsgeek.pl/post/recenzja-mikrus-tani-vps/)

### 2.2 Możliwości techniczne

**Zalety:**

| Cecha | Opis | Ocena dla projektu |
|-------|------|-------------------|
| **PostgreSQL współdzielona** | W cenie planu 2.x/3.x | ✅ Idealne - oszczędza RAM |
| **Node.js** | Pełne wsparcie | ✅ Wymagane |
| **Linux** | Ubuntu, Debian, Alpine | ✅ Standardowe |
| **SSH/SCP** | Pełny dostęp | ✅ Deployment, backup |
| **Backup storage** | Konto do backupów w cenie | ✅ Backup bazy i plików |
| **WireGuard** | VPN w cenie (plany 2.x/3.x) | ✅ Bonus bezpieczeństwa |
| **Infrastruktura** | Serwery Hetzner w Helsinkach | ✅ Niezawodność |

**Ograniczenia:**

| Ograniczenie | Wpływ na projekt | Rozwiązanie |
|--------------|------------------|-------------|
| **Brak dedykowanego IPv4** | Wymaga reverse proxy lub Cloudflare | Cloudflare Proxy (darmowy) |
| **Storage 10GB** | Limit ~250 użytkowników z mediami | Migracja do Cloudflare R2 |
| **Kontenery LXC** | Współdzielony kernel | Brak wpływu na Node.js |
| **Płatność roczna** | Brak elastyczności miesięcznej | Niski koszt roczny rekompensuje |
| **Brak autoskalowania** | Ręczny upgrade planów | Akceptowalne dla MVP |

### 2.3 Zgodność z wymaganiami projektu

| Wymaganie | Mikrus 2.1 | Status |
|-----------|------------|--------|
| Node.js 22 LTS | ✅ Wspierany | **OK** |
| RAM ~200MB | ✅ 1GB dostępne | **OK** (zapas 5x) |
| PostgreSQL | ✅ Współdzielona w cenie | **OK** |
| Storage 10GB | ⚠️ 10GB limit | **Uwaga** - wymaga planowania |
| HTTPS/SSL | ✅ Let's Encrypt / Cloudflare | **OK** |
| Email (Resend) | ✅ Zewnętrzna usługa | **OK** |
| Media upload | ⚠️ Lokalne ograniczone | **Uwaga** - plan migracji R2 |

---

## 3. Rekomendacja infrastruktury

### 3.1 Decyzja: **TAK - Mikrus jest odpowiedni na produkcję MVP**

**Uzasadnienie:**

1. **Techniczne dopasowanie:**
   - 1GB RAM to 5x więcej niż wymaga Astro SSR (~150-200MB)
   - Współdzielona PostgreSQL eliminuje overhead bazy na VPS
   - Node.js 22 LTS w pełni wspierany

2. **Ekonomia:**
   - ~65-85 PLN/rok vs ~300 PLN/rok (typowy VPS)
   - PostgreSQL w cenie (oszczędność ~200-400 PLN/rok)
   - Backup storage w cenie

3. **Wystarczający dla MVP:**
   - Do ~200-250 aktywnych użytkowników z mediami
   - Czas na walidację produktu przed skalowaniem

### 3.2 Warunki i ograniczenia

**Mikrus jest odpowiedni POD WARUNKIEM:**

1. **Konfiguracji Cloudflare** jako reverse proxy (rozwiązuje brak dedykowanego IPv4)
2. **Planu migracji storage** do Cloudflare R2 przy ~150 użytkownikach
3. **Monitoringu użycia dysku** z alertem przy 80%

### 3.3 Architektura rekomendowana dla MVP

```
┌─────────────────────────────────────────────────────────┐
│                    CLOUDFLARE                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │    DNS      │  │   Proxy     │  │    SSL      │      │
│  │  (darmowy)  │  │  (darmowy)  │  │  (darmowy)  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   MIKRUS 2.1                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Ubuntu 22.04 + Node.js 22 + PM2 + Nginx        │    │
│  │  ┌───────────────────────────────────────────┐  │    │
│  │  │  Astro 5 SSR (~150MB RAM)                 │  │    │
│  │  │  - API Routes                              │  │    │
│  │  │  - Better Auth                             │  │    │
│  │  │  - Local Storage (tymczasowo)              │  │    │
│  │  └───────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
│  RAM: 1GB | Dysk: 10GB | ~65-85 PLN/rok                 │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              MIKRUS WSPÓŁDZIELONA                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │         PostgreSQL (w cenie planu)              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                USŁUGI ZEWNĘTRZNE                         │
│  ┌─────────────┐  ┌─────────────────────────────────┐   │
│  │   Resend    │  │   Cloudflare R2 (przy wzroście) │   │
│  │  (darmowy)  │  │   10GB darmowo                  │   │
│  └─────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.4 Szacunkowe koszty

#### Faza MVP (0-250 użytkowników)

| Komponent | Roczny koszt | Miesięczny ekwiwalent |
|-----------|--------------|----------------------|
| Mikrus 2.1 | ~80 PLN | ~7 PLN |
| Domena .pl | ~50 PLN | ~4 PLN |
| Cloudflare | 0 PLN | 0 PLN |
| Resend | 0 PLN | 0 PLN |
| **RAZEM** | **~130 PLN/rok** | **~11 PLN/mies.** |

#### Faza wzrostu (250-1000 użytkowników)

| Komponent | Roczny koszt | Miesięczny ekwiwalent |
|-----------|--------------|----------------------|
| Mikrus 3.0 | ~130 PLN | ~11 PLN |
| Cloudflare R2 (50GB) | ~150 PLN | ~12 PLN |
| Domena .pl | ~50 PLN | ~4 PLN |
| **RAZEM** | **~330 PLN/rok** | **~28 PLN/mies.** |

### 3.5 Ścieżka skalowania

```
FAZA 1: MVP (0-250 użytkowników)
├── Mikrus 2.1 (1GB RAM, 10GB SSD)
├── Storage lokalny
└── Koszt: ~11 PLN/mies.

FAZA 2: Wzrost (250-500 użytkowników)
├── Mikrus 3.0 (upgrade)
├── Migracja storage → Cloudflare R2
└── Koszt: ~28 PLN/mies.

FAZA 3: Skalowanie (500-2000 użytkowników)
├── Hetzner VPS (4GB RAM, 40GB SSD)
├── Cloudflare R2 (100GB+)
├── Neon PostgreSQL (opcjonalnie)
└── Koszt: ~100-150 PLN/mies.

FAZA 4: Produkcja (2000+ użytkowników)
├── Hetzner/DigitalOcean (8GB+ RAM)
├── Cloudflare R2 + CDN Pro
├── Managed PostgreSQL
└── Koszt: ~300-500 PLN/mies.
```

---

## 4. Konkretne kroki do wdrożenia

### Krok 1: Zakup i konfiguracja Mikrus (dzień 1)

```bash
# 1. Zamów Mikrus 2.1 na mikr.us
# 2. Wybierz Ubuntu 22.04 LTS
# 3. Zanotuj dane dostępowe (SSH, porty, IPv6)
# 4. Uzyskaj dane do współdzielonej PostgreSQL
```

### Krok 2: Konfiguracja serwera (dzień 1-2)

```bash
# Połącz się przez SSH
ssh user@ipv6-address -p PORT

# Zainstaluj Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Zainstaluj pnpm i PM2
npm install -g pnpm pm2

# Zainstaluj Nginx
sudo apt install nginx
```

### Krok 3: Konfiguracja Cloudflare (dzień 2)

```
1. Dodaj domenę do Cloudflare (darmowy plan)
2. Zmień nameservery u rejestratora
3. Dodaj rekord AAAA dla IPv6 Mikrusa
4. Włącz Proxy (pomarańczowa chmurka)
5. SSL/TLS → Full (Strict)
6. Skonfiguruj Page Rules dla cache mediów
```

### Krok 4: Deploy aplikacji (dzień 2-3)

```bash
# Sklonuj repozytorium
git clone https://github.com/user/dziennik-treningowy.git
cd dziennik-treningowy

# Zainstaluj zależności
pnpm install --frozen-lockfile

# Skonfiguruj .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:pass@mikrus-pg-host:port/db
BETTER_AUTH_SECRET=twoj-32-znakowy-sekret
BETTER_AUTH_URL=https://twoja-domena.pl
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@twoja-domena.pl
PUBLIC_APP_NAME=Dziennik Treningowy
NODE_ENV=production
EOF

# Uruchom migracje i seed
pnpm db:migrate
pnpm db:seed

# Zbuduj i uruchom
pnpm build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Krok 5: Konfiguracja Nginx (dzień 3)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name twoja-domena.pl;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Upload limit dla mediów
        client_max_body_size 55M;
    }
}
```

### Krok 6: Monitoring i backup (dzień 3)

```bash
# Skonfiguruj UptimeRobot (darmowy)
# - Monitor HTTPS dla domeny
# - Alert email przy downtime

# Skrypt backupu (cron codziennie o 3:00)
0 3 * * * pg_dump $DATABASE_URL | gzip > ~/backups/db_$(date +\%Y\%m\%d).sql.gz
0 4 * * * rsync -av ~/dziennik-treningowy/public/uploads/ ~/backups/uploads/
```

---

## 5. Alternatywy (jeśli Mikrus nie spełni oczekiwań)

| Alternatywa | Koszt/mies. | Zalety | Wady |
|-------------|-------------|--------|------|
| **Hetzner Cloud CX11** | ~16 PLN | 2GB RAM, dedykowane IPv4 | Brak PostgreSQL w cenie |
| **Railway** | ~20 PLN | Git push deploy, łatwy | Droższy przy skalowaniu |
| **DigitalOcean Basic** | ~24 PLN | $200 kredytu startowego | Wyższy baseline |
| **Fly.io** | ~20-40 PLN | Edge deployment | Bardziej skomplikowany |

---

## 6. Podsumowanie

| Aspekt | Ocena | Komentarz |
|--------|-------|-----------|
| **Czy Mikrus jest odpowiedni?** | ✅ **TAK** | Dla MVP do ~250 użytkowników |
| **Koszt** | ⭐⭐⭐⭐⭐ | ~11 PLN/mies. - najniższy możliwy |
| **Wydajność** | ⭐⭐⭐⭐ | 1GB RAM wystarczy z zapasem |
| **Skalowalność** | ⭐⭐⭐ | Ograniczona, wymaga planu migracji |
| **Łatwość wdrożenia** | ⭐⭐⭐⭐ | Standardowy Linux + SSH |
| **Niezawodność** | ⭐⭐⭐⭐ | Infrastruktura Hetzner |

**Rekomendacja końcowa:** Rozpocznij na Mikrus 2.1 z planem migracji storage do Cloudflare R2 przy osiągnięciu ~150 aktywnych użytkowników. To optymalne rozwiązanie kosztowe dla walidacji produktu na polskim rynku.

---

## 7. Storage mediów użytkowników (zdjęcia i filmy)

### 7.1 Problem do rozwiązania

Aplikacja umożliwia użytkownikom upload:
- **Zdjęć:** JPEG, PNG, WebP, HEIC (max 5 per encja)
- **Filmów:** MP4, MOV, WebM (max 1 per encja)
- **Limit rozmiaru:** 50MB per plik

**Szacowane zużycie storage na użytkownika:**
```
Średnio aktywny użytkownik:
├── 5 zdjęć × 2MB = 10MB
├── 1 wideo × 30MB = 30MB
└── RAZEM: ~40MB/użytkownika

Projekcja dla Mikrus 2.1 (10GB):
├── 100 użytkowników = ~4GB (40% pojemności)
├── 200 użytkowników = ~8GB (80% pojemności) ⚠️
├── 250 użytkowników = ~10GB (100% pojemności) 🛑
└── Powyżej = BRAK MIEJSCA - serwer przestaje działać
```

### 7.2 Obecna architektura storage (gotowa na migrację)

Aplikacja posiada **pluggable storage architecture** - łatwa zmiana backendu bez modyfikacji logiki biznesowej:

```
src/lib/storage/
├── index.ts      ← Eksportuje aktywny adapter
├── local.ts      ← LocalStorageService (obecna implementacja)
├── types.ts      ← Interfejs StorageService
└── [r2.ts]       ← R2StorageService (do zaimplementowania)
```

**Interfejs StorageService:**
```typescript
interface StorageService {
  uploadFile(file: File, path: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
  getFileUrl(path: string): string;
  generateFileName(originalName: string): string;
  generateFilePath(userId, entityType, entityId, fileName): string;
}
```

**Zmiana backendu wymaga tylko 1 linii w `index.ts`:**
```typescript
// Obecne (lokalne)
export const storage: StorageService = new LocalStorageService();

// Po migracji (R2)
export const storage: StorageService = new R2StorageService();
```

### 7.3 Strategia storage - fazy

#### FAZA 1: MVP (0-150 użytkowników)

| Aspekt | Wartość |
|--------|---------|
| **Backend** | Lokalny (`public/uploads/`) |
| **Pojemność** | 10GB (Mikrus 2.1) |
| **Struktura** | `uploads/{userId}/{entityType}/{entityId}/{fileName}` |
| **Serwowanie** | Nginx static files + Cloudflare cache |
| **Koszt** | 0 PLN (w cenie VPS) |
| **Backup** | rsync do Mikrus backup storage |

**Konfiguracja Cloudflare cache dla mediów:**
```
Page Rules:
├── *twoja-domena.pl/uploads/*
│   ├── Cache Level: Cache Everything
│   ├── Edge Cache TTL: 1 month
│   └── Browser Cache TTL: 1 week
```

**Monitoring użycia dysku (alert przy 80%):**
```bash
# Dodaj do cron (co godzinę)
0 * * * * [ $(df /home --output=pcent | tail -1 | tr -d ' %') -gt 80 ] && \
  curl -X POST "https://api.uptimerobot.com/..." -d "alert=disk_usage_high"
```

#### FAZA 2: Wzrost (150-500+ użytkowników)

| Aspekt | Wartość |
|--------|---------|
| **Backend** | Cloudflare R2 |
| **Pojemność** | Nieograniczona |
| **Endpoint** | `https://{bucket}.r2.cloudflarestorage.com` |
| **CDN** | Cloudflare (automatyczny, darmowy egress) |
| **Koszt** | 0 PLN (10GB free) → ~0.06 PLN/GB powyżej |

### 7.4 Cloudflare R2 - szczegóły

**Dlaczego R2 zamiast S3/B2/inne?**

| Cecha | Cloudflare R2 | AWS S3 | Backblaze B2 |
|-------|---------------|--------|--------------|
| **Darmowy tier** | 10GB | 5GB (12 mies.) | 10GB |
| **Storage/GB** | $0.015 | $0.023 | $0.005 |
| **Egress (transfer)** | **DARMOWY** | $0.09/GB | $0.01/GB |
| **S3 API** | ✅ Kompatybilne | Native | ✅ Kompatybilne |
| **CDN** | ✅ Wbudowany | Dodatkowy koszt | Brak |

**Kluczowe: Darmowy egress** - przy serwowaniu wideo to oszczędność nawet 90% kosztów.

**Cennik R2:**
| Storage | Koszt/mies. | Użytkownicy |
|---------|-------------|-------------|
| 10GB | 0 PLN | ~250 |
| 25GB | ~4 PLN | ~625 |
| 50GB | ~8 PLN | ~1250 |
| 100GB | ~16 PLN | ~2500 |
| 500GB | ~80 PLN | ~12500 |

### 7.5 Implementacja R2StorageService

**Wymagane zmienne środowiskowe:**
```env
# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=dziennik-treningowy-media
R2_PUBLIC_URL=https://media.twoja-domena.pl
```

**Przykładowa implementacja `src/lib/storage/r2.ts`:**
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { StorageService } from './types';
import { generateSecureFileName } from '@/lib/utils/file';

export class R2StorageService implements StorageService {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = process.env.R2_BUCKET_NAME!;
    this.publicUrl = process.env.R2_PUBLIC_URL!;
  }

  async uploadFile(file: File, path: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000', // 1 rok cache
    }));

    return this.getFileUrl(path);
  }

  async deleteFile(url: string): Promise<void> {
    const path = url.replace(`${this.publicUrl}/`, '');

    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: path,
    }));
  }

  getFileUrl(path: string): string {
    return `${this.publicUrl}/${path}`;
  }

  generateFileName(originalName: string): string {
    return generateSecureFileName(originalName);
  }

  generateFilePath(
    userId: string,
    entityType: 'training' | 'personal-record',
    entityId: string,
    fileName: string
  ): string {
    return `${userId}/${entityType}/${entityId}/${fileName}`;
  }
}
```

**Wymagana zależność:**
```bash
pnpm add @aws-sdk/client-s3
```

### 7.6 Plan migracji lokalny → R2

**Kiedy migrować?**
- Użycie dysku > 70% (monitoring)
- ~150 aktywnych użytkowników
- Przed osiągnięciem 8GB mediów

**Kroki migracji:**

```bash
# 1. Utwórz bucket R2 w Cloudflare Dashboard
# 2. Skonfiguruj publiczny dostęp (Custom Domain)
# 3. Dodaj zmienne środowiskowe R2_*

# 4. Zainstaluj AWS SDK
pnpm add @aws-sdk/client-s3

# 5. Utwórz R2StorageService (src/lib/storage/r2.ts)

# 6. Migracja istniejących plików
cat > scripts/migrate-to-r2.ts << 'EOF'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/lib/db';
import { mediaAttachments } from '@/lib/db/schema';
import fs from 'fs/promises';
import path from 'path';

const client = new S3Client({ /* config */ });

async function migrate() {
  const files = await db.select().from(mediaAttachments);

  for (const file of files) {
    const localPath = path.join('public', file.fileUrl);
    const buffer = await fs.readFile(localPath);

    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: file.fileUrl.replace('/uploads/', ''),
      Body: buffer,
      ContentType: file.mimeType,
    }));

    // Aktualizuj URL w bazie
    await db.update(mediaAttachments)
      .set({ fileUrl: `${process.env.R2_PUBLIC_URL}/${file.fileUrl.replace('/uploads/', '')}` })
      .where(eq(mediaAttachments.id, file.id));

    console.log(`Migrated: ${file.fileName}`);
  }
}

migrate();
EOF

# 7. Uruchom migrację
pnpm tsx scripts/migrate-to-r2.ts

# 8. Zmień adapter w index.ts
# export const storage = new R2StorageService();

# 9. Przetestuj upload/delete

# 10. Usuń lokalne pliki (po weryfikacji)
rm -rf public/uploads/*
```

### 7.7 Backup mediów

#### Lokalne (Faza 1):
```bash
# Codziennie o 4:00 - sync do Mikrus backup storage
0 4 * * * rsync -av ~/dziennik-treningowy/public/uploads/ ~/backups/uploads/
```

#### R2 (Faza 2):
```bash
# R2 ma wbudowaną redundancję (11 9's durability)
# Opcjonalnie: replikacja do drugiego bucketu

# Cross-bucket replication w Cloudflare Dashboard
# lub rclone do Backblaze B2 jako cold backup
0 3 * * 0 rclone sync r2:dziennik-media b2:dziennik-backup-media
```

### 7.8 Podsumowanie strategii storage

| Faza | Backend | Pojemność | Koszt/mies. | Trigger migracji |
|------|---------|-----------|-------------|------------------|
| **MVP** | Lokalny | 10GB | 0 PLN | - |
| **Wzrost** | R2 | 50GB | ~8 PLN | 150 użytkowników / 70% dysku |
| **Skala** | R2 | 500GB+ | ~80 PLN | 2500+ użytkowników |

**Kluczowe metryki do monitorowania:**
- Użycie dysku (alert przy 70%, krytyczny przy 85%)
- Liczba aktywnych użytkowników
- Średni rozmiar mediów per użytkownik
- Transfer miesięczny (przy R2 - darmowy)

---

## Źródła

- [Mikrus - Oficjalna strona](https://mikr.us/)
- [Recenzja Mikrus - FSGeek](https://fsgeek.pl/post/recenzja-mikrus-tani-vps/)
- [Mikrus 3.0 - Specyfikacja](https://mikr.us/product/mikrus-3-0/)
- [Mikrus FAQ](https://wiki.mikr.us/faq_najczesciej_zadawane_pytania/)
- [Cloudflare R2 - Dokumentacja](https://developers.cloudflare.com/r2/)
- [Cloudflare R2 - Cennik](https://developers.cloudflare.com/r2/pricing/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

---

*Dokument wygenerowany: 4 lutego 2026*
*Wersja: 1.1 - Dodano sekcję Storage mediów*
