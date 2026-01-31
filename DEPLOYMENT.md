# Deployment na Mikrus (wersja testowa)

Przewodnik deploymentu aplikacji Dziennik Treningowy na serwer Mikrus.

## Przed rozpoczęciem

- ✅ Subdomena: `trening.byst.re` (port 3000)
- ✅ Baza danych PostgreSQL na Mikrusie
- ✅ Repo GitHub: https://github.com/BarWyDev/dziennik-treningowy.git
- 🔧 Dostęp SSH do serwera Mikrus

---

## 🚀 ZALECANE METODY DEPLOYMENTU

**Dla Mikrus 2.1 (1GB RAM) - Vite build wymaga więcej RAM:**

| Metoda | Opis | Kiedy używać |
|--------|------|--------------|
| **METODA 3: GitHub Actions** ⭐ | Automatyczny build w chmurze + deploy | **ZALECANA** - Zero konfiguracji, darmowy build (7GB RAM) |
| **METODA 2: Build lokalnie + SCP** | Build na PC, upload dist/ | Szybkie deploy manualne |
| **METODA 1: Git clone + build na serwerze** | Wszystko na serwerze | ❌ **NIE ZALECANE** - Vite OOM kill na 1GB RAM |

**⚠️ WAŻNE:** Vite build wymaga ~800-1200 MB RAM. Na Mikrus 2.1 (1GB total) dostaniesz **exit code 137 (OOM Kill)**. Używaj Metody 2 lub 3.

---

# 🚀 METODA 3: GitHub Actions CI/CD (NAJBARDZIEJ ZALECANA)

**Automatyczny deploy przy każdym `git push` - build na darmowych runner'ach GitHub (7 GB RAM)!**

## Zalety

- ✅ **Darmowy build** w chmurze (2000 minut/miesiąc free)
- ✅ **Zero OOM** - runner ma 7 GB RAM
- ✅ **Automatyczny deploy** - push to deploy
- ✅ **Backup przed deploy** - rollback możliwy
- ✅ **Healthcheck** po deploy
- ✅ **Mikrus 2.1 wystarczający** - tylko runtime (~380 MB)

## Setup (jednorazowo, 10 minut)

**Szczegółowa instrukcja:** Zobacz `.ai/github-actions-setup.md`

**Szybki start:**

### Krok 1: Wygeneruj SSH key dla GitHub Actions

```bash
# Na swoim komputerze
ssh-keygen -t ed25519 -C "github-actions" -f ~/github-actions-mikrus
# WAŻNE: Zostaw passphrase PUSTE (Enter 2x)
```

### Krok 2: Dodaj klucz publiczny na Mikrus

```bash
# Skopiuj klucz publiczny
cat ~/github-actions-mikrus.pub

# Zaloguj na Mikrus i dodaj do authorized_keys
ssh florian114@s1.mikr.us
nano ~/.ssh/authorized_keys
# Wklej klucz na nowej linii, zapisz (Ctrl+O, Ctrl+X)
exit
```

### Krok 3: Dodaj Secrets do GitHub

1. Otwórz: https://github.com/BarWyDev/dziennik-treningowy/settings/secrets/actions
2. Kliknij **New repository secret**
3. Dodaj następujące sekrety:

```
MIKRUS_SSH_KEY = [cała zawartość ~/github-actions-mikrus - klucz PRYWATNY]
MIKRUS_HOST = s1.mikr.us
MIKRUS_USER = florian114
MIKRUS_PORT = 22
APP_URL = http://trening.byst.re
```

### Krok 4: Commit workflow

```bash
# Workflow już istnieje: .github/workflows/deploy.yml
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions auto-deploy"
git push origin main
```

### Krok 5: Test!

**Automatyczny deploy:**
```bash
# Każda zmiana w main triggeruje deploy
git add .
git commit -m "feat: nowa funkcjonalność"
git push origin main

# Zobacz progress:
# https://github.com/BarWyDev/dziennik-treningowy/actions
```

**Manualne uruchomienie:**
1. Otwórz: https://github.com/BarWyDev/dziennik-treningowy/actions
2. Kliknij **Deploy to Mikrus**
3. Kliknij **Run workflow** → **Run workflow**

## Workflow działania

```
1. Push do GitHub
   ↓
2. GitHub runner (7 GB RAM):
   - Checkout kodu
   - pnpm install
   - pnpm build ✅ (bez OOM!)
   ↓
3. Deploy przez SCP:
   - Backup starego dist/
   - Upload nowego dist/
   ↓
4. Restart PM2
   ↓
5. Healthcheck (HTTP 200?)
   ↓
6. ✅ DONE w 2-3 minuty
```

