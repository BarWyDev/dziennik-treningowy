# Analiza Infrastruktury: Dziennik Treningowy

**Data analizy:** 2026-02-03
**Cel:** Znalezienie najbardziej opłacalnej infrastruktury dla bezpłatnej aplikacji

---

## Podsumowanie wymagań aplikacji

| Komponent | Wymaganie | Uwagi |
|-----------|-----------|-------|
| **Runtime** | Node.js 22 (SSR) | ~150-200MB RAM |
| **Baza danych** | PostgreSQL | ~100MB-1GB storage |
| **Storage mediów** | Pliki do 50MB | ~40MB/użytkownika (5 zdjęć + 1 video) |
| **Email** | Transakcyjne | ~100-500/mies dla MVP |
| **PDF** | Generowane client-side | Brak obciążenia serwera |

---

## Opcja 1: MAKSYMALNIE DARMOWA (0 PLN/mies)

**Idealna dla: 0-20 użytkowników, testowanie, walidacja pomysłu**

| Usługa | Provider | Darmowy limit | Ograniczenia |
|--------|----------|---------------|--------------|
| **Compute** | [Koyeb](https://www.koyeb.com/pricing) | 1 web service, 512MB RAM | Auto-sleep po 5 min nieaktywności |
| **PostgreSQL** | [Neon](https://neon.com/pricing) | 0.5GB storage, 100 CU-hours | Scale-to-zero, cold starts |
| **Storage mediów** | Cloudflare R2 | 10GB, 1M writes/mies | Darmowy egress |
| **Email** | [Resend](https://resend.com) | 3000 emaili/mies | Wystarczy na ~500 rejestracji |
| **CDN/DNS** | Cloudflare | Nieograniczony | Pełny darmowy tier |

**Wady:**
- Cold starts (3-10 sekund po nieaktywności)
- Neon: 0.5GB storage = tylko ~12 użytkowników z pełnymi danymi
- Koyeb auto-sleep = pierwsze żądanie wolne

**Koszt: 0 PLN** (tylko domena ~50 PLN/rok)

---

## Opcja 2: BUDŻETOWA Z MIKRUS (75-130 PLN/rok) - REKOMENDOWANA

**Już masz Mikrus 2.1 - wykorzystaj to!**

| Usługa | Provider | Specyfikacja | Koszt |
|--------|----------|--------------|-------|
| **VPS** | Mikrus 2.1 | 1GB RAM, 10GB SSD | 75 PLN/rok |
| **PostgreSQL** | Mikrus Shared | W cenie | 0 PLN |
| **Storage mediów** | Lokalnie + R2 | 10GB lokalnie → overflow do R2 | 0 PLN |
| **Email** | Resend | 3000/mies | 0 PLN |
| **CDN** | Cloudflare | Cache statiki | 0 PLN |
| **Domena** | .pl | - | 50 PLN/rok |

**Architektura hybrydowa storage:**

```
1. Pliki < 5MB → Storage lokalny Mikrus
2. Pliki > 5MB (wideo) → Cloudflare R2
3. Wszystko przez Cloudflare CDN cache
```

**Pojemność:**
- 10GB lokalnie = ~250 użytkowników (przy 40MB/użytkownika)
- Z R2: praktycznie nieograniczona

**Koszt: 125 PLN/rok (10.4 PLN/mies)**

---

## Opcja 3: HETZNER + COOLIFY (168-200 PLN/rok)

**Dla pełnej kontroli i lepszej wydajności**

| Usługa | Provider | Specyfikacja | Koszt |
|--------|----------|--------------|-------|
| **VPS** | [Hetzner CX23](https://www.hetzner.com/cloud) | 2 vCPU, 4GB RAM, 40GB SSD | €3.49/mies (~168 PLN/rok) |
| **PaaS** | [Coolify](https://coolify.io/) | Self-hosted, darmowy | 0 PLN |
| **PostgreSQL** | Na VPS | Zarządzany przez Coolify | 0 PLN |
| **Storage** | Cloudflare R2 | 10GB darmowo | 0 PLN |
| **Email** | Resend | 3000/mies | 0 PLN |

**Zalety:**
- 4x więcej RAM niż Mikrus
- 4x więcej dysku (40GB)
- Coolify = GUI jak Vercel/Railway, ale self-hosted
- Automatyczne SSL, deploymenty z Git
- GDPR compliant (serwery w Niemczech)

**Koszt: ~200 PLN/rok (16.7 PLN/mies)**

---

## Opcja 4: VERCEL + SUPABASE (0-240 PLN/rok)

**Dla zero konfiguracji**

| Usługa | Provider | Plan | Koszt |
|--------|----------|------|-------|
| **Compute** | Vercel Hobby | Serverless | 0 PLN |
| **PostgreSQL** | Supabase Free | 500MB, 2GB transfer | 0 PLN |
| **Storage** | Supabase Storage | 1GB darmowo | 0 PLN |
| **Email** | Resend | 3000/mies | 0 PLN |

**Problem:** Astro SSR na Vercel wymaga adaptera `@astrojs/vercel` (obecnie masz `@astrojs/node`). Wymagana refaktoryzacja.

**Ograniczenia free tier:**
- 100GB bandwidth/mies
- 500MB bazy danych
- 1GB file storage
- Cold starts

---

## Porównanie kosztów rocznych

| Opcja | 0-50 użytk. | 50-250 użytk. | 250-1000 użytk. |
|-------|-------------|---------------|-----------------|
| **Darmowa (Koyeb+Neon)** | 0 PLN | Przekroczysz limity | Nie da się |
| **Mikrus 2.1** | **125 PLN** | **125 PLN** | Upgrade do 3.0: 180 PLN |
| **Hetzner+Coolify** | 200 PLN | 200 PLN | 200 PLN |
| **Vercel+Supabase** | 50 PLN | ~480 PLN (paid tiers) | ~1200 PLN |

---

## Rekomendacja dla darmowej aplikacji

### Faza 1: MVP (0-50 użytkowników)

**→ Zostań na Mikrus 2.1**

Dlaczego:
1. Już masz skonfigurowane środowisko
2. PostgreSQL w cenie
3. Brak cold starts (always-on)
4. 125 PLN/rok to tańsze niż kawa przez rok

### Faza 2: Wzrost (50-500 użytkowników)

**→ Dodaj Cloudflare R2 dla mediów**

```env
# .env.production
STORAGE_PROVIDER=hybrid
LOCAL_STORAGE_LIMIT=5242880  # 5MB - powyżej tego do R2
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=dziennik-media
```

Koszt dodatkowy: **0 PLN** (10GB R2 darmowo)

### Faza 3: Skalowanie (500+ użytkowników)

**→ Migracja do Hetzner CX23 + Coolify**

- Więcej zasobów (4GB RAM, 40GB SSD)
- Coolify daje GUI do zarządzania
- Łatwa skalowalność (upgrade VPS w 5 minut)

---

## Konkretne kroki implementacji

### Natychmiastowo (bez zmian w kodzie):

1. **Zostaw Mikrus 2.1** - masz ~620MB wolnego RAM
2. **Dodaj Cloudflare** (darmowy plan):
   - Cache dla `/api/files/*` (media)
   - SSL termination
   - Ochrona DDoS

### Gdy przekroczysz 5GB uploadów:

1. Implementuj adapter R2 w `src/lib/storage/`
2. Migruj istniejące pliki
3. Zmień `STORAGE_PROVIDER=r2` w `.env`

### Gdy będziesz miał >100 użytkowników:

1. Rozważ upgrade do Mikrus 3.0 (+55 PLN/rok)
2. Lub migracja do Hetzner CX23 (lepszy stosunek ceny do wydajności)

---

## Tabela decyzyjna

| Jeśli... | To wybierz... | Koszt/rok |
|----------|---------------|-----------|
| **Masz <50 użytkowników, budżet <200 PLN** | **Mikrus 2.1** (pozostań) | **125 PLN** |
| **Masz 50-200 użytkowników, OK z obecną konfiguracją** | **Mikrus 3.0** (upgrade) | **180 PLN** |
| **Chcesz lepszą wydajność i GUI do zarządzania** | **Hetzner CX23 + Coolify** | **~200 PLN** |
| **Chcesz zero konfiguracji, globalny CDN** | **Vercel + Supabase** | **50-500 PLN** |
| **Potrzebujesz tylko przetestować** | **Koyeb + Neon (darmowe)** | **0 PLN** |

---

## Podsumowanie

| Scenariusz | Rekomendacja | Koszt roczny |
|------------|--------------|--------------|
| **Start (0-100 użytk.)** | Mikrus 2.1 + Cloudflare | **125 PLN** |
| **Wzrost (100-500 użytk.)** | Mikrus 3.0 + R2 | **180 PLN** |
| **Skalowanie (500+ użytk.)** | Hetzner + Coolify + R2 | **~250 PLN** |

**Najważniejsze:** Nie przepłacaj za "enterprise" rozwiązania. Dla bezpłatnej aplikacji z 50-500 użytkownikami, **125-200 PLN/rok** to optymalny budżet.

---

## Źródła

- [Neon Pricing](https://neon.com/pricing)
- [Koyeb Free Tier](https://www.koyeb.com/pricing)
- [Hetzner Cloud Pricing](https://www.hetzner.com/cloud)
- [Coolify Self-Hosted](https://coolify.io/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Railway vs Render Comparison](https://northflank.com/blog/railway-vs-render)
- [Top PostgreSQL Free Tiers 2026](https://www.koyeb.com/blog/top-postgresql-database-free-tiers-in-2026)
- [Best Node.js Hosting 2026](https://hostadvice.com/nodejs-hosting/free/)

---

## Analiza platform hostingowych (Astro SSR)

**Data analizy:** 2026-02-04

### Kontekst techniczny

Aplikacja wykorzystuje **Astro 5.x w trybie SSR** z adapterem Node.js (`@astrojs/node` standalone). Kluczowe wymagania:
- Długo działający serwer Node.js (nie serverless)
- Persystentny system plików dla mediów (`public/uploads/`)
- Połączenie z PostgreSQL
- Better Auth z zarządzaniem sesjami

### Ocena platform oficjalnych partnerów Astro

| Platforma | Ocena | Uzasadnienie |
|-----------|-------|--------------|
| **Vercel** | 4/10 | Serverless = brak persystentnego filesystem dla uploadów. Hobby tier zabrania użytku komercyjnego. Wymaga migracji storage do S3/R2. |
| **Netlify** | 4/10 | Te same ograniczenia co Vercel. Limit 300 min buildu/mies. Timeout funkcji 10s na free tier. |
| **Cloudflare Pages** | 2/10 | Runtime Workers ≠ Node.js (V8 isolates). Drizzle `pg` niekompatybilny, `fs` niedostępne, Better Auth nieprzetestowany. Wymagałoby przepisania 50%+ backendu. |

### Ocena platform alternatywnych

| Platforma | Ocena | Uzasadnienie |
|-----------|-------|--------------|
| **Railway** | **8/10** | Najlepsze dopasowanie architektoniczne. Zero zmian w kodzie. Natywny PostgreSQL, persystentne wolumeny. ~$15/mies (app + DB + storage). Brak darmowego tier produkcyjnego. |
| **Render** | 7/10 | Dobre dopasowanie. Managed PostgreSQL z backupami. Free tier usypia po 15 min (cold start 30-60s). ~$16/mies dla produkcji (web $7 + PostgreSQL $7 + disk ~$2). |

### Krytyczne ograniczenia serverless dla tej aplikacji

```
❌ Ephemeral filesystem → Media uploads nie działają
❌ Cold starts → Niespójność sesji Better Auth
❌ Function timeouts → Problem z dużymi PDF/uploadami
❌ Zewnętrzna DB → Dodatkowy koszt i latencja
```

### Rekomendacja końcowa

| Faza | Platforma | Koszt | Uwagi |
|------|-----------|-------|-------|
| **Dev/Test** | Render Free | $0 | Akceptując sleep behavior |
| **MVP/Produkcja** | **Railway** | ~$15/mies | Zero zmian w kodzie, skalowalne |
| **Optymalizacja** | Mikrus + R2 | ~10 PLN/mies | Jeśli priorytetem jest minimalizacja kosztów |

### Ścieżka migracji do serverless (opcjonalna)

Jeśli w przyszłości chcesz wykorzystać Vercel/Netlify:

1. Zaimplementuj adapter Cloudflare R2 w `src/lib/storage/`
2. Zmigruj istniejące pliki do R2
3. Zmień adapter Astro na `@astrojs/vercel` lub `@astrojs/netlify`
4. Przenieś PostgreSQL do Neon/Supabase
5. Przetestuj Better Auth w środowisku serverless

**Szacowany nakład:** 2-3 dni pracy + testy

---

*Dokument wygenerowany: 2026-02-03*
*Zaktualizowano: 2026-02-04*
*Wersja: 1.1*
