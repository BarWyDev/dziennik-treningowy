# GitHub Actions - Setup Guide

**Data:** 2026-01-23
**Cel:** Automatyczny deploy do Mikrus przy każdym push do `main`

---

## 🎯 Co osiągniesz?

Po skonfigurowaniu:
- ✅ Push do GitHub → **automatyczny build** (na darmowych runner'ach z 7 GB RAM)
- ✅ **Automatyczny deploy** do Mikrus (przez SCP)
- ✅ **Automatyczny restart** aplikacji (PM2)
- ✅ **Healthcheck** po deploy'u
- ✅ **Zero konfiguracji** - po prostu `git push`

**Koszt:** 0 zł (GitHub Actions free: 2000 minut/miesiąc dla public repo, 500 minut dla private)

---

## 📋 Wymagania wstępne

- [x] Projekt na GitHubie: https://github.com/BarWyDev/dziennik-treningowy.git
- [x] Aplikacja działa na Mikrus (srv08)
- [x] Dostęp SSH do Mikrus
- [ ] SSH key skonfigurowany (zrobimy w kroku 1)

---

## 🚀 Krok 1: Wygeneruj dedykowany SSH key dla GitHub Actions

**Na swoim komputerze (Windows):**

```bash
# Otwórz PowerShell lub Git Bash
cd ~

# Wygeneruj nowy SSH key (BEZ hasła!)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f github-actions-mikrus

# Kiedy pyta o passphrase - zostaw PUSTE (naciśnij Enter 2x)
# WAŻNE: Brak passphrase jest wymagany dla automation
```

To stworzy 2 pliki:
- `github-actions-mikrus` - klucz prywatny (NIGDY nie commituj!)
- `github-actions-mikrus.pub` - klucz publiczny

---

## 🔑 Krok 2: Dodaj klucz publiczny na Mikrus

**Skopiuj zawartość klucza publicznego:**

```bash
# Windows PowerShell
cat ~/github-actions-mikrus.pub

# Skopiuj całą linię (zaczyna się od "ssh-ed25519 ...")
```

**Zaloguj się na Mikrus i dodaj klucz:**

```bash
# Połącz się z Mikrus
ssh florian114@s1.mikr.us

# Dodaj klucz do authorized_keys
nano ~/.ssh/authorized_keys

# Wklej skopiowany klucz publiczny na NOWEJ linii na końcu pliku
# Zapisz: CTRL+O, Enter, CTRL+X

# Ustaw poprawne uprawnienia
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Wyloguj się
exit
```

**Test połączenia:**

```bash
# Na swoim komputerze
ssh -i ~/github-actions-mikrus florian114@s1.mikr.us

# Powinno zalogować BEZ pytania o hasło
# Jeśli działa - success! Wyloguj się (exit)
```

---

## 🔐 Krok 3: Dodaj Secrets do GitHub

**Skopiuj klucz PRYWATNY:**

```bash
# Windows PowerShell
cat ~/github-actions-mikrus

# Skopiuj CAŁĄ zawartość (od "-----BEGIN..." do "...END-----")
```

**Dodaj Secrets w GitHub:**

1. Otwórz repo: https://github.com/BarWyDev/dziennik-treningowy
2. Kliknij **Settings** (zakładka na górze)
3. W lewym menu: **Secrets and variables** → **Actions**
4. Kliknij **New repository secret**

**Dodaj następujące sekrety:**

### Secret 1: `MIKRUS_SSH_KEY`
```
Nazwa: MIKRUS_SSH_KEY
Wartość: [WKLEJ CAŁY KLUCZ PRYWATNY od BEGIN do END]
```

### Secret 2: `MIKRUS_HOST`
```
Nazwa: MIKRUS_HOST
Wartość: s1.mikr.us
```

### Secret 3: `MIKRUS_USER`
```
Nazwa: MIKRUS_USER
Wartość: florian114
```

### Secret 4: `MIKRUS_PORT` (opcjonalny, domyślnie 22)
```
Nazwa: MIKRUS_PORT
Wartość: 22
```

### Secret 5: `APP_URL` (opcjonalny, do healthcheck)
```
Nazwa: APP_URL
Wartość: http://trening.byst.re
```

**Po dodaniu wszystkich secretów powinno być 5 pozycji.**

---

## 📝 Krok 4: Commituj workflow do repo

**Workflow został już utworzony:** `.github/workflows/deploy.yml`

```bash
# Sprawdź czy plik istnieje
ls .github/workflows/deploy.yml

# Dodaj do git
git add .github/workflows/deploy.yml
git add .ai/github-actions-setup.md

# Commit
git commit -m "ci: add GitHub Actions auto-deploy workflow"

# Push do GitHub
git push origin main
```

**⚠️ WAŻNE:** Ten push **NIE uruchomi** jeszcze workflow, bo workflow działa dopiero NASTĘPNEGO push'a (musi być już na GitHub).

---

## 🎬 Krok 5: Testuj deployment

### Test 1: Manualne uruchomienie

1. Otwórz GitHub repo: https://github.com/BarWyDev/dziennik-treningowy
2. Kliknij zakładkę **Actions** (na górze)
3. Po lewej: kliknij **Deploy to Mikrus**
4. Kliknij **Run workflow** (przycisk po prawej)
5. Wybierz branch: `main`
6. Kliknij zielony **Run workflow**

**Obserwuj progress:**
- Powinno pokazać running workflow (żółte koło)
- Kliknij w job "build-and-deploy" żeby zobaczyć logi
- Sprawdź każdy step - wszystko powinno być zielone ✅

**Oczekiwany output:**

```
✅ Checkout code
✅ Setup pnpm
✅ Setup Node.js
✅ Install dependencies
✅ Build application
✅ Verify build
   📦 Build size: 2.4M
✅ Deploy to Mikrus via SCP
   📤 Uploading dist/ to Mikrus...
   ✅ Upload complete
✅ Restart application
   🔄 Restarting PM2 application...
   ✅ Application restarted
✅ Healthcheck
   🏥 Checking if application is running...
   ✅ Application is UP (HTTP 200)
✅ Cleanup
```

### Test 2: Automatyczny deploy przy push

**Zmień coś w kodzie:**

```bash
# Przykład: zmień tytuł w landing page
nano src/pages/index.astro
# Zmień jakiś tekst, zapisz

# Commit i push
git add .
git commit -m "test: zmiana testowa dla GitHub Actions"
git push origin main
```

**Sprawdź Actions:**
- Otwórz https://github.com/BarWyDev/dziennik-treningowy/actions
- Powinieneś zobaczyć nowy workflow uruchomiony automatycznie
- Po ~2-3 minuty powinno być DONE ✅

**Sprawdź aplikację:**
```
http://trening.byst.re
```

Powinieneś zobaczyć nową zmianę!

---

## 🔍 Troubleshooting

### Problem 1: "Permission denied (publickey)"

**Przyczyna:** SSH key nie jest poprawnie skonfigurowany

**Rozwiązanie:**
```bash
# 1. Sprawdź czy klucz publiczny jest na Mikrus
ssh florian114@s1.mikr.us "cat ~/.ssh/authorized_keys"

# 2. Sprawdź czy Secret MIKRUS_SSH_KEY zawiera CAŁY klucz
# (od "-----BEGIN..." do "...END-----" włącznie)

# 3. Test lokalnie:
ssh -i ~/github-actions-mikrus florian114@s1.mikr.us
# Musi działać BEZ pytania o hasło
```

### Problem 2: "Build failed - dist/ directory not found"

**Przyczyna:** Build się nie powiódł (błąd w kodzie lub dependencies)

**Rozwiązanie:**
```bash
# Test lokalnie:
pnpm install
pnpm build

# Jeśli lokalnie działa, sprawdź logi GitHub Actions
```

### Problem 3: "Connection timed out"

**Przyczyna:** Firewall blokuje połączenie z GitHub Actions do Mikrus

**Rozwiązanie:**
```bash
# Mikrus nie blokuje SSH z zewnątrz, ale sprawdź:
ssh florian114@s1.mikr.us "sudo ufw status"

# Jeśli firewall enabled, dodaj regułę:
ssh florian114@s1.mikr.us "sudo ufw allow 22/tcp"
```

### Problem 4: "Application returned HTTP 000"

**Przyczyna:** Aplikacja nie startuje po deploy lub subdomena nie działa

**Rozwiązanie:**
```bash
# Sprawdź logi PM2 na serwerze
ssh florian114@s1.mikr.us "pm2 logs dziennik-treningowy --lines 50"

# Sprawdź status
ssh florian114@s1.mikr.us "pm2 status"

# Sprawdź czy dist/ jest poprawny
ssh florian114@s1.mikr.us "ls -lh ~/apps/dziennik-treningowy/dist/"

# Manual restart
ssh florian114@s1.mikr.us "pm2 restart dziennik-treningowy"
```

### Problem 5: Workflow nie uruchamia się automatycznie

**Przyczyna:** `.github/workflows/deploy.yml` nie jest w repo lub ma błędną składnię

**Rozwiązanie:**
```bash
# Sprawdź czy plik istnieje w repo
git ls-files | grep workflows

# Sprawdź składnię YAML online:
# https://www.yamllint.com/

# Sprawdź w GitHub:
# Settings → Actions → General
# Upewnij się, że Actions są enabled
```

---

## 🎯 Co dalej?

### Opcjonalne rozszerzenia

#### 1. Deploy tylko z tagów (semantic versioning)

```yaml
# W deploy.yml, zamień trigger:
on:
  push:
    tags:
      - 'v*'  # Deploy tylko przy git tag v1.0.0, v1.0.1, etc.
```

Wtedy deploy działa tak:
```bash
git tag v1.0.0
git push origin v1.0.0  # To triggeruje deploy
```

#### 2. Deployment Environments (staging + production)

```yaml
# Dodaj staging environment
on:
  push:
    branches:
      - main        # → production
      - develop     # → staging
```

#### 3. Slack/Discord notyfikacje po deploy

```yaml
# Dodaj na końcu workflow:
- name: Notify Discord
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    status: ${{ job.status }}
```

#### 4. Rollback w razie błędu

Workflow już tworzy backup `dist.backup.YYYYMMDD_HHMMSS`.

**Manual rollback:**
```bash
# Na serwerze
ssh florian114@s1.mikr.us

cd ~/apps/dziennik-treningowy

# Zobacz dostępne backupy
ls -lh dist.backup.*

# Przywróć backup
rm -rf dist
cp -r dist.backup.20260123_143022 dist

# Restart
pm2 restart dziennik-treningowy
```

---

## 📊 Monitoring i logi

### Zobacz historię deploymentów

https://github.com/BarWyDev/dziennik-treningowy/actions

### Zobacz logi konkretnego deploya

1. Otwórz Actions
2. Kliknij w konkretny workflow run
3. Kliknij w job "build-and-deploy"
4. Zobacz szczegółowe logi każdego step

### Statystyki użycia GitHub Actions

Settings → Billing → Plans and usage
- Free tier: 2000 minut/miesiąc (public repo)
- Jeden deploy to ~2-3 minuty
- **Wystarczy na ~600-700 deployów/miesiąc** (20-25 dziennie!)

---

## ✅ Checklist końcowy

Po ukończeniu setup:

- [ ] SSH key wygenerowany i dodany na Mikrus
- [ ] Test SSH działa bez hasła: `ssh -i ~/github-actions-mikrus florian114@s1.mikr.us`
- [ ] 5 Secrets dodanych w GitHub (MIKRUS_SSH_KEY, MIKRUS_HOST, MIKRUS_USER, MIKRUS_PORT, APP_URL)
- [ ] `.github/workflows/deploy.yml` scommitowany do repo
- [ ] Manualne uruchomienie workflow działa ✅
- [ ] Automatyczny deploy przy push działa ✅
- [ ] Healthcheck pokazuje HTTP 200 ✅
- [ ] Aplikacja działa po deploy: http://trening.byst.re ✅

---

## 🎉 Gratulacje!

Masz teraz **profesjonalny CI/CD pipeline**:
- ✅ Build na darmowych runner'ach (7 GB RAM - koniec OOM!)
- ✅ Automatyczny deploy przy każdym push
- ✅ Backup przed każdym deploy
- ✅ Healthcheck po deploy
- ✅ **Mikrus 2.1 (75 zł/rok) jest wystarczający** - nie musisz upgrade'ować!

**Workflow:**
```
git add .
git commit -m "feat: nowa funkcjonalność"
git push origin main
# 🎬 GitHub Actions automatycznie:
#    → Builduje (7 GB RAM)
#    → Deploy'uje
#    → Restartuje
#    → Sprawdza czy działa
# ✅ DONE w 2-3 minuty!
```

---

**Dokument stworzony:** 2026-01-23
**Autor:** Claude Code
**Wersja:** 1.0
