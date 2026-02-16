# Plan Deploymentu - Dziennik Treningowy

## Kontekst

Projekt jest w pełni gotowy do produkcji (build OK, 999/999 testów, security headers, rate limiting, error handling). Infrastruktura zakupiona, DNS skonfigurowany, SSH bezhasłowe działa.

---

## Dane infrastruktury

| Zasób | Wartość |
|-------|---------|
| **Domena** | trainwise.fun (home.pl, ~4 PLN netto/1. rok) |
| **VPS** | Mikrus 3.0 - felix160.mikrus.xyz |
| **SSH** | `ssh root@felix160.mikrus.xyz -p 10160` |
| **IPv6** | 2a01:4f9:2a:2855::160 (tylko IPv6!) |
| **Serwer fizyczny** | srv45 |
| **Cloudflare** | Aktywny, DNS Setup: Full, proxy ON |
| **DNS** | AAAA → 2a01:4f9:2a:2855::160 (Proxied) |

**WAŻNE:** Mikrus ma tylko IPv6 - Cloudflare Proxy (Proxied) jest wymagane, aby użytkownicy IPv4 mogli się połączyć.

---

## FAZA 1: Zakupy i rejestracje - UKOŃCZONA

- [x] Mikrus 3.0 kupiony (felix160, srv45)
- [x] Domena trainwise.fun kupiona (home.pl)
- [x] Cloudflare skonfigurowany (DNS Full, proxy ON)
- [x] Rekord AAAA dodany w Cloudflare (Proxied)
- [x] Rekord CNAME www dodany w Cloudflare (Proxied)
- [x] Nameservery zmienione w home.pl na Cloudflare
- [x] SSH bezhasłowe skonfigurowane (klucz ed25519)
- [ ] Konto Resend - DO ZAŁOŻENIA JUTRO

**Koszt:**

| Pozycja | Koszt |
|---------|-------|
| Mikrus 3.0 | ~120 PLN/rok |
| Domena trainwise.fun | ~4 PLN (1. rok) |
| Cloudflare | 0 PLN |
| Resend | 0 PLN |
| **RAZEM** | **~124 PLN/rok (~10 PLN/mies.)** |

---

## FAZA 2: Konfiguracja serwera (~1-2h)

### Krok 2.1 - Pierwsze logowanie i zabezpieczenie - UKOŃCZONE
```bash
# SSH bezhasłowe działa:
ssh root@felix160.mikrus.xyz -p 10160
```

### Krok 2.2 - Instalacja Node.js 22 + pnpm + PM2
```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# pnpm
npm install -g pnpm

# PM2 (process manager)
npm install -g pm2
```

### Krok 2.3 - Instalacja i konfiguracja Nginx
```bash
apt install -y nginx
```
Stworzyć `/etc/nginx/sites-available/dziennik`:
```nginx
server {
    listen 80;
    server_name twojadomena.pl www.twojadomena.pl;

    client_max_body_size 55M;

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
```
```bash
ln -s /etc/nginx/sites-available/dziennik /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### Krok 2.4 - SSL/HTTPS via Cloudflare
- W Cloudflare → **DNS** → dodać rekord `A` wskazujący na IP Mikrusa
- **SSL/TLS** → ustawić tryb **Full (Strict)**
- Cloudflare automatycznie zapewni HTTPS (certyfikat na edge)
- Opcjonalnie: zainstalować Cloudflare Origin Certificate na serwerze dla szyfrowania Cloudflare ↔ Mikrus

### Krok 2.5 - PostgreSQL
- Mikrus 3.0 ma **współdzielony PostgreSQL w cenie**
- Po zakupie dostajesz dane: `host`, `port`, `user`, `password`, `database`
- Connection string: `postgresql://user:pass@host:port/database`
- Przetestować połączenie: `psql "CONNECTION_STRING"`

