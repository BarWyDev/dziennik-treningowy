# Analiza Wdrożenia Produkcyjnego - Dziennik Treningowy

## Spis treści

1. [Analiza projektu](#1-analiza-projektu)
2. [Hosting i domena](#2-hosting-i-domena)
3. [Infrastruktura bazy danych](#3-infrastruktura-bazy-danych)
4. [Przechowywanie mediów i CDN](#4-przechowywanie-mediów-i-cdn)
5. [Kompletna infrastruktura](#5-kompletna-infrastruktura)
6. [Szacunkowe koszty](#6-szacunkowe-koszty)
7. [Plan skalowalności](#7-plan-skalowalności)
8. [Środki bezpieczeństwa](#8-środki-bezpieczeństwa)
9. [Instrukcja wdrożenia](#9-instrukcja-wdrożenia)

---

## 1. Analiza projektu

### Podsumowanie stosu technologicznego

| Warstwa | Technologia |
|---------|-------------|
| Frontend | Astro 5.16 SSR + React 19 (wyspy) |
| Backend | Astro API Routes (Node.js) |
| Baza danych | PostgreSQL + Drizzle ORM |
| Uwierzytelnianie | Better Auth 1.4.16 |
| Email | Resend |
| Eksport PDF | jsPDF (po stronie klienta) |
| Stylowanie | Tailwind CSS 4.x |
| **Storage mediów** | Lokalny / Cloudflare R2 |

### Zidentyfikowane kluczowe funkcjonalności

1. **Uwierzytelnianie użytkowników** - Email/hasło z weryfikacją, reset hasła
2. **Zarządzanie treningami** - Operacje CRUD z filtrowaniem, ocenami, refleksjami
3. **System celów** - Maksymalnie 5 aktywnych celów, workflow osiągania/archiwizacji
4. **Rekordy osobiste** - Śledzenie najlepszych wyników ze statystykami
5. **Eksport PDF** - Raporty tygodniowe/miesięczne generowane po stronie klienta
6. **Dashboard** - Statystyki podsumowujące i ostatnia aktywność

### Wymagania infrastrukturalne

| Komponent | Wymaganie | Uwagi |
|-----------|-----------|-------|
| Obliczenia | Niskie-średnie (SSR ~150MB RAM) | Runtime Node.js |
| Baza danych | PostgreSQL | ~100MB-1GB storage początkowo |
| Przechowywanie mediów | Średnie-wysokie | Upload obrazów i wideo (do 50MB/plik) |
| Email | Transakcyjne | ~100-500/miesiąc dla MVP |
| Przepustowość | Średnia | Serwowanie plików multimedialnych |

### System uploadu mediów

Aplikacja obsługuje upload mediów w sekcjach **Trening** i **Rekord osobisty**:

**Obsługiwane formaty:**
- Obrazy: JPEG, PNG, WebP, HEIC
- Wideo: MP4, MOV, WebM

**Limity:**
- Maksymalny rozmiar pliku: 50MB
- Maksymalnie 5 zdjęć na trening/rekord
- Maksymalnie 1 wideo na trening/rekord
- Rate limit: 10 uploadów na minutę

**Zabezpieczenia:**
- Weryfikacja magic bytes (sygnatury plików)
- Biała lista typów MIME
- Sprawdzanie własności przed usunięciem
- Rate limiting per użytkownik

### Szczególne uwagi

- Aplikacja **obsługuje upload obrazów i wideo** dla treningów i rekordów osobistych
- Generowanie PDF odbywa się po stronie klienta (brak obciążenia serwera)
- Interfejs w języku polskim z przygotowaniem pod i18n
- Model MVP jest całkowicie darmowy dla użytkowników
- **Wymaga storage dla plików multimedialnych** - kluczowe dla planowania infrastruktury

---

## 2. Hosting i domena

### Opcja A: Budżetowa (Mikrus) - Rekomendowana dla MVP

| Komponent | Dostawca | Plan | Koszt miesięczny |
|-----------|----------|------|------------------|
| VPS | Mikrus 2.1 | 1GB RAM, 10GB SSD | ~25 PLN |
| Baza danych | Mikrus Współdzielona PostgreSQL | W cenie | 0 PLN |
| Domena | OVH/home.pl | domena .pl | ~50 PLN/rok (~4 PLN/mies.) |
| Email | Resend | Darmowy (3000/mies.) | 0 PLN |
| **Razem** | | | **~29 PLN/miesiąc** |

### Opcja B: Skalowalna (Chmura)

| Komponent | Dostawca | Plan | Koszt miesięczny |
|-----------|----------|------|------------------|
| VPS | DigitalOcean/Hetzner | 1GB Droplet | $4-6 (~16-24 PLN) |
| Baza danych | Neon/Supabase | Darmowy → $25 | 0-100 PLN |
| Domena | Cloudflare | Transfer | ~40 PLN/rok |
| Email | Resend | Darmowy | 0 PLN |
| CDN | Cloudflare | Darmowy | 0 PLN |
| **Razem** | | | **~16-130 PLN/miesiąc** |

### Szczegóły usługi email

**Resend (Rekomendowany):**
- Darmowy tier: 3000 emaili/miesiąc
- Dobra dostarczalność
- Proste REST API
- Integracja z React Email już zaimplementowana

**Konfiguracja:**
```env
EMAIL_FROM=noreply@twoja-domena.pl
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## 3. Infrastruktura bazy danych

### Główna: PostgreSQL

**Opcja A: Mikrus Współdzielona (MVP)**
- W cenie hostingu
- Wystarczająca dla 1000+ użytkowników
- Codzienne kopie zapasowe przez dostawcę

**Opcja B: Zarządzana PostgreSQL (Skalowanie)**

| Dostawca | Darmowy tier | Płatne plany |
|----------|--------------|--------------|
| Neon | 0.5GB, 10GB storage | Od $19/mies. (~76 PLN) |
| Supabase | 500MB, 1GB storage | Od $25/mies. (~100 PLN) |
| Railway | 1GB darmowo | $5/GB/mies. |

### Strategia kopii zapasowych

```bash
#!/bin/bash
# Automatyczny skrypt codziennej kopii zapasowej
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"

pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Przechowuj: 7 dziennych, 4 tygodniowe, 3 miesięczne
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

**Koszty kopii zapasowych:**
- Lokalne przechowywanie: W cenie VPS
- Poza serwerem (B2/S3): ~2-8 PLN/miesiąc za 10GB

---

## 4. Przechowywanie mediów i CDN

### Obecny stan: Wymagane

Aplikacja **obsługuje upload obrazów i wideo** dla treningów i rekordów osobistych.

**Obecna implementacja:**
- Storage lokalny: `public/uploads/{userId}/{entityType}/{entityId}/{fileName}`
- Serwowanie przez: `/api/files/{path}`
- Tabela w DB: `media_attachments` (metadane plików)

### Opcja A: Storage lokalny (MVP)

**Zalety:**
- Brak dodatkowych kosztów
- Prosta implementacja (już działa)
- Pełna kontrola nad danymi

**Wady:**
- Ograniczone do pojemności VPS (10GB na Mikrus)
- Brak CDN (wolniejsze serwowanie)
- Wymaga backupu plików

**Szacunkowe użycie storage:**
```
Średnio na użytkownika:
- 5 zdjęć × 2MB = 10MB
- 1 wideo × 30MB = 30MB
- Razem: ~40MB/aktywnego użytkownika

100 użytkowników = ~4GB
500 użytkowników = ~20GB (wymaga upgrade'u)
```

### Opcja B: Object Storage (Skalowanie)

| Usługa | Darmowy tier | Płatne | Egress |
|--------|--------------|--------|--------|
| Cloudflare R2 | 10GB + 1M żądań | $0.015/GB/mies. | Darmowy |
| Backblaze B2 | 10GB | $0.005/GB/mies. | $0.01/GB |
| DigitalOcean Spaces | - | $5/250GB | $0.01/GB |
| AWS S3 | 5GB (12 mies.) | $0.023/GB/mies. | $0.09/GB |

**Rekomendacja: Cloudflare R2**
- Darmowy egress (serwowanie plików)
- Kompatybilne z S3 API
- Integracja z Cloudflare CDN
- 10GB darmowo wystarczy na ~250 użytkowników

### Migracja do Object Storage

Wymaga modyfikacji `src/lib/storage/`:

```typescript
// Nowa implementacja R2StorageService
class R2StorageService implements StorageService {
  async uploadFile(file: File, path: string): Promise<string> {
    const r2 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    // Upload do R2...
  }
}
```

### Rekomendacja CDN

**Cloudflare (Darmowy) - Obowiązkowe dla mediów**
- Automatyczny HTTPS przez certyfikaty SSL
- Ochrona przed DDoS
- Globalne cache na krawędzi sieci
- Polskie POP-y (Warszawa)
- **Cache dla plików statycznych** - zmniejsza obciążenie serwera
- Reguły cache dla `/api/files/*`

**Konfiguracja Cloudflare dla mediów:**
```
Cache Rules:
- /api/files/* → Cache Everything, Edge TTL: 1 month
- /uploads/* → Cache Everything, Edge TTL: 1 month
```

### Backup mediów

**Strategia:**
```bash
#!/bin/bash
# Backup plików uploadowanych
DATE=$(date +%Y%m%d)
UPLOAD_DIR="/home/user/dziennik-treningowy/public/uploads"
BACKUP_DIR="/backups/uploads"

# Incremental backup z rsync
rsync -av --delete $UPLOAD_DIR/ $BACKUP_DIR/

# Opcjonalnie: sync do B2/R2
rclone sync $BACKUP_DIR remote:dziennik-uploads-backup
```

**Cron:**
```bash
# Backup mediów co 6 godzin
0 */6 * * * /home/user/scripts/backup-uploads.sh
```

---

## 5. Kompletna infrastruktura

### Pipeline CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Wdrożenie na Produkcję

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Wdrożenie na serwer
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.SSH_PORT }}
          script: |
            cd ~/dziennik-treningowy
            git pull origin main
            pnpm install --frozen-lockfile
            pnpm build
            pm2 restart dziennik-treningowy
```

### Monitoring i logowanie

| Narzędzie | Przeznaczenie | Koszt |
|-----------|---------------|-------|
| PM2 | Monitoring procesów | Darmowy |
| UptimeRobot | Monitoring dostępności | Darmowy (50 monitorów) |
| Sentry | Śledzenie błędów | Darmowy (5K zdarzeń/mies.) |
| Logflare/Axiom | Agregacja logów | Darmowy tier |

**Konfiguracja monitoringu PM2:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Środki bezpieczeństwa

1. **SSL/TLS**: Cloudflare lub Let's Encrypt (darmowy)
2. **Firewall**: UFW na VPS
   ```bash
   ufw default deny incoming
   ufw allow ssh
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```
3. **Rate Limiting**: Konfiguracja Nginx
4. **Uwierzytelnianie**: Better Auth z bezpiecznymi sesjami
5. **Nagłówki**: Nagłówki bezpieczeństwa w middleware Astro

**Konfiguracja bezpieczeństwa Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name dziennik-treningowy.pl;

    # SSL
    ssl_certificate /etc/letsencrypt/live/domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain/privkey.pem;

    # Nagłówki bezpieczeństwa
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Rate limiting
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. Szacunkowe koszty

### Faza MVP (0-500 użytkowników)

| Komponent | Miesięcznie | Rocznie |
|-----------|-------------|---------|
| Mikrus VPS 2.1 (10GB) | 25 PLN | 300 PLN |
| Domena (.pl) | 4 PLN | 50 PLN |
| Resend Email | 0 PLN | 0 PLN |
| Cloudflare CDN | 0 PLN | 0 PLN |
| UptimeRobot | 0 PLN | 0 PLN |
| Kopie zapasowe (B2) | 8 PLN | 96 PLN |
| **Razem** | **~37 PLN** | **~446 PLN** |

**Uwaga:** 10GB storage wystarczy na ~250 aktywnych użytkowników z mediami.

### Faza wzrostu (500-2000 użytkowników)

| Komponent | Miesięcznie | Rocznie |
|-----------|-------------|---------|
| Hetzner VPS (4GB, 40GB SSD) | 28 PLN | 336 PLN |
| Cloudflare R2 (50GB) | 3 PLN | 36 PLN |
| Neon PostgreSQL | 76 PLN | 912 PLN |
| Domena | 4 PLN | 50 PLN |
| Resend (3K/mies.) | 0 PLN | 0 PLN |
| Cloudflare CDN | 0 PLN | 0 PLN |
| Kopie zapasowe | 16 PLN | 192 PLN |
| **Razem** | **~127 PLN** | **~1526 PLN** |

### Faza skalowania (2000-10000 użytkowników)

| Komponent | Miesięcznie | Rocznie |
|-----------|-------------|---------|
| Hetzner VPS (8GB) | 56 PLN | 672 PLN |
| Cloudflare R2 (500GB) | 30 PLN | 360 PLN |
| Neon PostgreSQL Pro | 152 PLN | 1824 PLN |
| Domena | 4 PLN | 50 PLN |
| Resend (10K/mies.) | 80 PLN | 960 PLN |
| Cloudflare Pro | 80 PLN | 960 PLN |
| Sentry Team | 104 PLN | 1248 PLN |
| Kopie zapasowe | 40 PLN | 480 PLN |
| **Razem** | **~546 PLN** | **~6554 PLN** |

### Wskazówki optymalizacji kosztów

1. Używaj darmowego tieru Cloudflare tak długo jak to możliwe
2. Trzymaj bazę danych na tym samym VPS do 2000+ użytkowników
3. Używaj generowania PDF po stronie klienta (już zaimplementowane)
4. **Agresywnie cache'uj media przez Cloudflare** - zmniejsza transfer i obciążenie serwera
5. Używaj darmowego tieru Resend (3000 emaili pokrywa ~500 nowych użytkowników/miesiąc)
6. **Cloudflare R2 zamiast S3** - darmowy egress oszczędza znacząco przy serwowaniu mediów
7. Kompresuj obrazy po stronie klienta przed uploadem (opcjonalne ulepszenie)
8. Ustaw limity uploadu - 50MB to dużo, rozważ 20MB dla MVP

---

## 7. Plan skalowalności

### Kamienie milowe ruchu

| Użytkownicy | Zmiana infrastruktury |
|-------------|----------------------|
| 0-250 | Pojedynczy VPS (1GB, 10GB), współdzielona BD, storage lokalny |
| 250-500 | Upgrade VPS (2GB, 20GB), współdzielona BD |
| 500-2K | VPS (4GB, 40GB), Cloudflare R2, dedykowana BD |
| 2K-10K | VPS (8GB), R2 (500GB), Neon Pro, Redis cache |
| 10K+ | Skalowanie horyzontalne, load balancer |

### Ścieżka skalowania storage mediów

```
Storage lokalny (10GB) → Większy VPS (40GB) →
Cloudflare R2 (object storage) → R2 + CDN cache →
Multi-region R2 (dla globalnych użytkowników)
```

**Kiedy migrować do R2:**
- Storage lokalny > 80% pojemności
- Więcej niż 500 aktywnych użytkowników
- Potrzeba lepszego CDN dla mediów
- Backup staje się problematyczny

### Ścieżka skalowania bazy danych

```
Współdzielona PostgreSQL → Dedykowana PostgreSQL →
Repliki do odczytu → Connection Pooling (PgBouncer) →
Zarządzana baza danych (Neon/Supabase)
```

### Skalowanie aplikacji

1. **Najpierw wertykalnie**: Upgrade RAM VPS (1GB → 2GB → 4GB → 8GB)
2. **Oddziel storage**: Migracja mediów do Cloudflare R2
3. **Dodaj cache**: Redis dla sesji i częstych zapytań
4. **Horyzontalnie**: Wiele instancji Node za Nginx
5. **Edge**: Migracja do Cloudflare Workers dla globalnej dystrybucji

---

## 8. Środki bezpieczeństwa

### Podsumowanie

| Warstwa | Środek | Status |
|---------|--------|--------|
| Transport | HTTPS (TLS 1.3) | Wymagany |
| Aplikacja | Better Auth, ochrona CSRF | Zaimplementowane |
| Baza danych | Parametryzowane zapytania (Drizzle) | Zaimplementowane |
| Infrastruktura | Firewall UFW, fail2ban | Do skonfigurowania |
| Monitoring | Śledzenie błędów, alerty dostępności | Do skonfigurowania |
| Dane | Hashowanie haseł Bcrypt | Zaimplementowane |
| Sesje | Ciasteczka HTTP-only, wygasanie 7 dni | Zaimplementowane |
| Wejście | Walidacja Zod na wszystkich endpointach | Zaimplementowane |

### Lista kontrolna bezpieczeństwa

- [ ] Włącz HTTPS z ważnym certyfikatem
- [ ] Skonfiguruj firewall (UFW)
- [ ] Skonfiguruj fail2ban dla SSH
- [ ] Włącz rate limiting w Nginx
- [ ] Skonfiguruj nagłówki bezpieczeństwa
- [ ] Skonfiguruj automatyczne aktualizacje bezpieczeństwa
- [ ] Zaimplementuj szyfrowanie kopii zapasowych bazy danych
- [ ] Włącz ochronę DDoS Cloudflare
- [ ] Regularne aktualizacje zależności (Dependabot)

---

## 9. Instrukcja wdrożenia

### Faza 1: Przygotowanie (Lokalnie)

```bash
# 1. Upewnij się, że wszystkie testy przechodzą
pnpm lint
pnpm test
pnpm build

# 2. Utwórz plik środowiskowy produkcyjny
cp .env.example .env.production

# 3. Skonfiguruj zmienne produkcyjne
# Edytuj .env.production z wartościami produkcyjnymi
```

### Faza 2: Konfiguracja serwera (Mikrus/VPS)

```bash
# 1. Połącz się z serwerem
ssh user@server-ip -p port

# 2. Zainstaluj Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Zainstaluj pnpm
npm install -g pnpm

# 4. Zainstaluj PM2
npm install -g pm2

# 5. Skonfiguruj firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 6. Zainstaluj Nginx
sudo apt install nginx

# 7. Zainstaluj Certbot dla SSL
sudo apt install certbot python3-certbot-nginx
```

### Faza 3: Konfiguracja bazy danych

```bash
# Dla współdzielonej PostgreSQL Mikrus - użyj podanych danych dostępowych

# Test połączenia
psql $DATABASE_URL -c "SELECT 1"

# Uruchom migracje
pnpm db:migrate

# Zaseeduj domyślne typy treningów
pnpm db:seed
```

### Faza 4: Wdrożenie aplikacji

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/twoj-user/dziennik-treningowy.git
cd dziennik-treningowy

# 2. Zainstaluj zależności
pnpm install --frozen-lockfile

# 3. Utwórz plik .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:pass@host:port/db
BETTER_AUTH_SECRET=twoj-32-znakowy-sekret-tutaj
BETTER_AUTH_URL=https://dziennik-treningowy.pl
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@dziennik-treningowy.pl
PUBLIC_APP_NAME=Dziennik Treningowy
NODE_ENV=production
EOF

# 4. Zbuduj aplikację
pnpm build

# 5. Utwórz plik konfiguracyjny PM2
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'dziennik-treningowy',
    script: './dist/server/entry.mjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: 4321
    },
    max_memory_restart: '500M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# 6. Uruchom z PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Faza 5: Konfiguracja Nginx i SSL

```bash
# 1. Utwórz konfigurację Nginx
sudo nano /etc/nginx/sites-available/dziennik-treningowy

# Dodaj konfigurację:
server {
    listen 80;
    server_name dziennik-treningowy.pl www.dziennik-treningowy.pl;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 2. Włącz stronę
sudo ln -s /etc/nginx/sites-available/dziennik-treningowy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 3. Uzyskaj certyfikat SSL
sudo certbot --nginx -d dziennik-treningowy.pl -d www.dziennik-treningowy.pl
```

### Faza 6: Konfiguracja DNS

```
# Dodaj te rekordy DNS u swojego rejestratora domen:

Typ     Nazwa   Wartość             TTL
A       @       TWOJ_ADRES_IP       3600
A       www     TWOJ_ADRES_IP       3600
MX      @       mx.resend.com       3600
TXT     @       v=spf1 include:_spf.resend.com ~all
```

### Faza 7: Konfiguracja monitoringu i backupów

```bash
# 1. Włącz rotację logów PM2
pm2 install pm2-logrotate

# 2. Skonfiguruj UptimeRobot
# - Dodaj monitor HTTP(S) dla https://dziennik-treningowy.pl
# - Ustaw interwał 5 minut
# - Skonfiguruj alerty email

# 3. Utwórz skrypt backupu bazy danych
cat > /home/user/scripts/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
mkdir -p $BACKUP_DIR
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF
chmod +x /home/user/scripts/backup-db.sh

# 4. Utwórz skrypt backupu mediów
cat > /home/user/scripts/backup-uploads.sh << 'EOF'
#!/bin/bash
UPLOAD_DIR="/home/user/dziennik-treningowy/public/uploads"
BACKUP_DIR="/backups/uploads"
mkdir -p $BACKUP_DIR
rsync -av --delete $UPLOAD_DIR/ $BACKUP_DIR/
EOF
chmod +x /home/user/scripts/backup-uploads.sh

# 5. Skonfiguruj zadania cron
crontab -e
# Dodaj:
# Backup bazy danych codziennie o 3:00
0 3 * * * /home/user/scripts/backup-db.sh
# Backup mediów co 6 godzin
0 */6 * * * /home/user/scripts/backup-uploads.sh
```

### Faza 8: Konfiguracja CI/CD (GitHub Actions)

1. Dodaj sekrety repozytorium:
   - `SSH_HOST` - IP serwera
   - `SSH_USER` - nazwa użytkownika SSH
   - `SSH_KEY` - prywatny klucz SSH
   - `SSH_PORT` - port SSH

2. Utwórz `.github/workflows/deploy.yml` (pokazany powyżej)

3. Wypchnij do gałęzi main, aby uruchomić wdrożenie

### Lista kontrolna po wdrożeniu

- [ ] Aplikacja dostępna przez HTTPS
- [ ] Weryfikacja email działa (test rejestracji)
- [ ] Emaile resetowania hasła wysyłane
- [ ] Wszystkie endpointy API odpowiadają
- [ ] Połączenia z bazą danych stabilne
- [ ] PM2 pokazuje zdrowy status
- [ ] Monitoring dostępności aktywny
- [ ] **Upload mediów działa** (test upload zdjęcia i wideo)
- [ ] **Serwowanie mediów przez /api/files/ działa**
- [ ] **Katalog uploads/ ma odpowiednie uprawnienia** (chmod 755)
- [ ] Kopie zapasowe bazy danych zaplanowane i przetestowane
- [ ] **Kopie zapasowe mediów zaplanowane i przetestowane**
- [ ] Auto-odnowienie certyfikatu SSL skonfigurowane
- [ ] Reguły firewall aktywne
- [ ] **Monitoring użycia dysku skonfigurowany** (alert przy 80%)

---

## Podsumowanie

To rozwiązanie wdrożeniowe zapewnia:

| Aspekt | Rozwiązanie |
|--------|-------------|
| **Koszt** | ~37 PLN/miesiąc dla MVP (do 250 użytkowników) |
| **Dostępność** | 99%+ z monitoringiem |
| **Bezpieczeństwo** | HTTPS, firewall, rate limiting, weryfikacja plików |
| **Skalowalność** | Jasna ścieżka upgrade'u do 10K+ użytkowników |
| **Utrzymanie** | Automatyczne kopie zapasowe (DB + media), CI/CD |

### Kluczowe funkcjonalności wymagające infrastruktury:

1. **Upload mediów** (obrazy + wideo):
   - Storage lokalny dla MVP (~40MB/użytkownika)
   - Migracja do Cloudflare R2 przy 500+ użytkownikach
   - CDN cache dla wydajnego serwowania

2. **Generowanie PDF** po stronie klienta (brak obciążenia serwera)

3. **Wydajny Astro SSR** (~150MB RAM)

4. **PostgreSQL** z wydajnymi zapytaniami przez Drizzle

### Krytyczne punkty do monitorowania:

- **Użycie storage** - główny czynnik wymuszający skalowanie
- **Transfer mediów** - Cloudflare CDN zmniejsza obciążenie
- **Rozmiar bazy danych** - tabela `media_attachments` rośnie z użytkownikami

---

*Dokument wygenerowany: 2026-02-03*
*Wersja: 1.0*
