# Rekomendacje stosu technologicznego - Dziennik Treningowy

## Podsumowanie kontekstu

Kryteria wyboru (priorytet):
1. Łatwość implementacji
2. Dostępność (dokumentacja, społeczność)
3. Cena (jak najtaniej)

Posiadane zasoby:
- Serwer: Mikrus 2.1 (1GB RAM, 10GB dysku, Docker, współdzielone bazy)
- Doświadczenie: JavaScript/TypeScript, Python

---

## Analiza serwera Mikrus 2.1

Zalety:
- Pełny dostęp ROOT przez SSH
- Docker dostępny
- Współdzielone bazy danych (PostgreSQL, MySQL, MongoDB) - bez zużywania RAM
- 2 porty przekierowane na IPv4 (można rozszerzyć do 7)
- Cena: 75 zł/rok (bardzo tanio)

Ograniczenia:
- 1GB RAM - kluczowe ograniczenie, wymaga lekkiego stosu
- 10GB dysku - wystarczające dla MVP
- Współdzielone łącze 1Gbps

Rekomendacja: Unikać Dockera (overhead pamięci ~100-200MB). Uruchamiać aplikację bezpośrednio z PM2 (Node.js) lub supervisord (Python).

---

## Rekomendowany stos (Opcja A - zalecana)

Ta opcja optymalizuje pod kątem łatwości implementacji i niskiego zużycia zasobów.

### Frontend + Backend: Astro 5 z React

Dlaczego Astro:
- Generuje lekkie strony (minimalne JavaScript)
- Wbudowane API routes - nie potrzeba osobnego backendu
- Wspiera React, Vue, Svelte jako "wyspy interaktywności"
- Świetna dokumentacja po polsku
- Bardzo niskie zużycie pamięci w runtime
- SSR działa z Node.js adapter

Zużycie RAM: ~80-150MB

### Baza danych: PostgreSQL (współdzielona mikr.us)

Dlaczego:
- Darmowa w pakiecie 2.1
- Nie zużywa RAM na Twoim VPS
- Profesjonalna, sprawdzona
- Świetne wsparcie dla JSON (notatki, dodatkowe pola)

Alternatywa: SQLite
- Jeszcze prostsza (plik na dysku)
- 0 konfiguracji
- Wystarczająca dla jednego użytkownika / małej skali
- Zużycie RAM: ~5MB

### ORM: Drizzle ORM

Dlaczego:
- Lekki, szybki, TypeScript-first
- Prostszy niż Prisma, mniejszy footprint
- Świetna dokumentacja
- Migracje wbudowane

Alternatywa: Prisma
- Bardziej popularny, więcej materiałów
- Cięższy (~100MB więcej RAM)

### Autentykacja: Better Auth

Dlaczego:
- Nowa biblioteka, bardzo prosta w użyciu
- Self-hosted (darmowa, dane u Ciebie)
- Wbudowane: email/hasło, weryfikacja, reset hasła
- TypeScript, działa z Astro
- Lekka

Alternatywa: Lucia Auth
- Bardziej dojrzała
- Niskopoziomowa (więcej kodu do napisania)

### Email: Resend

Dlaczego:
- 3000 emaili/miesiąc za darmo
- Bardzo proste API
- Świetna dokumentacja
- Integracja z React Email (ładne szablony)

```
Darmowy limit: 3000 emaili/miesiąc
Dla MVP wystarczy (weryfikacja + reset hasła)
```

Alternatywy:
- Brevo (dawniej Sendinblue): 300 emaili/dzień za darmo
- Mailjet: 200 emaili/dzień za darmo

### Generowanie PDF: jsPDF + jspdf-autotable

Dlaczego:
- Działa w przeglądarce (nie obciąża serwera)
- Proste API
- Wspiera tabele (jspdf-autotable)
- Darmowe

Alternatywa: @react-pdf/renderer
- Bardziej zaawansowane formatowanie
- React-like składnia

### i18n: Paraglide JS (od Inlang)

Dlaczego:
- Bardzo lekki
- Type-safe
- Kompiluje tłumaczenia do funkcji (szybkie)
- Świetna integracja z Astro

### Deployment na Mikrus

```
Uruchomienie bez Dockera (zalecane dla 1GB RAM):

1. Node.js zainstalowany na serwerze
2. PM2 jako process manager
3. Nginx jako reverse proxy (przekierowanie portu)
```

