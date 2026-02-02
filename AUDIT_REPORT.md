# 📋 RAPORT Z AUDYTU KODU - PRIORYTETYZACJA ZADAŃ

**Projekt:** Dziennik Treningowy
**Data audytu:** 2026-02-01
**Audytor:** Claude Code
**Status:** Production-ready z kluczowymi poprawkami

---

## 📊 EXECUTIVE SUMMARY

### Ogólna Ocena: 7.5/10 ⭐⭐⭐⭐⭐⭐⭐☆☆☆

**Znalezione problemy:**
- 🔴 **Krytyczne:** 4 (wymagają natychmiastowej uwagi)
- 🟠 **Wysokie:** 6 (powinny być naprawione przed produkcją)
- 🟡 **Średnie:** 6 (poprawią jakość kodu)
- 🟢 **Niskie:** 8 (nice to have)

**Szacowany czas naprawy krytycznych problemów:** 4-6 godzin
**Całkowity technical debt:** ~40-50 godzin roboczych

---

## 🎯 MACIERZ IMPACT vs EFFORT

```
WYSOKI IMPACT
    │
    │  [P1] Memory Leak          [P2] Media Bug
    │  [P3] README              [P4] Ownership Helper
    │
    │  [P7] Test Coverage       [P5] Huge Components
    │  [P9] CI/CD              [P6] Media Grouping
    │
    ├────────────────────────────────────────────
    │  [P12] Logger            [P13] Git Workflow
    │  [P14] File Deletion     [P15] Magic Numbers
    │
    │  [P10] Error Messages    [P11] Console Cleanup
    │  [P16] Type Safety
NISKI IMPACT
    │
    └────────── EFFORT ───────────────────────────→
       NISKI                                  WYSOKI
```

---

## 🚨 PRIORYTET 1: KRYTYCZNE (Must Fix Before Production)

### P1.1 - Memory Leak w Rate Limiter i Cache
**Czas:** 1 godzina
**Impact:** 🔥🔥🔥 Krytyczny
**Risk:** Aplikacja może crashować po kilku dniach działania

**Opis problemu:**
`setInterval()` w konstruktorze nigdy nie jest clearowany, powodując memory leak.

**Pliki:**
- `src/lib/rate-limit.ts:31-35`
- `src/lib/cache.ts:17-21`

**Rozwiązanie:**
```typescript
// src/lib/rate-limit.ts
class RateLimiter {
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.requests.clear();
  }
}

// Export singleton
export const rateLimiter = new RateLimiter();

// Cleanup on server shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    rateLimiter.destroy();
  });
  process.on('SIGINT', () => {
    rateLimiter.destroy();
  });
}
```

**Task checklist:**
- [ ] Dodaj cleanup dla setInterval w RateLimiter
- [ ] Dodaj cleanup dla setInterval w Cache
- [ ] Export jako singleton
- [ ] Dodaj process.on handlers
- [ ] Test manualnie czy cleanup działa

---

### P1.2 - Brak Error Recovery w Media Upload
**Czas:** 30 minut
**Impact:** 🔥🔥🔥 Bug - utrata danych
**Risk:** Użytkownicy tracą referencje do plików

**Opis problemu:**
Media są usuwane z UI nawet jeśli request DELETE się nie powiódł.

**Pliki:**
- `src/components/features/trainings/TrainingForm.tsx:145-152`
- `src/components/features/personal-records/PersonalRecordForm.tsx:115`

**Rozwiązanie:**
```typescript
const handleMediaRemove = async (fileId: string) => {
  try {
    const response = await fetch(`/api/media/${fileId}`, { method: 'DELETE' });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to delete media');
    }

    // Tylko jeśli sukces - usuń ze stanu
    setUploadedMedia((prev) => prev.filter((f) => f.id !== fileId));
  } catch (error) {
    console.error('Error removing media:', error);
    setError(error instanceof Error ? error.message : 'Nie udało się usunąć pliku');
  }
};
```

**Task checklist:**
- [ ] Fix handleMediaRemove w TrainingForm.tsx
- [ ] Fix handleMediaRemove w PersonalRecordForm.tsx
- [ ] Dodaj error state display
- [ ] Test scenariusz: server down podczas delete
- [ ] Test scenariusz: 500 error z serwera

---

### 