### Krok 2.6 - Katalog aplikacji i .env
```bash
mkdir -p /var/www/dziennik-treningowy
```
Stworzyć `/var/www/dziennik-treningowy/.env`:
```env
DATABASE_URL=postgresql://user:pass@host:port/database
BETTER_AUTH_SECRET=<wygenerowany-min-32-znaki>
BETTER_AUTH_URL=https://twojadomena.pl
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@twojadomena.pl
PUBLIC_APP_NAME=Dziennik Treningowy
NODE_ENV=production
HOST=127.0.0.1
PORT=4321
```
Wygenerować secret: `openssl rand -base64 32`

### Krok 2.7 - PM2 ecosystem config
Stworzyć `/var/www/dziennik-treningowy/ecosystem.config.cjs`:
```javascript
module.exports = {
  apps: [{
    name: 'dziennik-treningowy',
    script: './dist/server/entry.mjs',
    cwd: '/var/www/dziennik-treningowy',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '800M',
    env: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: 4321
    }
  }]
};
```

---

## FAZA 3: Konfiguracja CI/CD (~30min)

### Krok 3.1 - GitHub Secrets
W repo na GitHubie → **Settings** → **Secrets and variables** → **Actions** dodać:

| Secret | Wartość |
|--------|---------|
| `MIKRUS_SSH_KEY` | Prywatny klucz SSH (ed25519) |
| `MIKRUS_HOST` | IP serwera Mikrus |
| `MIKRUS_USER` | `root` (lub utworzony user) |
| `MIKRUS_PORT` | Port SSH (np. 10022) |
| `APP_URL` | `https://twojadomena.pl` |

### Krok 3.2 - Weryfikacja workflow
- Workflow `.github/workflows/deploy.yml` już istnieje w repo
- Zweryfikować że secrety pasują do nazw w workflow
- Ewentualnie dostosować ścieżki na serwerze (`/var/www/dziennik-treningowy`)

### Krok 3.3 - Pierwszy deploy
```bash
# Ręczny pierwszy deploy (zalecane na start)
# Na lokalnym komputerze:
pnpm build
scp -P PORT -r dist/ root@IP:/var/www/dziennik-treningowy/
scp -P PORT package.json pnpm-lock.yaml root@IP:/var/www/dziennik-treningowy/

# Na serwerze:
cd /var/www/dziennik-treningowy
pnpm install --frozen-lockfile --prod
pnpm db:push         # Stworzyć tabele w bazie
pnpm db:seed         # Załadować domyślne typy treningów
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup          # Auto-start po restarcie serwera
```

Po pierwszym deployu → kolejne deploye automatycznie przez GitHub Actions (push do `main`).

---

## FAZA 4: Konfiguracja emaili - Resend + domena (~30min)

### Krok 4.1 - Dodanie domeny w Resend
1. Resend Dashboard → **Domains** → **Add Domain**
2. Wpisać `twojadomena.pl`
3. Resend wyświetli **rekordy DNS do dodania**:
   - **SPF** (TXT record) - autoryzacja wysyłki
   - **DKIM** (CNAME records) - podpis kryptograficzny
   - **DMARC** (TXT record) - polityka odrzucania fałszywych maili

### Krok 4.2 - Dodanie rekordów DNS w Cloudflare
W Cloudflare → **DNS** → dodać rekordy z kroku 4.1:
```
TXT   @                    v=spf1 include:amazonses.com ~all
CNAME resend._domainkey    <wartość z Resend>
TXT   _dmarc               v=DMARC1; p=none;
```
Poczekać na weryfikację w Resend (kilka minut do kilku godzin).

### Krok 4.3 - Włączenie email verification w kodzie
Plik: `src/lib/auth.ts`
- Zmienić `requireEmailVerification: false` → `true`
- Zmienić `sendOnSignUp: false` → `true`
- Przetestować rejestrację → powinien przyjść email weryfikacyjny

