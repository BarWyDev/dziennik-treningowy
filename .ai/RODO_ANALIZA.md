# Analiza RODO/GDPR — TrainWise (Dziennik Treningowy)

Data analizy: 2026-02-18

---

## 1. WYMAGANIA PRAWNE

### Kluczowe przepisy RODO mające zastosowanie:

**Art. 5** — Zasady przetwarzania danych:
- Zgodność z prawem, rzetelność, przejrzystość
- Ograniczenie celu
- Minimalizacja danych
- Prawidłowość
- Ograniczenie przechowywania
- Integralność i poufność
- Rozliczalność

**Art. 6 ust. 1 lit. b** — Podstawa prawna: wykonanie umowy (świadczenie usługi śledzenia treningów)

**Art. 9 ust. 1 i ust. 2 lit. a** — **KRYTYCZNE**: Aplikacja przetwarza dane dotyczące zdrowia:
- Oceny samopoczucia fizycznego (ratingPhysical)
- Oceny poziomu energii (ratingEnergy)
- Czas trwania i intensywność ćwiczeń
- Spalone kalorie
- Rekordy osobiste (wyniki fizyczne)
- Cele treningowe dotyczące kondycji

Te dane kwalifikują się jako **szczególna kategoria danych osobowych** (dane dotyczące zdrowia) i wymagają **wyraźnej, oddzielnej zgody**.

**Art. 7** — Warunki wyrażenia zgody (dobrowolna, konkretna, świadoma, jednoznaczna)

**Art. 13** — Obowiązek informacyjny (klauzula informacyjna przy zbieraniu danych)

**Art. 15-22** — Prawa osób, których dane dotyczą:
- Art. 15 — prawo dostępu
- Art. 16 — prawo do sprostowania
- Art. 17 — prawo do usunięcia ("prawo do bycia zapomnianym")
- Art. 18 — prawo do ograniczenia przetwarzania
- Art. 20 — prawo do przenoszenia danych
- Art. 21 — prawo do sprzeciwu

**Art. 30** — Rejestr czynności przetwarzania

**Ustawa z dnia 10 maja 2018 r. o ochronie danych osobowych** — polska implementacja RODO

**Ustawa z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną** — wymóg regulaminu usługi

---

## 2. ANALIZA ZGODNOŚCI

### Aktualny stan: NIEZGODNY Z RODO

| Element | Status | Priorytet |
|---------|--------|-----------|
| Polityka prywatności | BRAK | KRYTYCZNY |
| Regulamin usługi | BRAK | KRYTYCZNY |
| Zgoda na dane zdrowotne (Art. 9) | BRAK | KRYTYCZNY |
| Checkboxy zgód przy rejestracji | BRAK | KRYTYCZNY |
| Klauzula informacyjna (Art. 13) | BRAK | KRYTYCZNY |
| Prawo do usunięcia konta (Art. 17) | BRAK interfejsu (kaskadowe usuwanie w DB istnieje) | WYSOKI |
| Prawo do eksportu danych (Art. 20) | BRAK | WYSOKI |
| Mechanizm wycofania zgody | BRAK | WYSOKI |
| Cookie banner | BRAK (ale używa tylko sesyjnych — niski priorytet) | NISKI |
| Linki prawne w stopce | BRAK | ŚREDNI |
| Strona ustawień konta | BRAK | ŚREDNI |

### Co już istnieje:
- Email verification (wymagana przed dostępem do aplikacji)
- Kaskadowe usuwanie danych w schemacie DB (onDelete: cascade)
- Zarządzanie sesjami (7-dniowe wygasanie)
- Hashowanie haseł (Better Auth)
- HTTPS (Cloudflare SSL: Full Strict)

### Kluczowe luki:
1. **Brak zgody na przetwarzanie danych zdrowotnych** — najpoważniejsze naruszenie
2. **Brak polityki prywatności** — naruszenie Art. 13
3. **Brak regulaminu** — naruszenie ustawy o świadczeniu usług drogą elektroniczną
4. **Brak możliwości usunięcia konta** przez użytkownika
5. **Brak możliwości eksportu danych** (prawo do przenoszenia)