**Czas:** 20 minut
**Impact:** 🔥🔥 Bug - złe UX
**Risk:** Generic error zamiast konkretnego komunikatu

**Opis problemu:**
`await response.json()` może rzucić błąd jeśli response nie jest JSON.

**Pliki:**
- `src/components/features/media/MediaUpload.tsx:89-92`
- Potencjalnie inne miejsca z podobnym kodem

**Rozwiązanie:**
```typescript
if (!response.ok) {
  let errorMessage = 'Błąd podczas uploadu';

  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } else {
      const text = await response.text();
      errorMessage = text || `HTTP ${response.status}`;
    }
  } catch (parseError) {
    console.error('Error parsing error response:', parseError);
  }

  throw new Error(errorMessage);
}
```

**Task checklist:**
- [ ] Audit wszystkich miejsc z `response.json()`
- [ ] Dodaj safe JSON parsing helper
- [ ] Apply w MediaUpload.tsx
- [ ] Apply w innych miejscach
- [ ] Test z non-JSON response

---

### P1.4 - README.md to Generic Template
**Czas:** 30 minut
**Impact:** 🔥🔥 Dokumentacja
**Risk:** Nowi developerzy nie wiedzą jak uruchomić projekt

**Opis problemu:**
README.md zawiera niezmieniony szablon Astro. Cała dokumentacja jest w CLAUDE.md.

**Pliki:**
- `README.md`
- `CLAUDE.md`

**Rozwiązanie:**
```markdown
# 🏋️ Dziennik Treningowy

> Full-stack fitness tracking application built with Astro 5, React 19, and PostgreSQL

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Astro](https://img.shields.io/badge/Astro-5.16-orange)

## ✨ Features

- 📊 Track workouts with detailed metrics
- 🎯 Set and monitor fitness goals
- 🏆 Record personal bests
- 📱 PWA support with offline capabilities
- 🎨 Dark mode
- 📄 PDF export for training reports
- 📸 Photo/video attachments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```
4. Setup database:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```
5. Run development server:
   ```bash
   pnpm dev
   ```

## 📚 Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed development guide.

## 🧪 Testing

```bash
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
pnpm test:coverage # Coverage report
```

## 📦 Deployment

```bash
pnpm build
pnpm start
```

## 🛠️ Tech Stack

- **Framework:** Astro 5 (SSR)
- **UI:** React 19 + Tailwind CSS 4
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Better Auth 1.4
- **Email:** Resend
- **PDF:** jsPDF

## 📝 License

MIT
```

**Task checklist:**
- [ ] Napisz nowy README.md
- [ ] Dodaj badges
- [ ] Dodaj screenshot aplikacji
- [ ] Przenies technical details do CLAUDE.md
- [ ] Sprawdź czy linki działają

---

## 🔥 PRIORYTET 2: WYSOKIE (Fix Before Production Scaling)

### P2.1 - Duplikacja Ownership Check (120 linii kodu)
**Czas:** 2 godziny
**Impact:** 🟠🟠🟠 Maintainability
**Saved:** ~100 linii kodu

**Opis problemu:**
Ten sam pattern ownership check powtórzony w 9+ endpoints.

**Pliki:**
- `src/pages/api/trainings/[id].ts`
- `src/pages/api/personal-records/[id].ts`
- `src/pages/api/goals/[id].ts`
- `src/pages/api/training-types/[id].ts`
- Wszystkie endpointy DELETE/PUT

**Rozwiązanie:**
```typescript
// src/lib/api-helpers.ts

import type { PgTable } from 'drizzle-orm/pg-core';

type ResourceType = 'training' | 'goal' | 'personal-record' | 'training-type' | 'media';

export async function requireOwnership<T extends PgTable>(
  table: T,
  id: string,
  userId: string,
  resourceType: ResourceType
): Promise<T['$inferSelect'] | Response> {
  const [existing] = await db
    .select()
    .from(table)
    .where(and(eq(table.id, id), eq(table.userId, userId)))
    .limit(1);

  if (!existing) {
    return createNotFoundError(resourceType, id);
  }

  return existing;
}

// Użycie:
const result = await requireOwnership(trainings, id, authResult.user.id, 'training');
if (result instanceof Response) return result;
// result jest teraz typowany jako Training
```