## Troubleshooting

**Problem: "Permission denied (publickey)"**
```bash
# Test SSH lokalnie:
ssh -i ~/github-actions-mikrus florian114@s1.mikr.us
# Musi działać BEZ pytania o hasło

# Sprawdź czy MIKRUS_SSH_KEY zawiera CAŁY klucz prywatny
# (od "-----BEGIN..." do "...END-----")
```

**Szczegóły:** `.ai/github-actions-setup.md`

---

# ⚡ METODA 1: Git Clone + Build na serwerze (NIE ZALECANE dla Mikrus 2.1)

⚠️ **NIE ZALECANE dla Mikrus 2.1** - Vite build zużywa 800-1200 MB RAM → **OOM Kill (exit code 137)**

Ta metoda działa TYLKO na Mikrus 3.0+ (2GB+ RAM). Dla Mikrus 2.1 użyj **METODY 2** lub **METODY 3**.

## Krok 1: Połączenie z serwerem

```bash
ssh twoj-login@s1.mikr.us
```

## Krok 2: Instalacja Node.js (jeśli nie jest zainstalowany)

```bash
# Sprawdź wersję
node -v

# Jeśli brak lub stara wersja:
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt -y install nodejs make gcc g++

# Weryfikacja
node -v   # v22.x
npm -v
```

## Krok 3: Instalacja pnpm

```bash
# Zainstaluj pnpm globalnie
npm install -g pnpm

# Weryfikacja
pnpm -v
```

## Krok 4: Klonowanie repozytorium

```bash
# Przejdź do folderu aplikacji
mkdir -p ~/apps
cd ~/apps

# Sklonuj repo
git clone https://github.com/BarWyDev/dziennik-treningowy.git
cd dziennik-treningowy
```

## Krok 5: Konfiguracja zmiennych środowiskowych

```bash
# Utwórz plik .env
nano .env
```

Wklej (zastąp wartościami z panelu Mikrus):

```env
# Database (dane z panelu Mikrus - zakładka PostgreSQL)
DATABASE_URL=postgresql://USER:PASSWORD@localhost:PORT/DATABASE_NAME

# Better Auth
BETTER_AUTH_SECRET=wygeneruj-32-znakowy-losowy-string
BETTER_AUTH_URL=http://trening.byst.re

# Resend Email (opcjonalne dla testów)
RESEND_API_KEY=re_test_klucz
EMAIL_FROM=noreply@trening.byst.re

# App
PUBLIC_APP_NAME=Dziennik Treningowy
NODE_ENV=production
```

**Generowanie BETTER_AUTH_SECRET:**
```bash
openssl rand -base64 32
```

Zapisz (CTRL+O, Enter, CTRL+X).

## Krok 6: Instalacja zależności i build

```bash
# Instaluj wszystkie zależności (dev + prod - potrzebne do buildu)
pnpm install

# Zbuduj aplikację
pnpm build
```

Po tym kroku folder `dist/` będzie zawierał zbudowaną aplikację.

## Krok 7: Migracja i seed bazy danych

```bash
# Wykonaj push schematu do bazy
pnpm db:push

# Zaseeduj domyślne typy treningów
pnpm db:seed
```

## Krok 8: Instalacja PM2

```bash
# Globalnie
sudo npm install -g pm2
```

## Krok 9: Uruchomienie aplikacji

```bash
# Utwórz plik konfiguracyjny PM2
nano ecosystem.config.cjs
```

Wklej:

```javascript
module.exports = {
  apps: [{
    name: 'dziennik-treningowy',
    script: './dist/server/entry.mjs',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
}
```

Zapisz (CTRL+O, Enter, CTRL+X).

Uruchom:

```bash
# Start aplikacji
pm2 start ecosystem.config.cjs

# Sprawdź status
pm2 status

# Zobacz logi
pm2 logs dziennik-treningowy
```

## Krok 10: Konfiguracja auto-restartu

```bash
# Zapisz konfigurację PM2
pm2 save

# Ustaw auto-start po restarcie serwera
pm2 startup
# (skopiuj i uruchom komendę, którą zwróci PM2)
```

## Krok 11: Testowanie

Otwórz w przeglądarce:
```
http://trening.byst.re
```

Powinieneś zobaczyć landing page aplikacji!

## 🔄 Aktualizacja aplikacji (Git)

Gdy wprowadzisz zmiany w kodzie i wypushniesz na GitHub:

