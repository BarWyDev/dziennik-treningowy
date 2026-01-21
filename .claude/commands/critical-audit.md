# Krytyczny Audyt Projektu

Wykonaj dogłębny, krytyczny audyt projektu. Nie oszczędzaj krytyki - znajdź rzeczywiste problemy i zagrożenia.

## 1. ANALIZA ARCHITEKTURY I STRUKTURY

### Struktura projektu
- Czy organizacja folderów ma sens i jest skalowalna?
- Czy są zbędne lub zduplikowane pliki?
- Czy nazewnictwo jest spójne i zrozumiałe?
- **KRYTYCZNIE**: Znajdź niepotrzebne abstrakcje, over-engineering, lub chaotyczną strukturę

### Zależności i dependencje
- Przeanalizuj package.json/requirements.txt/go.mod
- Czy są nieużywane zależności? (uruchom `npm depcheck` lub odpowiednik)
- Czy są przestarzałe lub podatne wersje? (npm audit, safety check)
- Czy rozmiar bundle'a jest rozsądny?
- **KRYTYCZNIE**: Czy ktoś nie dodał 5 bibliotek do rzeczy, które można zrobić w 10 linijkach?

## 2. JAKOŚĆ KODU

### Code smells i anti-patterns
- Znajdź zbyt długie funkcje (>50 linii)
- Znajdź zbyt skomplikowane funkcje (cyklomatyczna złożoność >10)
- Znajdź głębokie zagnieżdżenia (>4 poziomy)
- Znajdź duplikację kodu
- **KRYTYCZNIE**: Pokaż konkretne przykłady złego kodu z numerami linii

### Praktyki programowania
- Czy zmienne i funkcje mają sensowne nazwy?
- Czy są magic numbers/strings bez stałych?
- Czy error handling jest konsekwentny?
- Czy są komentarze typu "// fix later" lub "// TODO"?
- Czy są zakomentowane bloki kodu?
- **KRYTYCZNIE**: Znajdź każdy TODO/FIXME/HACK i oceń jak pilne są te problemy

### TypeScript/Type Safety (jeśli dotyczy)
- Czy są użycia `any`?
- Czy typy są właściwie zdefiniowane?
- Czy są type assertions (`as`) które ukrywają problemy?
- **KRYTYCZNIE**: Policz ile jest `any` i `@ts-ignore` - to czerwone flagi

## 3. BEZPIECZEŃSTWO

### Podatności
- Uruchom skanowanie bezpieczeństwa (npm audit, bandit, gosec)
- Sprawdź czy secrets/klucze API nie są hardcoded
- Grep za słowami: password, secret, api_key, token w kodzie
- **KRYTYCZNIE**: Każda znaleziona podatność to potencjalna katastrofa

### Walidacja i sanityzacja
- Czy input użytkownika jest walidowany?
- Czy są zabezpieczenia przed SQL injection, XSS, CSRF?
- Czy są rate limiting i zabezpieczenia API?
- **KRYTYCZNIE**: Znajdź miejsca gdzie dane od użytkownika trafiają bezpośrednio do bazy/UI

### Uwierzytelnienie i autoryzacja
- Czy auth jest właściwie zaimplementowany?
- Czy są sprawdzane uprawnienia przy każdym endpoincie?
- Czy sesje są właściwie zarządzane?

## 4. WYDAJNOŚĆ

### Potencjalne wąskie gardła
- Znajdź N+1 queries
- Znajdź synchroniczne operacje które mogą być async
- Znajdź brak cachowania gdzie powinien być
- Znajdź duże pętle bez optymalizacji
- **KRYTYCZNIE**: Symuluj co się stanie przy 1000x większym ruchu

### Frontend (jeśli dotyczy)
- Czy są lazy loading dla dużych komponentów?
- Czy obrazki są optymalizowane?
- Czy jest code splitting?
- Czy są niepotrzebne re-rendery?

### Backend/Database
- Czy zapytania SQL mają indexy?
- Czy są optymalne queries czy SELECT *?
- Czy jest connection pooling?