**Task checklist:**
- [ ] Stwórz helper w api-helpers.ts
- [ ] Dodaj unit tests dla helpera
- [ ] Refactor trainings/[id].ts
- [ ] Refactor personal-records/[id].ts
- [ ] Refactor goals/[id].ts
- [ ] Refactor training-types/[id].ts
- [ ] Verify wszystkie endpointy działają

---

### P2.2 - Duplikacja Media Grouping Logic (45 linii)
**Czas:** 1 godzina
**Impact:** 🟠🟠 Maintainability
**Saved:** ~40 linii kodu

**Rozwiązanie:**
```typescript
// src/lib/utils/media.ts

export function groupMediaByEntity<T extends { trainingId?: string; recordId?: string }>(
  media: T[],
  key: 'trainingId' | 'recordId'
): Record<string, T[]> {
  return media.reduce((acc, item) => {
    const id = item[key];
    if (!id) return acc;
    if (!acc[id]) acc[id] = [];
    acc[id].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// Użycie:
const mediaByTraining = groupMediaByEntity(allMedia, 'trainingId');
```

**Task checklist:**
- [ ] Stwórz helper w utils/media.ts
- [ ] Dodaj unit tests
- [ ] Refactor trainings/index.ts
- [ ] Refactor personal-records/index.ts
- [ ] Refactor dashboard.ts

---

### P2.3 - Huge Components Refactoring
**Czas:** 6 godzin
**Impact:** 🟠🟠🟠 Maintainability + Performance

**Komponenty do refactoringu:**
1. **TrainingDetails.tsx (327 linii)** → 3 komponenty
2. **MediaGallery.tsx (308 linii)** → 2 komponenty
3. **TrainingForm.tsx (295 linii)** → Extract sections

**Plan:**

#### TrainingDetails.tsx → 3 komponenty
```typescript
// TrainingDetails.tsx (100 linii)
// TrainingDetailsMedia.tsx (80 linii)
// TrainingDeleteDialog.tsx (60 linii)
```

#### MediaGallery.tsx → 2 komponenty
```typescript
// MediaGallery.tsx (150 linii)
// MediaLightbox.tsx (120 linii)
```

#### TrainingForm.tsx → Extract custom hook
```typescript
// TrainingForm.tsx (200 linii)
// useTrainingForm.ts (60 linii) - form logic
// MediaUploadSection.tsx (80 linii) - extracted
```

**Task checklist:**
- [ ] Refactor TrainingDetails.tsx
- [ ] Refactor MediaGallery.tsx
- [ ] Refactor TrainingForm.tsx
- [ ] Update imports
- [ ] Test każdy komponent osobno
- [ ] Verify performance (React DevTools)

---

### P2.4 - Sequential File Deletion → Parallel
**Czas:** 30 minut
**Impact:** 🟠🟠 Performance

**Rozwiązanie:**
```typescript
// src/pages/api/trainings/[id].ts:186-193
// Zamiast:
for (const m of media) {
  try {
    await storage.deleteFile(m.fileUrl);
  } catch (error) {
    console.error(`Error deleting file ${m.fileUrl}:`, error);
  }
}

// Użyj:
const deleteResults = await Promise.allSettled(
  media.map(m => storage.deleteFile(m.fileUrl))
);

// Log failures
deleteResults.forEach((result, index) => {
  if (result.status === 'rejected') {
    console.error(`Error deleting file ${media[index].fileUrl}:`, result.reason);
  }
});
```

**Task checklist:**
- [ ] Refactor w trainings/[id].ts
- [ ] Refactor w personal-records/[id].ts
- [ ] Test z multiple files
- [ ] Verify error handling

---

### P2.5 - Fix Type Safety w File Validation
**Czas:** 15 minut
**Impact:** 🟠 Type Safety

**Rozwiązanie:**
```typescript
// src/lib/validations/media.ts:48-54
export function validateFileType(file: File): 'image' | 'video' | null {
  const allowedImages: readonly string[] = ALLOWED_IMAGE_TYPES;
  const allowedVideos: readonly string[] = ALLOWED_VIDEO_TYPES;

  if (allowedImages.includes(file.type)) {
    return 'image';
  }
  if (allowedVideos.includes(file.type)) {
    return 'video';
  }
  return null;
}
```

**Task checklist:**
- [ ] Fix validateFileType
- [ ] Sprawdź czy są inne `as any`
- [ ] Run TypeScript strict check

