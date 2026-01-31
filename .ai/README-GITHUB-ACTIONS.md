# 🚀 Quick Start: GitHub Actions Auto-Deploy

**Dla Mikrus 2.1 (1GB RAM) - Rozwiązanie problemu OOM Kill podczas buildu**

## Problem

```bash
pnpm build
# Killed
# Command failed with exit code 137.
```

**Przyczyna:** Vite wymaga 800-1200 MB RAM. Mikrus 2.1 ma tylko 1GB total → OOM Kill.

---

## Rozwiązanie: GitHub Actions

**Build w chmurze (7 GB RAM darmowo) + auto-deploy**

### ⚡ 5-minutowy setup

#### 1. Wygeneruj SSH key

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/github-actions-mikrus
# Passphrase: PUSTE (Enter 2x)
```

#### 2. Dodaj klucz na Mikrus

```bash
# Skopiuj klucz publiczny
cat ~/github-actions-mikrus.pub

# Zaloguj się na Mikrus
ssh florian114@s1.mikr.us

# Dodaj klucz
nano ~/.ssh/authorized_keys
# Wklej na nowej linii, Ctrl+O, Ctrl+X

exit
```

#### 3. Dodaj 5 Secrets w GitHub

**Settings → Secrets → Actions → New repository secret**

```
1. MIKRUS_SSH_KEY     = [zawartość ~/github-actions-mikrus - klucz PRYWATNY]
2. MIKRUS_HOST        = s1.mikr.us
3. MIKRUS_USER        = florian114
4. MIKRUS_PORT        = 22
5. APP_URL            = http://trening.byst.re
```

#### 4. Commit workflow

```bash
git add .github/workflows/deploy.yml
git add .gitignore
git commit -m "ci: add GitHub Actions"
git push
```

#### 5. Test!

**Automatyczny:**
```bash
git commit -m "test" --allow-empty
git push
# Zobacz: https://github.com/BarWyDev/dziennik-treningowy/actions
```

**Manualny:**
- Otwórz: https://github.com/BarWyDev/dziennik-treningowy/actions
- Kliknij "Deploy to Mikrus"
- Kliknij "Run workflow"

---

## Jak to działa?

```
git push
  ↓
GitHub runner (7 GB RAM):
  pnpm build ✅ (bez OOM!)
  ↓
Deploy przez SCP:
  dist/ → Mikrus
  ↓
PM2 restart
  ↓
✅ Live w 2-3 minuty
```

---

## Workflow po setup

```bash
# Normalna praca:
git add .
git commit -m "feat: nowa funkcja"
git push

# 🎬 GitHub Actions automatycznie:
#    → Builduje
#    → Deploy'uje
#    → Restartuje
#    → Sprawdza czy działa
# ✅ DONE
```

---

## Koszty

- ✅ **0 zł/rok** (GitHub Actions free: 2000 min/mies)
- ✅ **Mikrus 2.1 wystarczy** (75 zł/rok) - nie musisz upgrade'ować!
- ✅ ~600-700 deployów/miesiąc w darmowym tierze

---

## Szczegóły

**Pełna instrukcja:** `.ai/github-actions-setup.md`

**Troubleshooting:** `.ai/github-actions-setup.md` (sekcja Troubleshooting)

**DEPLOYMENT.md:** Zaktualizowany z METODĄ 3 (GitHub Actions)

---

**Gratulacje!** Masz profesjonalny CI/CD bez konieczności upgrade'u serwera.
