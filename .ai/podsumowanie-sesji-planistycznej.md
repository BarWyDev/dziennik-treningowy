# Podsumowanie sesji planistycznej PRD

## Dziennik Treningowy - MVP

**Data sesji:** 2026-01-20

---

## 1. Opis projektu

### Główny problem
Aplikacja webowa do zapisywania odbytych treningów w celu monitorowania postępów i nastroju podczas ćwiczeń.

### Grupa docelowa
Wszyscy użytkownicy zainteresowani śledzeniem treningów - jeden uniwersalny UX niezależnie od poziomu zaawansowania.

---

## 2. Główne wymagania funkcjonalne MVP

### 2.1 System kont użytkowników
- Rejestracja: email + hasło
- Weryfikacja adresu email
- Logowanie/wylogowanie
- *Poza MVP: usuwanie konta, eksport danych (RODO)*

### 2.2 Zapisywanie treningu
Dane zapisywane dla każdego treningu:
- **Data** treningu
- **Rodzaj treningu** (wybór z listy lub własny)
- **Czas trwania** (picker z krokiem 5-minutowym, zakres 0:05 - 3:00h)
- **Notatka tekstowa** (opcjonalna)
- **Ocena zadowolenia** (obowiązkowa, skala 1-5)

### 2.3 Kategorie oceny po treningu
Skala 1-5 przedstawiona wizualnie (emotikony lub gwiazdki):
- Samopoczucie fizyczne (opcjonalne)
- Poziom energii (opcjonalne)
- Motywacja (opcjonalne)
- Trudność treningu (opcjonalne)
- **Ogólne zadowolenie** (obowiązkowe)

### 2.4 Rodzaje treningów
**Predefiniowane:**
- Siłowy
- Cardio
- HIIT
- Bieganie
- Rower
- Pływanie
- Joga/Stretching
- Sporty zespołowe
- Inne

**Możliwość dodania własnych typów przez użytkownika.**

### 2.5 Cele treningu
- Proste cele tekstowe przypisane do profilu użytkownika
- Limit: 3-5 aktywnych celów
- Możliwość oznaczania jako "osiągnięte" lub "archiwizowane"
- Bez automatycznego śledzenia realizacji w MVP

### 2.6 Filtrowanie treningów
Możliwość łączenia wielu kryteriów jednocześnie:
- Data OD-DO
- Rodzaj treningu
- Poziom zadowolenia (zakres)
- Opcja szybkiego resetu wszystkich filtrów

### 2.7 Edycja i usuwanie
- Możliwość edycji zapisanych treningów
- Możliwość usunięcia treningu
- Potwierdzenie przed usunięciem ("Czy na pewno chcesz usunąć ten trening?")

### 2.8 Eksport do PDF
**Dwa typy raportów:**
1. Szczegóły pojedynczego treningu
2. Podsumowanie okresowe (tygodniowe/miesięczne)

**Format:** Tabelaryczny (bez wykresów w MVP)

### 2.9 Dashboard (strona główna po zalogowaniu)
- Ostatnie 5 treningów
- Przycisk "Dodaj trening"
- Podsumowanie tygodnia (liczba treningów, średnie zadowolenie)
- Lista aktywnych celów użytkownika

---

## 3. Kluczowe historie użytkownika

### HU-1: Rejestracja i logowanie
> Jako nowy użytkownik chcę założyć konto za pomocą emaila i hasła, aby móc przechowywać swój dziennik treningowy.

### HU-2: Dodawanie treningu
> Jako zalogowany użytkownik chcę szybko zapisać odbyte ćwiczenia z datą, rodzajem, czasem trwania i oceną, aby śledzić swoje postępy.

### HU-3: Ocena samopoczucia
> Jako użytkownik chcę ocenić swoje samopoczucie po treningu w kilku kategoriach, aby monitorować wpływ ćwiczeń na mój nastrój.

### HU-4: Przeglądanie historii
> Jako użytkownik chcę przeglądać i filtrować swoje treningi po dacie, rodzaju i zadowoleniu, aby analizować swoją aktywność.

### HU-5: Zarządzanie celami
> Jako użytkownik chcę zapisywać cele treningowe i oznaczać je jako osiągnięte, aby utrzymać motywację.