---

### P2.6 - Success Messages Auto-Dismiss
**Czas:** 1 godzina
**Impact:** 🟠 UX

**Rozwiązanie:**
```typescript
// Custom hook
function useAutoHideSuccess(duration = 5000) {
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), duration);
      return () => clearTimeout(timer);
    }
  }, [success, duration]);

  return [success, setSuccess] as const;
}

// Użycie w formach:
const [success, setSuccess] = useAutoHideSuccess();
```

**Task checklist:**
- [ ] Stwórz hook useAutoHideSuccess
- [ ] Apply w TrainingForm
- [ ] Apply w PersonalRecordForm
- [ ] Apply w GoalForm
- [ ] Apply w LoginForm

---

## ⚠️ PRIORYTET 3: ŚREDNIE (Improve Quality)

### P3.1 - Add Test Coverage Measurement
**Czas:** 1 godzina
**Impact:** 🟡🟡 Quality Assurance

**Rozwiązanie:**
```json
// package.json
{
  "scripts": {
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^4.0.0",
    "@vitest/ui": "^4.0.0"
  }
}
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**', 'src/pages/api/**'],
      exclude: ['**/*.test.ts', '**/*.spec.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
```

**Task checklist:**
- [ ] Install coverage packages
- [ ] Configure vitest.config.ts
- [ ] Run coverage baseline
- [ ] Add coverage badge do README
- [ ] Set up coverage in CI

---

### P3.2 - Structured Logger zamiast console.*
**Czas:** 2 godziny
**Impact:** 🟡🟡 Observability

**Rozwiązanie:**
```bash
pnpm add pino pino-pretty
```

```typescript
// src/lib/logger.ts
import pino from 'pino';

const isDev = import.meta.env.DEV;

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});

// Użycie:
logger.info({ userId }, 'User logged in');
logger.error({ error, context }, 'Database error');
```

**Task checklist:**
- [ ] Install pino
- [ ] Create logger.ts
- [ ] Replace console.error w API routes
- [ ] Replace console.log w components (tylko server-side)
- [ ] Add log rotation config

---

### P3.3 - Remove Unused Dependencies
**Czas:** 30 minut
**Impact:** 🟡 Bundle Size

**Do weryfikacji:**
- `@react-email/components` - NIE znaleziono użycia w kodzie

**Task checklist:**
- [ ] Verify czy @react-email/components jest używane
- [ ] Jeśli nie - usuń z package.json
- [ ] Run `pnpm install`
- [ ] Verify app działa
- [ ] Check bundle size diff

---

### P3.4 - Standardize Commit Messages
**Czas:** 15 minut + ongoing
**Impact:** 🟡 Git Workflow

**Rozwiązanie:**
```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional husky
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'ci'
    ]]
  }
};
```

**Task checklist:**
- [ ] Install commitlint + husky
- [ ] Configure commitlint
- [ ] Add pre-commit hook
- [ ] Update CONTRIBUTING.md z przykładami
- [ ] Apply na nowych commitach

---

### P3.5 - Extract Magic Numbers do Constants
**Czas:** 1 godzina
**Impact:** 🟡 Maintainability

**Przykłady:**
```typescript
// src/lib/constants.ts
export const LIMITS = {
  MEDIA: {
    MAX_FILE_SIZE_MB: 50,
    MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,
    MAX_IMAGES_PER_ENTITY: 5,
    MAX_VIDEOS_PER_ENTITY: 1,
  },
  TRAINING: {
    MAX_REFLECTION_LENGTH: 500,
    MIN_DURATION_MINUTES: 1,
    MAX_DURATION_MINUTES: 1440, // 24h
  },
  RATE_LIMIT: {
    AUTH_WINDOW_MS: 15 * 60 * 1000,
    AUTH_MAX_ATTEMPTS: 5,
    API_WINDOW_MS: 60 * 1000,
    API_MAX_REQUESTS: 60,
  }
} as const;
```

**Task checklist:**
- [ ] Create constants.ts
- [ ] Extract all magic numbers
- [ ] Update imports
- [ ] Verify app działa

---

### P3.6 - Add More Integration Tests
**Czas:** 4 godziny
**Impact:** 🟡🟡 Quality