```bash
# NA SERWERZE:
cd ~/apps/dziennik-treningowy

# Pobierz najnowsze zmiany
git pull origin main

# Przebuduj aplikację
pnpm build

# Restart aplikacji
pm2 restart dziennik-treningowy

# Sprawdź logi
pm2 logs dziennik-treningowy
```

### Jeśli były zmiany w schemacie bazy:
```bash
pnpm db:push
pm2 restart dziennik-treningowy
```

---

# 📦 METODA 2: Build lokalnie + SCP (Alternatywna)

Jeśli wolisz budować lokalnie i wysyłać gotowy build.

## Krok 1: Build aplikacji lokalnie

```bash
# W folderze projektu
pnpm install
pnpm build
```

Zostanie utworzony folder `dist/` z zbudowaną aplikacją.

## Krok 2: Przygotowanie plików do wysłania

Utwórz folder tymczasowy z plikami do deploymentu:

```bash
# Struktura do wysłania:
dziennik-treningowy/
├── dist/              # Zbudowana aplikacja
├── package.json       # Lista dependencies
├── package-lock.json  # Lockfile
├── scripts/           # Skrypty seed i migracji
└── .env               # Zmienne środowiskowe (utworzysz na serwerze)
```

## Krok 3: Połączenie z serwerem Mikrus

```bash
ssh twoj-login@s1.mikr.us
```

## Krok 4: Instalacja Node.js (jeśli nie jest zainstalowany)

```bash
# Sprawdź wersję Node.js
node -v

# Jeśli brak lub stara wersja, zainstaluj Node.js 22:
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt -y install nodejs make gcc g++

# Weryfikacja
node -v   # powinno być v22.x
npm -v
```

## Krok 5: Utworzenie folderu aplikacji

```bash
# Utwórz folder dla aplikacji
mkdir -p ~/apps/dziennik-treningowy
cd ~/apps/dziennik-treningowy
```

## Krok 6: Przesłanie plików na serwer

**Z lokalnego komputera** (w nowym terminalu):

```bash
# Przejdź do folderu projektu
cd C:\Users\bwysocki\projekt-dziennik-treningowy

# Wyślij pliki (zastąp USERNAME i HOST)
scp -r dist/ package.json package-lock.json scripts/ USERNAME@s1.mikr.us:~/apps/dziennik-treningowy/
```

**Alternatywnie:** użyj WinSCP, FileZilla lub innego klienta SFTP.

## Krok 7: Konfiguracja zmiennych środowiskowych

**Na serwerze**, w folderze aplikacji:

```bash
cd ~/apps/dziennik-treningowy
nano .env
```

Wklej (zastąp wartościami z Mikrusa):

```env
# Database (dane z panelu Mikrus)
DATABASE_URL=postgresql://USER:PASSWORD@localhost:PORT/DATABASE_NAME

# Better Auth
BETTER_AUTH_SECRET=wygeneruj-32-znakowy-losowy-string-tutaj
BETTER_AUTH_URL=http://trening.byst.re

# Resend Email (opcjonalne dla testów, można użyć fake)
RESEND_API_KEY=twoj-klucz-resend-lub-re_test_klucz
EMAIL_FROM=noreply@trening.byst.re

# App
PUBLIC_APP_NAME=Dziennik Treningowy
NODE_ENV=production
```

**Generowanie BETTER_AUTH_SECRET:**
```bash
openssl rand -base64 32
```

Zapisz (CTRL+O, Enter, CTRL+X).

## Krok 8: Instalacja dependencies

```bash
# Instaluj tylko production dependencies
npm ci --omit=dev
```

## Krok 9: Migracja bazy danych

**Instalacja narzędzi do migracji (tymczasowo):**

```bash
# Zainstaluj drizzle-kit tymczasowo
npm install -D drizzle-kit tsx

# Wykonaj migracje
npm run db:push

# Zaseeduj domyślne typy treningów
npm run db:seed
```

## Krok 10: Instalacja PM2 (jeśli nie jest zainstalowany)

```bash
# Globalnie
sudo npm install -g pm2
```

## Krok 11: Uruchomienie aplikacji

```bash
# Uruchom aplikację na porcie 3000
PORT=3000 pm2 start dist/server/entry.mjs --name dziennik-treningowy

# Sprawdź status
pm2 status

# Sprawdź logi
pm2 logs dziennik-treningowy
```

## Krok 12: Konfiguracja auto-restartu

