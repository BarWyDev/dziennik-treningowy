# Stos technologiczny - Dziennik Treningowy

## 1. Przegląd architektury

```
┌─────────────────────────────────────────────────────────────┐
│                        KLIENT                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Astro 5 + React 19                      │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │    │
│  │  │   Strony  │ │  Wyspy    │ │   Generowanie     │  │    │
│  │  │   SSR     │ │  React    │ │   PDF (jsPDF)     │  │    │
│  │  └───────────┘ └───────────┘ └───────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERWER                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Astro API Routes                        │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │    │
│  │  │   REST    │ │  Better   │ │     Resend        │  │    │
│  │  │   API     │ │  Auth     │ │     (email)       │  │    │
│  │  └───────────┘ └───────────┘ └───────────────────┘  │    │
│  │                      │                               │    │
│  │              ┌───────────────┐                       │    │
│  │              │  Drizzle ORM  │                       │    │
│  │              └───────────────┘                       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BAZA DANYCH                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         PostgreSQL (współdzielona mikr.us)          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 2. Wybrane technologie

### 2.1 Frontend

| Technologia | Wersja | Zastosowanie |
|-------------|--------|--------------|
| Astro | 5.x | Framework fullstack, SSR |
| React | 19.x | Komponenty interaktywne (wyspy) |
| TypeScript | 5.x | Typowanie statyczne |
| Tailwind CSS | 4.x | Stylowanie |
| React Hook Form | 7.x | Obsługa formularzy |
| Zod | 3.x | Walidacja danych |
| jsPDF | 2.x | Generowanie PDF |
| jspdf-autotable | 3.x | Tabele w PDF |
| Paraglide JS | 1.x | Internacjonalizacja (i18n) |

### 2.2 Backend

| Technologia | Wersja | Zastosowanie |
|-------------|--------|--------------|
| Astro API Routes | 5.x | Endpointy REST API |
| Better Auth | 1.x | Autentykacja (email/hasło) |
| Drizzle ORM | 0.38.x | Mapowanie obiektowo-relacyjne |
| Drizzle Kit | 0.30.x | Migracje bazy danych |
| Resend | 4.x | Wysyłka emaili transakcyjnych |
| React Email | 3.x | Szablony emaili |

### 2.3 Baza danych

| Technologia | Wersja | Zastosowanie |
|-------------|--------|--------------|
| PostgreSQL | 15+ | Baza danych (współdzielona mikr.us) |
| drizzle-orm/pg | - | Driver PostgreSQL dla Drizzle |

### 2.4 Narzędzia deweloperskie

| Technologia | Wersja | Zastosowanie |
|-------------|--------|--------------|
| Node.js | 22.x LTS | Runtime JavaScript |
| pnpm | 9.x | Menedżer pakietów |
| ESLint | 9.x | Linting kodu |
| Prettier | 3.x | Formatowanie kodu |
| Vitest | 2.x | Testy jednostkowe |
| Playwright | 1.x | Testy E2E |

### 2.5 Infrastruktura

| Technologia | Zastosowanie |
|-------------|--------------|
| Mikrus 2.1 | Serwer VPS (1GB RAM, 10GB dysk) |
| PM2 | Process manager dla Node.js |
| Nginx | Reverse proxy |
| GitHub | Repozytorium kodu |
| GitHub Actions | CI/CD (opcjonalnie) |

## 3. Uzasadnienie wyboru technologii

### 3.1 Astro 5

Wybór:
- Generuje minimalne JavaScript po stronie klienta
- Architektura wysp pozwala na selektywną interaktywność
- Wbudowane API routes eliminują potrzebę osobnego backendu
- SSR zapewnia szybkie ładowanie i SEO
- Niskie zużycie pamięci (~100-150MB)

Alternatywy rozważane:
- Next.js - odrzucony ze względu na wyższe zużycie RAM (~300MB)
- SvelteKit - odrzucony ze względu na mniejszą społeczność

### 3.2 React 19

Wybór:
- Szeroka znajomość w zespole
- Ogromny ekosystem komponentów
- Stabilny i dojrzały
- Świetna integracja z Astro

### 3.3 Drizzle ORM

Wybór:
- Lekki footprint (vs Prisma)
- TypeScript-first z pełnym typowaniem
- SQL-like składnia, łatwa do zrozumienia
- Szybsze zapytania niż Prisma

Alternatywy rozważane:
- Prisma - odrzucony ze względu na wyższe zużycie pamięci

### 3.4 Better Auth

Wybór:
- Prosta konfiguracja (vs własna implementacja)
- Wbudowane: rejestracja, logowanie, weryfikacja email, reset hasła
- Self-hosted (dane zostają na serwerze)
- TypeScript, świetna dokumentacja
- Aktywnie rozwijany

Alternatywy rozważane:
- Lucia Auth - niskopoziomowa, więcej kodu do napisania
- NextAuth - przeznaczony dla Next.js

### 3.5 PostgreSQL (współdzielona)

Wybór:
- Darmowa w pakiecie Mikrus 2.1
- Nie zużywa RAM na VPS
- Profesjonalna, sprawdzona w produkcji
- Wsparcie dla JSON, pełnotekstowe wyszukiwanie

Alternatywy rozważane:
- SQLite - prostsza, ale ograniczona przy skalowaniu
- Supabase - zewnętrzna zależność

### 3.6 Resend

Wybór:
- 3000 emaili/miesiąc za darmo
- Proste REST API
- Integracja z React Email (ładne szablony)
- Dobra dostarczalność

Alternatywy rozważane:
- Brevo - 300 emaili/dzień (mniej elastyczne)
- Własny SMTP - skomplikowana konfiguracja

### 3.7 jsPDF

Wybór:
- Generowanie PDF w przeglądarce (nie obciąża serwera)
- jspdf-autotable dla tabel
- Darmowy, bez limitów
- Proste API

Alternatywy rozważane:
- Puppeteer - wymaga Chrome, ciężki
- @react-pdf/renderer - bardziej skomplikowany

## 4. Struktura projektu

```
projekt-dziennik-treningowy/
├── .ai/                          # Dokumentacja projektu
│   ├── prd.md
│   ├── tech-stack.md
│   └── tech-stack-recommendations.md
├── src/
│   ├── components/               # Komponenty React
│   │   ├── ui/                   # Komponenty UI (przyciski, inputy)
│   │   ├── forms/                # Formularze
│   │   ├── layout/               # Layout (navbar, sidebar)
│   │   └── features/             # Komponenty domenowe
│   │       ├── auth/
│   │       ├── trainings/
│   │       ├── goals/
│   │       └── pdf/
│   ├── pages/                    # Strony Astro (routing)
│   │   ├── index.astro           # Landing page
│   │   ├── auth/
│   │   │   ├── login.astro
│   │   │   ├── register.astro
│   │   │   ├── verify.astro
│   │   │   └── reset-password.astro
│   │   ├── dashboard.astro
│   │   ├── trainings/
│   │   │   ├── index.astro       # Historia treningów
│   │   │   ├── new.astro         # Dodaj trening
│   │   │   └── [id].astro        # Szczegóły/edycja
│   │   └── goals/
│   │       └── index.astro
│   ├── api/                      # API Routes (Astro)
│   │   ├── auth/
│   │   │   └── [...all].ts       # Better Auth handler
│   │   ├── trainings/
│   │   │   ├── index.ts          # GET (lista), POST (nowy)
│   │   │   └── [id].ts           # GET, PUT, DELETE
│   │   ├── goals/
│   │   │   ├── index.ts
│   │   │   └── [id].ts
│   │   └── training-types/
│   │       └── index.ts
│   ├── lib/                      # Biblioteki i konfiguracje
│   │   ├── auth.ts               # Konfiguracja Better Auth
│   │   ├── db/
│   │   │   ├── index.ts          # Połączenie z bazą
│   │   │   ├── schema.ts         # Schemat Drizzle
│   │   │   └── migrations/       # Migracje
│   │   ├── email.ts              # Konfiguracja Resend
│   │   └── pdf.ts                # Generowanie PDF
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Funkcje pomocnicze
│   ├── types/                    # Typy TypeScript
│   ├── i18n/                     # Tłumaczenia
│   │   ├── pl.json
│   │   └── en.json
│   └── styles/                   # Style globalne
│       └── globals.css
├── public/                       # Pliki statyczne
│   └── favicon.svg
├── emails/                       # Szablony emaili (React Email)
│   ├── verification.tsx
│   └── reset-password.tsx
├── tests/                        # Testy
│   ├── unit/
│   └── e2e/
├── astro.config.mjs
├── drizzle.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── .env.example
```

## 5. Schemat bazy danych

```sql
-- Użytkownicy (zarządzane przez Better Auth)
-- Better Auth tworzy własne tabele: user, session, account, verification