**Brakujące testy:**
- Media upload flow (end-to-end)
- PDF generation
- Session expiration
- Rate limiter behavior

**Task checklist:**
- [ ] Test: Media upload with validation
- [ ] Test: PDF export dla różnych okresów
- [ ] Test: Session timeout
- [ ] Test: Rate limit enforcement
- [ ] Test: File deletion cascade

---

## 📝 PRIORYTET 4: NISKIE (Nice to Have)

### P4.1 - Add CI/CD Pipeline
**Czas:** 2 godziny
**Impact:** 🟢🟢 DevOps

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm test:coverage
      - run: pnpm build

      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

---

### P4.2 - Add Monitoring (Sentry)
**Czas:** 1 godzina
**Impact:** 🟢🟢 Observability

```bash
pnpm add @sentry/astro
```

---

### P4.3 - Sequential Uploads → Parallel (Optional)
**Czas:** 2 godziny
**Impact:** 🟢 UX

Tylko jeśli UX feedback wskazuje na problem.

---

### P4.4 - Add Performance Monitoring
**Czas:** 1 godzina
**Impact:** 🟢 Performance

Web Vitals tracking w production.

---

### P4.5 - Add API Documentation (OpenAPI)
**Czas:** 3 godziny
**Impact:** 🟢 Developer Experience

---

### P4.6 - Add Storybook dla UI Components
**Czas:** 4 godziny
**Impact:** 🟢 UI Development

---

### P4.7 - Optimize Bundle Size
**Czas:** 2 godziny
**Impact:** 🟢 Performance

Bundle analysis i code splitting.

---

### P4.8 - Add E2E Tests dla Critical Paths
**Czas:** 4 godziny
**Impact:** 🟢 Quality

Playwright tests dla user journeys.

---

## 📅 ROADMAP NAPRAW

### Sprint 1: Critical Fixes (1 tydzień)
**Cel:** Production-ready bez major bugs

- ✅ P1.1 - Memory Leak Fix (1h)
- ✅ P1.2 - Media Upload Bug (30min)
- ✅ P1.3 - JSON Parse Error (20min)
- ✅ P1.4 - README Update (30min)

**Total:** ~3 godziny
**Must complete przed wdrożeniem na produkcję**

---

### Sprint 2: Code Quality (2 tygodnie)
**Cel:** Reduce technical debt, improve maintainability

- ✅ P2.1 - Ownership Helper (2h)
- ✅ P2.2 - Media Grouping Helper (1h)
- ✅ P2.4 - Parallel File Deletion (30min)
- ✅ P2.5 - Type Safety Fix (15min)
- ✅ P2.6 - Success Auto-Hide (1h)
- ✅ P3.1 - Test Coverage (1h)
- ✅ P3.3 - Remove Unused Deps (30min)
- ✅ P3.5 - Extract Constants (1h)

**Total:** ~7.5 godziny

---

### Sprint 3: Refactoring (2 tygodnie)
**Cel:** Improve component architecture

- ✅ P2.3 - Huge Components Refactor (6h)
- ✅ P3.2 - Structured Logger (2h)
- ✅ P3.6 - Integration Tests (4h)

**Total:** ~12 godzin

---

### Sprint 4: DevOps & Monitoring (1 tydzień)
**Cel:** Production readiness

- ✅ P3.4 - Commit Standards (15min + setup)
- ✅ P4.1 - CI/CD Pipeline (2h)
- ✅ P4.2 - Sentry Integration (1h)
- ✅ P4.4 - Performance Monitoring (1h)

**Total:** ~4.5 godziny

---

### Backlog: Nice to Have
**Implementować based on priority:**

- P4.3 - Parallel Uploads (2h)
- P4.5 - API Documentation (3h)
- P4.6 - Storybook (4h)
- P4.7 - Bundle Optimization (2h)
- P4.8 - E2E Tests (4h)

**Total:** ~15 godzin

---

## 🎯 QUICK WINS (Do zrobienia dziś!)

Zadania które dają największy ROI przy najmniejszym wysiłku:

1. **P1.1 - Memory Leak** (1h) → 🔥 Prevents production crash
2. **P1.2 - Media Bug** (30min) → 🔥 Prevents data loss
3. **P1.4 - README** (30min) → 📚 Unlocks onboarding
4. **P2.5 - Type Safety** (15min) → ✅ Better DX
5. **P3.3 - Remove Deps** (30min) → 📦 Smaller bundle