### Krok 4.4 - Test wysyłki maili
- Zarejestrować konto testowe na produkcji
- Sprawdzić czy email weryfikacyjny dochodzi
- Przetestować reset hasła
- Sprawdzić folder spam (jeśli DNS poprawnie → nie powinno trafiać)

---

## FAZA 5: Monitoring i backupy (~30min)

### Krok 5.1 - UptimeRobot (darmowy)
- Zarejestrować na https://uptimerobot.com
- Dodać monitor HTTP(S) → `https://twojadomena.pl`
- Interwał: 5 minut
- Powiadomienia na email

### Krok 5.2 - PM2 monitoring
```bash
pm2 monit            # Podgląd na żywo
pm2 logs             # Logi aplikacji
pm2 status           # Status procesów
```

### Krok 5.3 - Backup bazy (cron)
```bash
# Dodać do crontab (crontab -e):
# Codzienny backup bazy o 3:00
0 3 * * * pg_dump "CONNECTION_STRING" | gzip > /var/backups/db-$(date +\%Y\%m\%d).sql.gz
# Usuwanie backupów starszych niż 7 dni
0 4 * * * find /var/backups -name "db-*.sql.gz" -mtime +7 -delete
```

### Krok 5.4 - Backup mediów
```bash
# Backup uploadów co 6h
0 */6 * * * tar czf /var/backups/uploads-$(date +\%Y\%m\%d).tar.gz /var/www/dziennik-treningowy/dist/client/uploads/
```

---

## FAZA 6: Weryfikacja po deployu (~30min)

### Checklist testowy:
- [ ] Strona otwiera się po HTTPS
- [ ] Rejestracja nowego konta działa
- [ ] Email weryfikacyjny dochodzi
- [ ] Logowanie działa
- [ ] Tworzenie treningu działa
- [ ] Upload zdjęcia do treningu działa
- [ ] Cele - dodawanie/archiwizacja działa
- [ ] Rekordy osobiste działają
- [ ] Export PDF działa
- [ ] Reset hasła wysyła email
- [ ] Rate limiting blokuje po 5 próbach logowania
- [ ] GitHub Actions deploy przechodzi (push do main)

---

## Podsumowanie kosztów

| Pozycja | Koszt roczny | Koszt miesięczny |
|---------|-------------|-----------------|
| Mikrus 3.0 | 120 PLN | 10 PLN |
| Domena .pl | 50 PLN | 4.2 PLN |
| Cloudflare | 0 PLN | 0 PLN |
| Resend | 0 PLN | 0 PLN |
| UptimeRobot | 0 PLN | 0 PLN |
| **RAZEM** | **~170 PLN/rok** | **~14.2 PLN/mies.** |

Pojemność: **~500 aktywnych userów** (Mikrus 3.0 z 2GB RAM i 20GB SSD).

---

## Zmiany w kodzie potrzebne przed deployem

1. **`src/lib/auth.ts`** - włączyć email verification (`requireEmailVerification: true`, `sendOnSignUp: true`)
2. **Sprawdzić/dostosować** `.github/workflows/deploy.yml` - ścieżki i nazwy secretów
3. **Dodać** `ecosystem.config.cjs` do repo (PM2 config)

---

## Kolejność działań (timeline)

```
Dzień 1 (zakupy + konfiguracja):
  ├─ FAZA 1: Zakupy (Mikrus, domena, Cloudflare, Resend)
  ├─ FAZA 2: Konfiguracja serwera
  └─ FAZA 4: Konfiguracja emaili (DNS propagation w tle)

Dzień 1-2 (deploy):
  ├─ FAZA 3: CI/CD + pierwszy deploy
  └─ FAZA 6: Testy na produkcji

Dzień 2 (monitoring):
  └─ FAZA 5: UptimeRobot + backupy
```

Realistycznie: **1 dzień pracy** (4-6h) jeśli DNS propagacja pójdzie szybko.