---

## 3. WYMAGANE ELEMENTY

### A. Checkboxy przy rejestracji (2 oddzielne)

> **Uzasadnienie redukcji z 3 do 2 checkboxów:**
> Polityka Prywatności to dokument informacyjny (obowiązek Art. 13 RODO), NIE zgoda.
> Użytkownik nie musi jej "akceptować" — wystarczy potwierdzenie zapoznania się.
> Można to połączyć z akceptacją Regulaminu, bo oba dotyczą tego samego celu (rozpoczęcie korzystania z usługi).
> Zgoda na dane zdrowotne (Art. 9) MUSI być oddzielna — inna podstawa prawna (Art. 7(2), Motyw 43).
> Zgodne z wytycznymi EDPB 05/2020, praktyką branżową (Strava, MyFitnessPal) i rekomendacjami UODO.

**Checkbox 1 — Regulamin + Polityka Prywatności (OBOWIĄZKOWY):**
> ☐ Akceptuję [Regulamin](/regulamin) serwisu TrainWise i potwierdzam zapoznanie się z [Polityką Prywatności](/polityka-prywatnosci). *

**Checkbox 2 — Zgoda na dane zdrowotne Art. 9 (OBOWIĄZKOWY):**
> ☐ Wyrażam wyraźną zgodę na przetwarzanie moich danych dotyczących zdrowia (samopoczucie fizyczne, poziom energii, aktywność fizyczna, spalone kalorie, rekordy osobiste) w celu świadczenia usługi śledzenia treningów. Mogę wycofać tę zgodę w dowolnym momencie w ustawieniach konta. *

**Zasady:**
- Żaden checkbox NIE MOŻE być domyślnie zaznaczony
- Oba checkboxy są obowiązkowe do rejestracji
- Muszą być oddzielne (nie łączone w jeden)
- Linki do dokumentów muszą otwierać się w nowej karcie

### B. Polityka Prywatności musi zawierać:

1. **Tożsamość administratora** — imię/nazwisko lub nazwa firmy, adres, email kontaktowy
2. **Cele przetwarzania** — świadczenie usługi, zarządzanie kontem, bezpieczeństwo
3. **Podstawy prawne** — Art. 6(1)(b) umowa, Art. 9(2)(a) zgoda na dane zdrowotne
4. **Kategorie danych** — email, imię, dane treningowe, dane zdrowotne, dane techniczne
5. **Odbiorcy danych** — Resend (email), Cloudflare (CDN), hosting (Mikrus)
6. **Transfer danych poza EOG** — Resend i Cloudflare mogą transferować dane do USA
7. **Okres przechowywania** — do usunięcia konta, backupy 7 dni
8. **Prawa użytkownika** — dostęp, sprostowanie, usunięcie, przenoszenie, sprzeciw, wycofanie zgody
9. **Prawo do skargi** do Prezesa UODO
10. **Informacja o plikach cookies** — sesyjne, niezbędne do działania
11. **Dobrowolność podania danych** — konsekwencje odmowy
12. **Profilowanie** — informacja, czy występuje (w tym przypadku nie)

### C. Regulamin musi zawierać:

1. Postanowienia ogólne (nazwa usługi, administrator)
2. Definicje
3. Warunki korzystania z usługi
4. Rejestracja i konto użytkownika
5. Zasady korzystania z serwisu
6. Odpowiedzialność
7. Reklamacje
8. Odstąpienie od umowy
9. Zmiana regulaminu
10. Postanowienia końcowe

---

## 4. PLAN IMPLEMENTACJI

### Faza 1: Dokumenty prawne (KRYTYCZNE)

**1.1. Utworzenie strony Polityki Prywatności**
- Plik: `src/pages/polityka-prywatnosci.astro`
- Layout: `MainLayout` (dostępna bez logowania)
- Treść: pełna klauzula informacyjna wg Art. 13 RODO