-- Własne typy treningów użytkownika
CREATE TABLE training_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Treningi
CREATE TABLE trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    training_type_id UUID NOT NULL REFERENCES training_types(id),
    date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 5 AND duration_minutes <= 180),
    notes TEXT,
    rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
    rating_physical INTEGER CHECK (rating_physical >= 1 AND rating_physical <= 5),
    rating_energy INTEGER CHECK (rating_energy >= 1 AND rating_energy <= 5),
    rating_motivation INTEGER CHECK (rating_motivation >= 1 AND rating_motivation <= 5),
    rating_difficulty INTEGER CHECK (rating_difficulty >= 1 AND rating_difficulty <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cele treningowe
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'archived')),
    achieved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_trainings_user_id ON trainings(user_id);
CREATE INDEX idx_trainings_date ON trainings(date);
CREATE INDEX idx_trainings_user_date ON trainings(user_id, date DESC);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(user_id, status);
CREATE INDEX idx_training_types_user_id ON training_types(user_id);
```

## 6. Konfiguracja środowiska

### 6.1 Zmienne środowiskowe (.env)

```bash
# Baza danych (mikr.us współdzielona)
DATABASE_URL=postgresql://user:password@host:port/database

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://your-domain.pl

# Resend (email)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@your-domain.pl