```bash
# Zapisz konfigurację PM2
pm2 save

# Ustaw auto-start po restarcie serwera
pm2 startup
# (skopiuj i uruchom komendę, którą zwróci PM2)
```

## Krok 13: Testowanie

Otwórz w przeglądarce:
```
http://trening.byst.re
```

Powinieneś zobaczyć landing page aplikacji.

## Sprawdzanie logów

```bash
# Logi aplikacji
pm2 logs dziennik-treningowy

# Ostatnie 100 linii
pm2 logs dziennik-treningowy --lines 100

# Logi w czasie rzeczywistym
pm2 logs dziennik-treningowy --raw
```

## Restart aplikacji

```bash
# Restart po zmianach
pm2 restart dziennik-treningowy

# Stop
pm2 stop dziennik-treningowy

# Start
pm2 start dziennik-treningowy
```

## Troubleshooting

### Subdomena pokazuje błąd timeout (fioletowy status)

Sprawdź, czy aplikacja działa:
```bash
pm2 status
pm2 logs dziennik-treningowy
```

### Błąd połączenia z bazą danych

Sprawdź:
```bash
# Czy baza działa
psql -U USERNAME -d DATABASE_NAME -h localhost -p PORT

# Sprawdź .env
cat .env | grep DATABASE_URL
```

### Błąd portu

Upewnij się, że aplikacja nasłuchuje na porcie 3000:
```bash
# Sprawdź, co działa na porcie 3000
lsof -i :3000

# Lub
netstat -tlnp | grep 3000
```

### Sprawdzanie błędów w kodzie

```bash
# Zobacz pełne logi błędów
pm2 logs dziennik-treningowy --err
```

## Aktualizacja aplikacji

Po wprowadzeniu zmian w kodzie:

```bash
# LOKALNIE:
pnpm build

# Wyślij nowy dist/ na serwer
scp -r dist/ USERNAME@s1.mikr.us:~/apps/dziennik-treningowy/

# NA SERWERZE:
pm2 restart dziennik-treningowy
```

## Dane do połączenia

- **Host:** s1.mikr.us (lub adres z panelu)
- **Port SSH:** 22 (standardowy)
- **Subdomena:** http://trening.byst.re
- **Port aplikacji:** 3000
- **Folder aplikacji:** ~/apps/dziennik-treningowy

## Przydatne komendy PM2

```bash
pm2 list                        # Lista aplikacji
pm2 info dziennik-treningowy    # Szczegóły aplikacji
pm2 monit                       # Monitor w czasie rzeczywistym
pm2 reload dziennik-treningowy  # Zero-downtime reload
pm2 delete dziennik-treningowy  # Usuń z PM2
```

---

# 🔧 Przydatne komendy

## PM2 - zarządzanie aplikacją

```bash
pm2 list                        # Lista wszystkich aplikacji
pm2 status                      # Status aplikacji
pm2 info dziennik-treningowy    # Szczegóły aplikacji
pm2 logs dziennik-treningowy    # Logi w czasie rzeczywistym
pm2 logs dziennik-treningowy --lines 100  # Ostatnie 100 linii
pm2 logs dziennik-treningowy --err        # Tylko błędy
pm2 monit                       # Monitor w czasie rzeczywistym
pm2 restart dziennik-treningowy # Restart aplikacji
pm2 reload dziennik-treningowy  # Zero-downtime reload
pm2 stop dziennik-treningowy    # Stop aplikacji
pm2 start dziennik-treningowy   # Start aplikacji
pm2 delete dziennik-treningowy  # Usuń z PM2
pm2 save                        # Zapisz konfigurację
```

## Git - zarządzanie kodem

```bash
git status                      # Status repozytorium
git pull origin main            # Pobierz zmiany z GitHuba
git log --oneline -10           # Ostatnie 10 commitów
git diff                        # Zobacz zmiany
```

## Baza danych

```bash
pnpm db:push                    # Push schematu do bazy
pnpm db:seed                    # Seed domyślnych typów treningów
pnpm db:studio                  # Otwórz Drizzle Studio (localhost)

# Połączenie z PostgreSQL
psql -U USERNAME -d DATABASE_NAME -h localhost -p PORT

# Backup bazy
pg_dump -U USERNAME -d DATABASE_NAME > backup_$(date +%Y%m%d).sql

# Restore z backupu
psql -U USERNAME -d DATABASE_NAME < backup_20260122.sql
```

## System

```bash
htop                            # Monitor systemu
df -h                           # Wolne miejsce na dysku
free -h                         # Użycie pamięci RAM
lsof -i :3000                   # Co działa na porcie 3000
netstat -tlnp | grep 3000       # Sprawdź port 3000
```