**1.2. Utworzenie strony Regulaminu**
- Plik: `src/pages/regulamin.astro`
- Layout: `MainLayout` (dostępna bez logowania)

**1.3. Dodanie linków w stopce**
- Landing page (`index.astro`) — linki do polityki i regulaminu
- Wszystkie layouty (`MainLayout.astro`, `AppLayout.astro`) — linki w stopce

**1.4. Aktualizacja middleware**
- Plik: `src/middleware.ts`
- Dodać `/polityka-prywatnosci` i `/regulamin` do listy stron publicznych

### Faza 2: Zgody przy rejestracji (KRYTYCZNE)

**2.1. Komponent Checkbox UI**
- Plik: `src/components/ui/Checkbox.tsx`
- Stylizowany checkbox z obsługą React Hook Form

**2.2. Aktualizacja schematu walidacji**
- Plik: `src/lib/validations/auth.ts`
- Dodać pola: `acceptTerms` (Regulamin + PP), `acceptHealthData` (dane zdrowotne) — boolean, wymagane = true

**2.3. Aktualizacja formularza rejestracji**
- Plik: `src/components/features/auth/RegisterForm.tsx`
- Dodać 2 checkboxy z odpowiednimi tekstami i linkami
- Walidacja: oba muszą być zaznaczone

**2.4. Aktualizacja schematu bazy danych**
- Plik: `src/lib/db/schema.ts`
- Nowa tabela `user_consents`:

```typescript
export const userConsents = pgTable('user_consents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  consentType: text('consent_type').notNull(), // 'terms_privacy', 'health_data'
  version: text('version').notNull(),           // '1.0', '1.1' etc.
  grantedAt: timestamp('granted_at').notNull().defaultNow(),
  withdrawnAt: timestamp('withdrawn_at'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

**2.5. Migracja bazy danych**
- `pnpm db:generate` + `pnpm db:migrate`
- Dla istniejących użytkowników: wymóg zaakceptowania przy następnym logowaniu

**2.6. Zapisywanie zgód przy rejestracji**
- Endpoint rejestracji zapisuje wpisy w `user_consents` z IP i user agent
- Każda zgoda to osobny wpis z typem i wersją dokumentu

### Faza 3: Prawa użytkownika (WYSOKI)

**3.1. Strona ustawień konta**
- Plik: `src/pages/settings.astro`
- Komponent: `src/components/features/settings/AccountSettings.tsx`
- Sekcje: zarządzanie zgodami, eksport danych, usunięcie konta

**3.2. Eksport danych (Art. 20)**
- Endpoint: `src/pages/api/account/export.ts`
- Format: JSON zawierający wszystkie dane użytkownika (treningi, cele, rekordy, metadane mediów)
- Przycisk "Pobierz moje dane" w ustawieniach

**3.3. Usunięcie konta (Art. 17)**
- Endpoint: `src/pages/api/account/delete.ts`
- Dialog potwierdzenia z wpisaniem hasła
- Kaskadowe usunięcie wszystkich danych (już skonfigurowane w DB schema)
- Usunięcie plików mediów z dysku
- Wylogowanie i przekierowanie na stronę główną

**3.4. Wycofanie zgody na dane zdrowotne**
- Endpoint: `src/pages/api/account/consent.ts`
- Przy wycofaniu: informacja o konsekwencjach (brak możliwości korzystania z usługi)
- Aktualizacja wpisu w `user_consents` (ustawienie `withdrawnAt`)
- Opcja: deaktywacja konta lub usunięcie danych zdrowotnych

### Faza 4: Dodatkowe elementy (ŚREDNI)

**4.1. Nawigacja — link do Ustawień**
- Dodać "Ustawienia" / "Moje konto" w menu użytkownika (UserMenu component)

**4.2. Wymuszenie akceptacji dla istniejących użytkowników**
- Middleware sprawdzający czy użytkownik zaakceptował aktualne wersje dokumentów
- Przekierowanie na stronę akceptacji jeśli nie
- Strona: `src/pages/accept-terms.astro`

**4.3. Wersjonowanie dokumentów prawnych**
- Stałe z wersjami dokumentów w kodzie (np. `TERMS_VERSION = '1.0'`)
- Przy zmianach dokumentów — nowa wersja i wymóg ponownej akceptacji

---

## 5. REKOMENDACJE DODATKOWE

1. **Kontakt z prawnikiem** — treści polityki prywatności i regulaminu powinny być zweryfikowane przez prawnika specjalizującego się w ochronie danych osobowych.

2. **Inspektor Ochrony Danych (IOD/DPO)** — przy obecnej skali (aplikacja osobista/MVP) wyznaczenie IOD nie jest obowiązkowe, ale warto wskazać osobę kontaktową ds. danych osobowych.

3. **Rejestr czynności przetwarzania** (Art. 30) — utworzyć dokument wewnętrzny opisujący wszystkie czynności przetwarzania (osobny plik `.ai/RODO_REJESTR.md`).

4. **Cookie banner** — aktualnie aplikacja używa jedynie sesyjnych cookies (niezbędne do działania), więc formalnie cookie banner nie jest wymagany. Jeśli w przyszłości pojawią się analityki (np. Google Analytics), banner stanie się obowiązkowy.

5. **Retencja danych** — ustalić i udokumentować politykę retencji:
   - Dane konta: do momentu usunięcia konta
   - Backupy: 7 dni (już skonfigurowane)
   - Logi serwera: określić okres (np. 30 dni)

6. **Priorytet wdrożenia**:
   - Faza 1 + 2: **natychmiast** (aplikacja na produkcji bez wymaganych prawnie elementów)
   - Faza 3: w ciągu 2-4 tygodni
   - Faza 4: nice-to-have, ale wzmacnia compliance

7. **Dane o zdrowiu vs dane o aktywności** — istnieje debata prawna, czy dane o ćwiczeniach fizycznych (czas, rodzaj) same w sobie są danymi o zdrowiu. Jednak oceny samopoczucia fizycznego, energii i spalone kalorie **jednoznacznie** klasyfikują się jako dane dotyczące zdrowia wg wytycznych EROD (Europejska Rada Ochrony Danych). Bezpieczniej jest traktować je jako takie.

---

## Struktura plików do utworzenia

```
src/
├── pages/
│   ├── polityka-prywatnosci.astro          # Polityka prywatności (publiczna)
│   ├── regulamin.astro                      # Regulamin (publiczny)
│   ├── settings.astro                       # Ustawienia konta (chroniona)
│   ├── accept-terms.astro                   # Wymuszenie akceptacji (chroniona)
│   └── api/
│       └── account/
│           ├── export.ts                    # Eksport danych użytkownika
│           ├── delete.ts                    # Usunięcie konta
│           └── consent.ts                   # Zarządzanie zgodami
├── components/
│   ├── ui/
│   │   └── Checkbox.tsx                     # Komponent checkbox
│   └── features/
│       └── settings/
│           ├── AccountSettings.tsx          # Ustawienia konta
│           ├── DataExport.tsx               # Eksport danych
│           ├── AccountDeletion.tsx          # Usunięcie konta
│           └── ConsentManager.tsx           # Zarządzanie zgodami
└── lib/
    └── db/
        └── schema.ts                        # + tabela user_consents
```

## Pliki do modyfikacji

```
src/
├── components/features/auth/RegisterForm.tsx  # + checkboxy zgód
├── lib/validations/auth.ts                    # + pola zgód w schemacie
├── lib/db/schema.ts                           # + tabela user_consents
├── middleware.ts                               # + publiczne strony prawne
├── layouts/MainLayout.astro                   # + linki w stopce
├── layouts/AppLayout.astro                    # + linki w stopce
├── pages/index.astro                          # + linki w stopce
└── components/layout/Navbar.tsx               # + link do ustawień
```