**Total: 2h 45min** → Massive impact!

---

## 📊 SUMMARY BY EFFORT

### Low Effort (<1h) - 8 tasks
- P1.2, P1.3, P1.4, P2.5, P2.4, P3.3, P3.4, P3.5

### Medium Effort (1-3h) - 9 tasks
- P1.1, P2.1, P2.2, P2.6, P3.1, P3.2, P4.1, P4.2, P4.4

### High Effort (>3h) - 7 tasks
- P2.3, P3.6, P4.3, P4.5, P4.6, P4.7, P4.8

---

## 🚀 DEPLOYMENT CHECKLIST

Przed wdrożeniem na produkcję:

### Must Have ✅
- [ ] P1.1 - Memory Leak Fixed
- [ ] P1.2 - Media Bug Fixed
- [ ] P1.3 - JSON Error Handling
- [ ] P1.4 - README Updated
- [ ] P3.1 - Test Coverage >80%
- [ ] Wszystkie testy przechodzą
- [ ] Build działa bez errorów

### Should Have ⚠️
- [ ] P2.1 - Ownership Helper (code quality)
- [ ] P2.4 - Parallel File Deletion (performance)
- [ ] P3.2 - Logger (observability)
- [ ] P4.1 - CI/CD Pipeline
- [ ] P4.2 - Sentry Integration

### Nice to Have 💡
- [ ] P2.3 - Components Refactored
- [ ] P3.6 - Integration Tests
- [ ] P4.4 - Performance Monitoring

---

## 📋 TASK TEMPLATES (Ready for GitHub Issues)

### Template: Bug Fix
```markdown
## 🐛 [P1.X] Title

**Priority:** P1 - Critical
**Effort:** Xh
**Impact:** High/Medium/Low

### Problem
[Opis problemu]

### Files Affected
- `path/to/file.ts:line`

### Solution
```typescript
[Kod rozwiązania]
```

### Checklist
- [ ] Fix implemented
- [ ] Tests added
- [ ] Documentation updated
- [ ] Verified in dev
```

---

## 💬 RECOMMENDATIONS

### Immediate Actions (Next 24h)
1. Fix memory leak (P1.1)
2. Fix media bug (P1.2)
3. Update README (P1.4)

### This Week
- Complete all P1 tasks
- Start P2.1 and P2.2 (helpers)
- Add test coverage measurement

### This Month
- Complete all P2 tasks
- Start component refactoring
- Set up CI/CD

### Long Term
- Maintain >80% test coverage
- Keep components <200 LOC
- Regular dependency updates
- Monitor bundle size

---

**Koniec raportu priorytetyzacji.**

---

# 🔍 AUDYT KRYTYCZNY - 2026-02-02

## 📊 AKTUALNE METRYKI

| Metryka | Wartość |
|---------|---------|
| Plików źródłowych | 157 |
| Linie kodu | ~22,000 |
| TODO/FIXME | 0 ✅ |
| Podatności npm audit | 1 (moderate - esbuild w drizzle-kit) |
| Użycia `any` w src/ | 6 |
| Użycia `any` w testach | ~150 |
| `@ts-ignore` | 0 ✅ |
| console.log w produkcji | ~25 |
| node_modules | 371 MB |
| **Testów FAILING** | **114** ❌ |

---

## 🔴 NOWE KRYTYCZNE PROBLEMY

### 1. ❌ 114 TESTÓW NIE PRZECHODZI
**Status:** KRYTYCZNY - blokuje CI/CD

**Problem:** Po refaktoryzacji error-handlera testy oczekują starych komunikatów błędów, ale kod zwraca nowy format.

**Przykład błędu:**
```
tests/unit/security/resource-authorization.test.ts:425
Expected: "Training type not found or cannot be deleted"
Received: { code: "TRAINING_TYPE_NOT_FOUND", message: "training-type o ID ... nie został znaleziony" }
```

**Rozwiązanie:** Zaktualizować asercje w testach do nowego formatu `{ error: { code, category, message } }`.

**Priorytet:** ⏰ PILNE - bez działających testów projekt nie może być bezpiecznie rozwijany.

---