---

# 🚨 Troubleshooting

## Subdomena pokazuje timeout (fioletowy status)

```bash
# Sprawdź status aplikacji
pm2 status

# Zobacz logi
pm2 logs dziennik-treningowy

# Sprawdź, czy port 3000 jest zajęty
lsof -i :3000

# Restart aplikacji
pm2 restart dziennik-treningowy
```

## Błąd połączenia z bazą danych

```bash
# Sprawdź zmienną DATABASE_URL
cat .env | grep DATABASE_URL

# Test połączenia z bazą
psql -U USERNAME -d DATABASE_NAME -h localhost -p PORT

# Zobacz błędy w logach
pm2 logs dziennik-treningowy --err
```

## Aplikacja się nie uruchamia

```bash
# Sprawdź logi błędów
pm2 logs dziennik-treningowy --err --lines 50

# Sprawdź, czy dist/ istnieje
ls -la dist/

# Spróbuj uruchomić bezpośrednio (debug)
NODE_ENV=production PORT=3000 node dist/server/entry.mjs
```

## Build się nie powiódł

```bash
# Sprawdź wersję Node.js (powinna być 22.x)
node -v

# Wyczyść cache i przebuduj
rm -rf node_modules dist .astro
pnpm install
pnpm build
```

## Brak miejsca na dysku

```bash
# Sprawdź miejsce
df -h

# Usuń stare logi PM2
pm2 flush

# Wyczyść cache npm/pnpm
pnpm store prune
```

## Git pull pokazuje konflikty

```bash
# Zobacz co się zmieniło
git status

# Odrzuć lokalne zmiany (UWAGA: traci lokalne zmiany!)
git reset --hard origin/main

# Lub zachowaj lokalne zmiany
git stash
git pull origin main
git stash pop
```

---

# 📋 Checklist deploymentu

- [ ] Połączenie SSH działa
- [ ] Node.js 22.x zainstalowany
- [ ] pnpm zainstalowany
- [ ] Repo sklonowane z GitHuba
- [ ] Plik .env utworzony z poprawnymi danymi
- [ ] DATABASE_URL poprawny (test: `psql -U ... -d ...`)
- [ ] BETTER_AUTH_SECRET wygenerowany (32+ znaków)
- [ ] `pnpm install` zakończony sukcesem
- [ ] `pnpm build` zakończony sukcesem
- [ ] `pnpm db:push` wykonany
- [ ] `pnpm db:seed` wykonany
- [ ] PM2 zainstalowany globalnie
- [ ] Aplikacja uruchomiona przez PM2
- [ ] `pm2 save` wykonane
- [ ] `pm2 startup` skonfigurowane
- [ ] Subdomena `trening.byst.re` działa (zielony status)
- [ ] Można się zalogować/zarejestrować

---

# 🎯 Następne kroki (opcjonalne)

## Bezpieczeństwo
- [ ] Skonfiguruj HTTPS (Let's Encrypt)
- [ ] Zmień domyślne hasło SSH
- [ ] Ustaw firewall (ufw)
- [ ] Regularnie aktualizuj system (apt update && apt upgrade)

## Backup
- [ ] Automatyczny backup bazy danych (cron)
- [ ] Backup pliku .env
- [ ] Backup konfiguracji PM2

## Monitoring
- [ ] Uptime monitoring (UptimeRobot, Uptime Kuma)
- [ ] Error tracking (Sentry)
- [ ] Analytics (opcjonalnie)

## CI/CD
- [ ] GitHub Actions do automatycznego deploymentu
- [ ] Pre-commit hooks (lint, format, test)
- [ ] Staging environment

---

# 📝 Uwagi końcowe

- **To jest konfiguracja TESTOWA** - nie używaj w produkcji bez dodatkowych zabezpieczeń
- Pamiętaj o regularnych **backupach bazy danych**
- W produkcji koniecznie użyj **HTTPS**
- Nigdy nie commituj pliku `.env` do GitHuba (jest już w .gitignore)
- Używaj silnych haseł do bazy danych i Better Auth Secret
- Rozważ użycie zmiennej `NODE_ENV=production` dla dodatkowych optymalizacji

---

# 📞 Pomoc

- **Wiki Mikrus:** https://wiki.mikr.us/
- **Discord Mikrus:** https://mikr.us/discord
- **Facebook Mikrus:** https://mikr.us/facebook
- **GitHub Issues:** https://github.com/BarWyDev/dziennik-treningowy/issues