Szacowane zużycie RAM:
- Astro/Node.js: ~100-150MB
- Nginx: ~5MB
- System: ~200MB
- Zapas: ~600MB

---

## Alternatywny stos (Opcja B - Python)

Jeśli preferujesz Python.

### Backend: FastAPI

Dlaczego:
- Nowoczesny, async, szybki
- Automatyczna dokumentacja API (Swagger)
- Type hints
- Świetna dokumentacja

### Frontend: React + Vite (SPA)

Dlaczego:
- Znasz JS/TS
- Vite jest szybki
- SPA hostowane statycznie (np. na Cloudflare Pages - darmowe)

### Baza danych: PostgreSQL + SQLAlchemy

### Autentykacja: Własna implementacja z JWT

Dlaczego:
- FastAPI ma świetne przykłady
- Pełna kontrola
- Więcej pracy, ale edukacyjne

### Email: Resend (ma SDK dla Pythona)

### PDF: ReportLab lub WeasyPrint

---

## Alternatywny stos (Opcja C - Full-stack framework)

Jeśli chcesz jeden framework do wszystkiego.

### Next.js 14+ (App Router)

Zalety:
- Wszystko w jednym (frontend + API)
- Ogromna społeczność
- Vercel oferuje darmowy hosting

Wady:
- Cięższy (~200-300MB RAM)
- Może być za dużo dla Mikrus 2.1
- Skomplikowany App Router

### Baza: Supabase (darmowy tier)

Dlaczego:
- PostgreSQL w chmurze
- Wbudowana autentykacja
- 500MB bazy za darmo
- Nie zużywa RAM na Twoim VPS

Wada:
- Zależność od zewnętrznego serwisu

### Hosting: Vercel (zamiast Mikrus)

Dlaczego:
- Darmowy dla hobby projektów
- Automatyczny deployment z GitHub
- Edge functions

Uwaga: Ta opcja omija Mikrus całkowicie.

---

## Porównanie opcji

| Kryterium | Opcja A (Astro) | Opcja B (FastAPI) | Opcja C (Next.js) |
|-----------|-----------------|-------------------|-------------------|
| Łatwość implementacji | Wysoka | Średnia | Średnia |
| Zużycie RAM | ~150MB | ~200MB | ~300MB |
| Koszt | 75 zł/rok (Mikrus) | 75 zł/rok (Mikrus) | 0 zł (Vercel) |
| Dokumentacja PL | Dobra | Średnia | Bardzo dobra |
| Jeden język | Tak (TS) | Nie (Python + JS) | Tak (TS) |
| Pasuje do Mikrus 2.1 | Tak | Tak | Na granicy |

---

## Moja rekomendacja

Dla Twoich priorytetów (łatwość, dostępność, cena) polecam Opcję A:

```
Frontend/Backend: Astro 5 + React
Baza danych:      PostgreSQL (współdzielona mikr.us)
ORM:              Drizzle ORM
Autentykacja:     Better Auth
Email:            Resend (darmowy tier)
PDF:              jsPDF + jspdf-autotable
i18n:             Paraglide JS
Deployment:       PM2 na Mikrus 2.1
```

Uzasadnienie:
1. Jeden język (TypeScript) - szybsza implementacja
2. Astro jest lekki - zmieści się w 1GB RAM
3. Współdzielona baza PostgreSQL - nie zużywa Twojego RAM
4. Better Auth upraszcza autentykację (najtrudniejsza część)
5. Wszystko darmowe lub bardzo tanie

---

## Szacowany koszt roczny

| Usługa | Koszt |
|--------|-------|
| Mikrus 2.1 | 75 zł/rok |
| Resend (email) | 0 zł (do 3000/mies.) |
| Domena (opcjonalnie) | ~40-60 zł/rok |
| Łącznie | 75-135 zł/rok |

---

## Następne kroki

1. Potwierdzenie wyboru stosu technologicznego
2. Konfiguracja środowiska deweloperskiego
3. Inicjalizacja projektu Astro
4. Konfiguracja bazy danych na Mikrus
5. Implementacja autentykacji
6. Implementacja funkcjonalności MVP

---

Dokument wygenerowany: 2026-01-20