### 2. ⚠️ Weryfikacja email wyłączona na stałe
**Plik:** `src/lib/auth.ts:51`
```typescript
requireEmailVerification: false, // Wyłączone dla developmentu lokalnego
```

**Problem:** Komentarz sugeruje "dla developmentu", ale nie ma warunkowej logiki. W produkcji każdy może zarejestrować konto bez weryfikacji.

**Rozwiązanie:**
```typescript
requireEmailVerification: import.meta.env.PROD,
```

**Priorytet:** WYSOKI - pozwala na masowe tworzenie fałszywych kont.

---

### 3. 🔒 Rate Limiter w pamięci - nie skaluje się
**Plik:** `src/lib/rate-limit.ts:28`

**Problem:** Memory-based rate limiter:
- Resetuje się przy każdym restarcie serwera
- Nie działa z wieloma instancjami (load balancing)

**Rozwiązanie:** Zamienić na Redis-based (`@upstash/ratelimit`).

**Priorytet:** WYSOKI dla produkcji z wieloma instancjami.

---

## 🟠 POWAŻNE PROBLEMY

### 4. Path Traversal Protection niewystarczająca
**Plik:** `src/pages/api/files/[...path].ts:26-27`

**Problem:** Prosta walidacja `..` i `~` nie chroni przed:
- URL-encoded: `%2e%2e%2f`
- Null byte: `file%00.jpg`
- Double encoding: `%252e%252e%252f`

**Rozwiązanie:**
```typescript
const safePath = path.resolve(path.join(process.cwd(), 'public', 'uploads'), filePath);
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!safePath.startsWith(uploadsDir)) {
  return new Response('Invalid path', { status: 400 });
}
```

---

### 5. Brak limitu przestrzeni per użytkownik
**Problem:** 6 plików × 50MB × nieograniczona liczba encji = potencjalnie GB danych.

**Rozwiązanie:** Dodać limit przestrzeni per użytkownik (np. 500MB).

---

### 6. Niespójny format błędów API
**Problem:** Część endpointów używa nowego formatu z error-handler.ts, część starego `{ error: "string" }`.

**Pliki do naprawy:**
- `src/pages/api/upload.ts:37-40`
- `src/pages/api/files/[...path].ts:22`
- `src/lib/upload-helpers.ts`

---

### 7. Silent fail w TrainingList
**Plik:** `src/components/features/trainings/TrainingList.tsx:67-68`
```typescript
} catch {
  // Error fetching trainings - silent fail
}
```

**Problem:** Błędy sieciowe są ignorowane - użytkownik nie wie że coś poszło nie tak.

---

## 💡 TOP 5 REKOMENDACJI

### 1. NAPRAW TESTY ⏰ Pilne
Zaktualizuj asercje w 12 plikach testowych do nowego formatu błędów.

### 2. Włącz email verification na produkcji
```typescript
requireEmailVerification: import.meta.env.PROD,
```

### 3. Zamień rate limiter na Redis
Użyj `@upstash/ratelimit` dla skalowalności.

### 4. Popraw path traversal protection
Użyj `path.resolve()` i sprawdź prefix.

### 5. Ujednolic format błędów API
Zamień wszystkie `{ error: "string" }` na `createErrorResponse()`.

---

## ✅ CO DZIAŁA DOBRZE

1. **0 TODO/FIXME** - czysty kod
2. **0 @ts-ignore** - dobra jakość TypeScript
3. **Magic bytes validation** - sprawdzanie sygnatur plików
4. **CSRF protection** - Origin/Referer verification
5. **Indeksy DB** - główne query paths mają indeksy
6. **Scentralizowany error handling** - dobra architektura (choć niespójnie używana)
7. **Relacje DB z CASCADE** - spójność danych
8. **Rate limiting** - zaimplementowany (choć z limitacjami)

---

## 📋 CHECKLIST PRZED PRODUKCJĄ

- [ ] Naprawić 114 failing testów
- [ ] Włączyć email verification dla produkcji
- [ ] Poprawić path traversal protection
- [ ] Ujednolicić format błędów API
- [ ] Usunąć console.log z produkcyjnego kodu
- [ ] Rozważyć Redis rate limiting dla skalowalności
- [ ] Dodać limit przestrzeni per użytkownik

---

**Audyt przeprowadzony:** 2026-02-02
**Audytor:** Claude Code (Opus 4.5)