### HU-6: Eksport do PDF
> Jako użytkownik chcę wygenerować raport PDF z pojedynczego treningu lub podsumowanie okresu, aby mieć dokumentację offline.

### HU-7: Edycja i usuwanie
> Jako użytkownik chcę móc edytować lub usunąć błędnie wprowadzony trening, aby utrzymać dokładność dziennika.

---

## 4. Ścieżki korzystania z produktu

### Ścieżka 1: Nowy użytkownik
1. Wejście na stronę główną
2. Kliknięcie "Zarejestruj się"
3. Podanie emaila i hasła
4. Weryfikacja adresu email
5. Zalogowanie się
6. Wyświetlenie pustego dashboardu z zachętą do dodania pierwszego treningu

### Ścieżka 2: Dodawanie treningu
1. Zalogowanie się
2. Kliknięcie "Dodaj trening"
3. Wybór daty (domyślnie: dziś)
4. Wybór rodzaju treningu z listy lub dodanie własnego
5. Ustawienie czasu trwania (picker)
6. Ocena ogólnego zadowolenia (obowiązkowa)
7. Opcjonalnie: ocena pozostałych kategorii
8. Opcjonalnie: dodanie notatki
9. Zapisanie treningu
10. Powrót do dashboardu z zaktualizowaną listą

### Ścieżka 3: Przeglądanie i filtrowanie
1. Przejście do widoku "Historia treningów"
2. Ustawienie filtrów (data, rodzaj, zadowolenie)
3. Przeglądanie przefiltrowanych wyników
4. Opcjonalnie: reset filtrów

### Ścieżka 4: Generowanie PDF
1. Wybór pojedynczego treningu LUB zakresu dat
2. Kliknięcie "Eksportuj do PDF"
3. Pobranie wygenerowanego pliku

---

## 5. Kryteria sukcesu MVP

### Kryteria funkcjonalne (zatwierdzone)
| Kryterium | Opis |
|-----------|------|
| Rejestracja/logowanie | Użytkownik może założyć konto i zalogować się |
| Dodawanie treningów | Użytkownik może zapisać trening ze wszystkimi wymaganymi polami |
| Ocena zadowolenia | Użytkownik może ocenić trening w skali 1-5 |
| Filtrowanie | Użytkownik może filtrować treningi po wielu kryteriach |
| Cele | Użytkownik może dodać i zarządzać celami treningowymi |
| Generowanie PDF | Użytkownik może wygenerować raport PDF |

---

## 6. Wymagania techniczne

### Platforma
- Aplikacja webowa (responsywna)
- Bez aplikacji mobilnych w MVP

### Język
- Polski (MVP)
- Mechanizm i18n w kodzie od początku (przygotowanie na przyszłe tłumaczenia)

### Model biznesowy
- Darmowa w MVP
- Monetyzacja do rozważenia w kolejnych etapach

---

## 7. Poza zakresem MVP

| Funkcjonalność | Status |
|----------------|--------|
| Wysyłka PDF mailem | Odroczone |
| Współdzielenie treningów między użytkownikami | Odroczone |
| Integracje z platformami treningowymi | Odroczone |
| Aplikacje mobilne (iOS/Android) | Odroczone |
| Usuwanie konta / eksport danych (RODO) | Odroczone |
| Wykresy i wizualizacje w PDF | Odroczone |
| Logowanie przez Google/Facebook | Odroczone |
| Automatyczne śledzenie realizacji celów | Odroczone |

---

## 8. Otwarte kwestie do rozwiązania

1. **Technologia:** Nie ustalono stosu technologicznego (frontend, backend, baza danych)
2. **Hosting:** Nie określono gdzie aplikacja będzie hostowana
3. **Zabezpieczenia:** Szczegóły dotyczące bezpieczeństwa danych i szyfrowania haseł
4. **Limity:** Maksymalna liczba treningów na użytkownika, rozmiar notatki tekstowej
5. **Odzyskiwanie hasła:** Proces resetowania zapomnianego hasła

---

## 9. Następne kroki

1. Wybór stosu technologicznego
2. Stworzenie szczegółowego PRD na podstawie tego podsumowania
3. Projektowanie UI/UX (wireframes)
4. Planowanie sprintów deweloperskich
5. Implementacja MVP

---

*Dokument wygenerowany automatycznie na podstawie sesji planistycznej.*