# Aplikacja
PUBLIC_APP_URL=https://your-domain.pl
NODE_ENV=production
```

### 6.2 Wymagania systemowe (Mikrus 2.1)

```
System operacyjny: Ubuntu 22.04 LTS
Node.js: 22.x LTS (via nvm)
pnpm: 9.x
PM2: latest
Nginx: latest
```

## 7. Endpointy API

### 7.1 Autentykacja (Better Auth)

```
POST   /api/auth/sign-up              # Rejestracja
POST   /api/auth/sign-in              # Logowanie
POST   /api/auth/sign-out             # Wylogowanie
POST   /api/auth/forgot-password      # Żądanie resetu hasła
POST   /api/auth/reset-password       # Reset hasła
GET    /api/auth/verify-email         # Weryfikacja emaila
GET    /api/auth/session              # Pobierz sesję
```

### 7.2 Treningi

```
GET    /api/trainings                 # Lista treningów (z filtrami)
POST   /api/trainings                 # Dodaj trening
GET    /api/trainings/:id             # Szczegóły treningu
PUT    /api/trainings/:id             # Edytuj trening
DELETE /api/trainings/:id             # Usuń trening
```

### 7.3 Cele

```
GET    /api/goals                     # Lista celów
POST   /api/goals                     # Dodaj cel
PUT    /api/goals/:id                 # Edytuj cel
DELETE /api/goals/:id                 # Usuń cel
PATCH  /api/goals/:id/achieve         # Oznacz jako osiągnięty
PATCH  /api/goals/:id/archive         # Archiwizuj
```

### 7.4 Typy treningów

```
GET    /api/training-types            # Lista typów (predefiniowane + własne)
POST   /api/training-types            # Dodaj własny typ
PUT    /api/training-types/:id        # Edytuj własny typ
DELETE /api/training-types/:id        # Usuń własny typ
```

## 8. Deployment

### 8.1 Proces deployu na Mikrus

```bash
# 1. Połącz się przez SSH
ssh user@mikrus-ip -p port

# 2. Sklonuj repozytorium
git clone https://github.com/user/dziennik-treningowy.git
cd dziennik-treningowy

# 3. Zainstaluj zależności
pnpm install

# 4. Skonfiguruj zmienne środowiskowe
cp .env.example .env
nano .env

# 5. Uruchom migracje bazy danych
pnpm db:migrate

# 6. Zbuduj aplikację
pnpm build

# 7. Uruchom z PM2
pm2 start ecosystem.config.js
pm2 save

# 8. Skonfiguruj Nginx (reverse proxy)
sudo nano /etc/nginx/sites-available/dziennik-treningowy
sudo ln -s /etc/nginx/sites-available/dziennik-treningowy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8.2 PM2 ecosystem.config.js

```javascript
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
    max_memory_restart: '500M'
  }]
};
```

---

Dokument wygenerowany: 2026-01-20
Wersja: 1.0