## 5. TESTY

### Pokrycie testowe
- Jaki jest % pokrycia testami?
- Czy logika biznesowa jest pokryta?
- Czy są testy edge cases?
- **KRYTYCZNIE**: Znajdź najbardziej krytyczne ścieżki bez testów

### Jakość testów
- Czy testy testują właściwe rzeczy czy tylko mock'ują wszystko?
- Czy są testy integracyjne?
- Czy są testy end-to-end dla krytycznych flow?
- Czy testy są maintenance'owalne?

## 6. DOKUMENTACJA

### README i dokumentacja projektu
- Czy README wyjaśnia jak uruchomić projekt?
- Czy są opisane zmienne środowiskowe?
- Czy jest dokumentacja API?
- **KRYTYCZNIE**: Spróbuj mentalnie uruchomić projekt tylko na podstawie README - czy się da?

### Komentarze w kodzie
- Czy skomplikowana logika jest wyjaśniona?
- Czy komentarze są aktualne czy outdated?
- Czy są niepotrzebne komentarze dla oczywistych rzeczy?

## 7. BŁĘDY I ERROR HANDLING

### Obsługa błędów
- Czy wszystkie błędy są łapane i właściwie obsługiwane?
- Czy są puste catch blocks?
- Czy błędy są logowane z odpowiednim kontekstem?
- Czy użytkownik dostaje sensowne komunikaty?
- **KRYTYCZNIE**: Znajdź try-catch blocks z console.log() i niczym więcej

### Logging i monitoring
- Czy są logi dla krytycznych operacji?
- Czy logi mają odpowiedni poziom (debug/info/error)?
- Czy wrażliwe dane nie są logowane?

## 8. DEPLOYMENT I DEVOPS

### Konfiguracja
- Czy jest Docker/docker-compose?
- Czy są zmienne środowiskowe właściwie używane?
- Czy .env.example jest aktualny?
- Czy .gitignore jest właściwie skonfigurowany?

### CI/CD
- Czy jest pipeline CI/CD?
- Czy testy są uruchamiane automatycznie?
- Czy jest linting w CI?

## 9. KONSYSTENCJA I STANDARDY

### Style guide
- Czy kod jest spójnie sformatowany?
- Czy jest ESLint/Prettier/Black skonfigurowany?
- Czy wszyscy developerzy piszą w podobnym stylu?

### Git practices
- Czy commit messages są sensowne?
- Czy są feature branches czy wszystko na master?
- Czy jest branch protection?

## FORMAT RAPORTU

Przedstaw wyniki w następujący sposób:

### 🔴 KRYTYCZNE PROBLEMY (wymagają natychmiastowej uwagi)
Lista z konkretami: plik, linia, problem, dlaczego jest krytyczny

### 🟠 POWAŻNE PROBLEMY (powinny być naprawione szybko)
Lista z priorytetami

### 🟡 OSTRZEŻENIA (do poprawy w najbliższej przyszli)
Grouped by category

### 🟢 DOBRE PRAKTYKI (co jest zrobione dobrze)
Krótka lista - bądź szczery, jeśli jest niewiele

### 📊 METRYKI
- Liczba plików
- Linie kodu
- Liczba TODO/FIXME
- Pokrycie testami
- Liczba podatności bezpieczeństwa
- Rozmiar dependencji

### 💡 REKOMENDACJE
Top 5 rzeczy do naprawienia w pierwszej kolejności, z uzasadnieniem

## WAŻNE ZASADY

1. **Bądź bezlitosny ale konstruktywny** - wskaż konkretne problemy z przykładami
2. **Nie bądź dyplomatyczny** - jeśli kod jest zły, powiedz to
3. **Dawaj konkretne przykłady** - zawsze z nazwami plików i numerami linii
4. **Priorytetyzuj** - nie wszystko jest równie ważne
5. **Sugeruj rozwiązania** - nie tylko krytykuj, ale powiedz JAK to naprawić

Rozpocznij audyt od sprawdzenia struktury projektu i zidentyfikowania głównego stacku technologicznego.
