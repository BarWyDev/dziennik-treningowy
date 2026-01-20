# Dokument wymagań produktu (PRD) - Dziennik Treningowy

## 1. Przegląd produktu

Dziennik Treningowy to responsywna aplikacja webowa umożliwiająca użytkownikom zapisywanie odbytych treningów w celu monitorowania postępów i nastroju podczas ćwiczeń. Aplikacja skierowana jest do wszystkich osób zainteresowanych śledzeniem swojej aktywności fizycznej, niezależnie od poziomu zaawansowania.

Kluczowe cechy produktu:
- System kont użytkowników z rejestracją przez email
- Zapisywanie treningów z datą, rodzajem, czasem trwania i oceną
- Wielokategorialna ocena samopoczucia po treningu (skala 1-5)
- Zarządzanie celami treningowymi
- Filtrowanie i przeglądanie historii treningów
- Eksport danych do formatu PDF
- Interfejs w języku polskim z przygotowaniem na przyszłą internacjonalizację

Wersja MVP będzie w pełni darmowa, bez aplikacji mobilnych.

## 2. Problem użytkownika

Użytkownicy prowadzący aktywny tryb życia potrzebują prostego narzędzia do:

1. Dokumentowania treningów - brak centralnego miejsca do zapisywania informacji o odbytych ćwiczeniach prowadzi do utraty danych i braku możliwości analizy postępów.

2. Monitorowania samopoczucia - osoby ćwiczące chcą śledzić nie tylko parametry treningu, ale również swój nastrój, poziom energii i motywację, aby lepiej zrozumieć wpływ aktywności fizycznej na swoje zdrowie psychiczne.

3. Śledzenia postępów - bez systematycznego zapisu trudno ocenić długoterminowe efekty treningów i utrzymać motywację.

4. Realizacji celów - użytkownicy potrzebują miejsca do zapisania swoich celów treningowych i możliwości oznaczania ich jako osiągnięte.

5. Generowania raportów - potrzeba posiadania dokumentacji treningowej w formie offline do celów osobistych lub konsultacji z trenerem.

## 3. Wymagania funkcjonalne

### 3.1 System uwierzytelniania

- FR-001: System rejestracji przez email i hasło
- FR-002: Weryfikacja adresu email po rejestracji
- FR-003: Logowanie do systemu
- FR-004: Wylogowanie z systemu
- FR-005: Odzyskiwanie zapomnianego hasła

### 3.2 Dashboard (strona główna po zalogowaniu)

- FR-006: Wyświetlanie ostatnich 5 treningów
- FR-007: Przycisk szybkiego dodawania treningu
- FR-008: Podsumowanie bieżącego tygodnia (liczba treningów, średnie zadowolenie)
- FR-009: Lista aktywnych celów użytkownika
- FR-010: Komunikat zachęcający dla nowych użytkowników bez treningów

### 3.3 Zapisywanie treningu

- FR-011: Wybór daty treningu (domyślnie bieżący dzień)
- FR-012: Wybór rodzaju treningu z predefiniowanej listy
- FR-013: Możliwość dodania własnego typu treningu
- FR-014: Picker czasu trwania (krok 5 minut, zakres 0:05 - 3:00h)
- FR-015: Obowiązkowa ocena ogólnego zadowolenia (skala 1-5)
- FR-016: Opcjonalna ocena samopoczucia fizycznego (skala 1-5)
- FR-017: Opcjonalna ocena poziomu energii (skala 1-5)
- FR-018: Opcjonalna ocena motywacji (skala 1-5)
- FR-019: Opcjonalna ocena trudności treningu (skala 1-5)
- FR-020: Opcjonalna notatka tekstowa
- FR-021: Wizualna prezentacja skali ocen (emotikony lub gwiazdki)

### 3.4 Predefiniowane rodzaje treningów

- Siłowy
- Cardio
- HIIT
- Bieganie
- Rower
- Pływanie
- Joga/Stretching
- Sporty zespołowe
- Inne

### 3.5 Przeglądanie i filtrowanie treningów

- FR-022: Widok historii wszystkich treningów
- FR-023: Filtrowanie po zakresie dat (od-do)
- FR-024: Filtrowanie po rodzaju treningu
- FR-025: Filtrowanie po poziomie zadowolenia (zakres)
- FR-026: Możliwość łączenia wielu filtrów jednocześnie
- FR-027: Przycisk szybkiego resetu wszystkich filtrów

### 3.6 Edycja i usuwanie treningów

- FR-028: Możliwość edycji wszystkich pól zapisanego treningu
- FR-029: Możliwość usunięcia treningu
- FR-030: Dialog potwierdzenia przed usunięciem treningu

### 3.7 Zarządzanie celami

- FR-031: Dodawanie celów tekstowych
- FR-032: Limit 3-5 aktywnych celów na użytkownika
- FR-033: Oznaczanie celu jako "osiągnięty"
- FR-034: Archiwizacja celów
- FR-035: Wyświetlanie listy aktywnych celów

### 3.8 Eksport do PDF

- FR-036: Generowanie PDF ze szczegółami pojedynczego treningu
- FR-037: Generowanie PDF z podsumowaniem tygodniowym
- FR-038: Generowanie PDF z podsumowaniem miesięcznym
- FR-039: Format tabelaryczny raportów (bez wykresów)

## 4. Granice projektu

### 4.1 W zakresie MVP

- Aplikacja webowa responsywna (desktop, tablet, mobile)
- Interfejs w języku polskim
- Mechanizm i18n w kodzie (przygotowanie na przyszłe tłumaczenia)
- Rejestracja i logowanie przez email/hasło
- Pełna funkcjonalność zapisywania i zarządzania treningami
- System celów treningowych
- Filtrowanie i przeglądanie historii
- Eksport do PDF (format tabelaryczny)
- Model darmowy

### 4.2 Poza zakresem MVP

- Wysyłka PDF mailem
- Współdzielenie treningów między użytkownikami
- Integracje z platformami treningowymi (Strava, Garmin, itp.)
- Aplikacje mobilne natywne (iOS/Android)
- Usuwanie konta użytkownika
- Eksport danych użytkownika (RODO)
- Wykresy i wizualizacje w raportach PDF
- Logowanie przez Google/Facebook/Apple
- Automatyczne śledzenie realizacji celów
- Powiadomienia i przypomnienia
- Statystyki zaawansowane i analizy trendów
- Tryb offline
- API publiczne

## 5. Historie użytkownika

### US-001: Rejestracja nowego konta

Tytuł: Rejestracja użytkownika przez email

Opis: Jako nowy użytkownik chcę założyć konto za pomocą adresu email i hasła, aby móc przechowywać swój dziennik treningowy w bezpieczny sposób.

Kryteria akceptacji:
- Formularz rejestracji zawiera pola: email, hasło, potwierdzenie hasła
- System waliduje poprawność formatu adresu email
- Hasło musi mieć minimum 8 znaków, zawierać wielką literę, małą literę i cyfrę
- System sprawdza zgodność hasła z polem potwierdzenia
- Po poprawnej rejestracji system wysyła email weryfikacyjny
- Użytkownik widzi komunikat o konieczności weryfikacji emaila
- System blokuje rejestrację na już istniejący adres email
- Wyświetlane są komunikaty błędów przy nieprawidłowych danych

### US-002: Weryfikacja adresu email

Tytuł: Potwierdzenie adresu email przez link

Opis: Jako zarejestrowany użytkownik chcę potwierdzić swój adres email przez kliknięcie linku weryfikacyjnego, aby aktywować swoje konto.

Kryteria akceptacji:
- Link weryfikacyjny jest ważny przez 24 godziny
- Po kliknięciu poprawnego linku konto zostaje aktywowane
- Użytkownik widzi komunikat o pomyślnej weryfikacji
- Użytkownik może ponownie wysłać link weryfikacyjny
- Kliknięcie wygasłego linku wyświetla odpowiedni komunikat
- Niezweryfikowane konto nie pozwala na zalogowanie

### US-003: Logowanie do systemu

Tytuł: Logowanie użytkownika

Opis: Jako zarejestrowany użytkownik chcę zalogować się do aplikacji za pomocą emaila i hasła, aby uzyskać dostęp do swojego dziennika treningowego.

Kryteria akceptacji:
- Formularz logowania zawiera pola: email, hasło
- Po poprawnym zalogowaniu użytkownik jest przekierowywany na dashboard
- Błędne dane logowania wyświetlają komunikat "Nieprawidłowy email lub hasło"
- System nie ujawnia, czy podany email istnieje w bazie
- Sesja użytkownika jest utrzymywana między odświeżeniami strony
- Link do rejestracji jest dostępny z formularza logowania
- Link do odzyskiwania hasła jest dostępny z formularza logowania

### US-004: Wylogowanie z systemu

Tytuł: Wylogowanie użytkownika

Opis: Jako zalogowany użytkownik chcę wylogować się z aplikacji, aby zabezpieczyć swoje dane przed nieautoryzowanym dostępem.

Kryteria akceptacji:
- Przycisk wylogowania jest widoczny w nawigacji
- Po wylogowaniu użytkownik jest przekierowywany na stronę logowania
- Sesja użytkownika jest całkowicie zakończona
- Próba dostępu do chronionych stron przekierowuje na logowanie

### US-005: Odzyskiwanie hasła

Tytuł: Reset zapomnianego hasła

Opis: Jako użytkownik, który zapomniał hasła, chcę je zresetować za pomocą adresu email, aby odzyskać dostęp do swojego konta.

Kryteria akceptacji:
- Formularz resetu wymaga podania adresu email
- System wysyła link do resetu hasła na podany adres (jeśli istnieje w bazie)
- Komunikat o wysłaniu linku jest wyświetlany niezależnie od istnienia konta
- Link do resetu jest ważny przez 1 godzinę
- Formularz ustawienia nowego hasła wymaga podania hasła i potwierdzenia
- Nowe hasło musi spełniać wymagania bezpieczeństwa
- Po zmianie hasła użytkownik może zalogować się nowym hasłem
- Stare hasło przestaje działać

### US-006: Wyświetlanie dashboardu

Tytuł: Strona główna po zalogowaniu

Opis: Jako zalogowany użytkownik chcę widzieć dashboard z podsumowaniem moich treningów, aby mieć szybki przegląd swojej aktywności.

Kryteria akceptacji:
- Dashboard wyświetla listę ostatnich 5 treningów
- Każdy trening na liście pokazuje: datę, rodzaj, czas trwania, ocenę zadowolenia
- Widoczne jest podsumowanie bieżącego tygodnia: liczba treningów i średnie zadowolenie
- Wyświetlana jest lista aktywnych celów użytkownika
- Przycisk "Dodaj trening" jest wyraźnie widoczny
- Dla nowego użytkownika bez treningów wyświetlana jest zachęta do dodania pierwszego treningu

### US-007: Dodawanie nowego treningu

Tytuł: Zapisanie odbytego treningu

Opis: Jako zalogowany użytkownik chcę zapisać odbyte ćwiczenia z datą, rodzajem, czasem trwania i oceną, aby śledzić swoje postępy.

Kryteria akceptacji:
- Formularz zawiera wszystkie wymagane pola
- Data domyślnie ustawiona na dzień bieżący
- Picker daty pozwala wybrać datę wstecz (nie przyszłą)
- Lista rodzajów treningów zawiera wszystkie predefiniowane typy
- Picker czasu trwania ma krok 5 minut i zakres 0:05 - 3:00h
- Ocena ogólnego zadowolenia jest obowiązkowa
- Pozostałe oceny (samopoczucie, energia, motywacja, trudność) są opcjonalne
- Notatka tekstowa jest opcjonalna
- Skala ocen prezentowana jest wizualnie (emotikony lub gwiazdki)
- Po zapisaniu użytkownik jest przekierowywany na dashboard
- Zapisany trening pojawia się na liście ostatnich treningów

### US-008: Dodawanie własnego typu treningu

Tytuł: Definiowanie własnego rodzaju treningu

Opis: Jako użytkownik chcę dodać własny typ treningu, którego nie ma na predefiniowanej liście, aby dokładnie opisać swoją aktywność.

Kryteria akceptacji:
- Opcja "Dodaj własny" jest dostępna w liście rodzajów treningów
- Pole tekstowe pozwala wpisać nazwę własnego typu
- Nazwa własnego typu ma limit 50 znaków
- Własny typ jest zapisywany i dostępny w przyszłych treningach użytkownika
- Własne typy są widoczne tylko dla użytkownika, który je utworzył

### US-009: Ocena samopoczucia po treningu

Tytuł: Wielokategorialna ocena treningu

Opis: Jako użytkownik chcę ocenić swoje samopoczucie po treningu w kilku kategoriach, aby monitorować wpływ ćwiczeń na mój nastrój i kondycję.

Kryteria akceptacji:
- Dostępne kategorie ocen: samopoczucie fizyczne, poziom energii, motywacja, trudność treningu, ogólne zadowolenie
- Każda kategoria ma skalę 1-5
- Skala jest przedstawiona wizualnie (emotikony lub gwiazdki)
- Ogólne zadowolenie jest obowiązkowe, pozostałe opcjonalne
- Każda wartość skali ma czytelny opis (np. 1 = bardzo źle, 5 = świetnie)
- Użytkownik może zmienić ocenę przed zapisaniem

### US-010: Przeglądanie historii treningów

Tytuł: Lista wszystkich treningów

Opis: Jako użytkownik chcę przeglądać pełną historię swoich treningów, aby analizować swoją aktywność w czasie.

Kryteria akceptacji:
- Widok historii dostępny z nawigacji głównej
- Lista treningów posortowana od najnowszego
- Każdy wpis zawiera: datę, rodzaj, czas trwania, ocenę zadowolenia
- Możliwość kliknięcia treningu, aby zobaczyć pełne szczegóły
- Paginacja lub infinite scroll dla długich list
- Wyświetlanie komunikatu gdy brak treningów

### US-011: Filtrowanie treningów po dacie

Tytuł: Filtrowanie historii po zakresie dat

Opis: Jako użytkownik chcę filtrować treningi po zakresie dat, aby zobaczyć aktywność z określonego okresu.

Kryteria akceptacji:
- Dostępne pola: data od, data do
- Picker daty dla obu pól
- Możliwość ustawienia tylko daty początkowej lub końcowej
- Filtr działa natychmiast po wyborze daty
- Wyniki zawierają tylko treningi z wybranego zakresu
- Wyświetlanie informacji o aktywnym filtrze

### US-012: Filtrowanie treningów po rodzaju

Tytuł: Filtrowanie historii po typie treningu

Opis: Jako użytkownik chcę filtrować treningi po rodzaju, aby zobaczyć konkretny typ aktywności.

Kryteria akceptacji:
- Lista wyboru zawiera wszystkie rodzaje treningów (predefiniowane i własne)
- Możliwość wyboru wielu rodzajów jednocześnie
- Filtr działa natychmiast po wyborze
- Wyniki zawierają tylko treningi wybranego rodzaju/rodzajów
- Wyświetlanie informacji o aktywnym filtrze

### US-013: Filtrowanie treningów po zadowoleniu

Tytuł: Filtrowanie historii po poziomie zadowolenia

Opis: Jako użytkownik chcę filtrować treningi po poziomie ogólnego zadowolenia, aby zobaczyć najlepsze lub najgorsze treningi.

Kryteria akceptacji:
- Dostępny filtr zakresu ocen (od-do w skali 1-5)
- Możliwość ustawienia tylko minimalnej lub maksymalnej oceny
- Filtr działa natychmiast po wyborze
- Wyniki zawierają tylko treningi z wybranego zakresu ocen
- Wyświetlanie informacji o aktywnym filtrze

### US-014: Łączenie wielu filtrów

Tytuł: Jednoczesne stosowanie wielu kryteriów filtrowania

Opis: Jako użytkownik chcę łączyć wiele filtrów jednocześnie, aby precyzyjnie wyszukiwać treningi.

Kryteria akceptacji:
- Wszystkie filtry (data, rodzaj, zadowolenie) mogą być aktywne jednocześnie
- Wyniki spełniają wszystkie aktywne kryteria (logiczne AND)
- Widoczna informacja o wszystkich aktywnych filtrach
- Możliwość usunięcia pojedynczego filtra bez wpływu na pozostałe

### US-015: Reset filtrów

Tytuł: Szybkie czyszczenie wszystkich filtrów

Opis: Jako użytkownik chcę szybko zresetować wszystkie filtry, aby wrócić do pełnej listy treningów.

Kryteria akceptacji:
- Przycisk "Wyczyść filtry" jest widoczny gdy jakikolwiek filtr jest aktywny
- Kliknięcie przycisku usuwa wszystkie aktywne filtry
- Lista pokazuje wszystkie treningi po resecie
- Przycisk jest ukryty gdy brak aktywnych filtrów

### US-016: Wyświetlanie szczegółów treningu

Tytuł: Pełne informacje o pojedynczym treningu

Opis: Jako użytkownik chcę zobaczyć pełne szczegóły wybranego treningu, aby przejrzeć wszystkie zapisane informacje.

Kryteria akceptacji:
- Widok szczegółów dostępny po kliknięciu treningu z listy
- Wyświetlane są wszystkie zapisane pola: data, rodzaj, czas, wszystkie oceny, notatka
- Dostępne przyciski: edytuj, usuń, eksportuj do PDF
- Możliwość powrotu do listy treningów

### US-017: Edycja treningu

Tytuł: Modyfikacja zapisanego treningu

Opis: Jako użytkownik chcę edytować zapisany trening, aby poprawić błędnie wprowadzone dane.

Kryteria akceptacji:
- Przycisk edycji dostępny w widoku szczegółów treningu
- Formularz edycji wypełniony aktualnymi danymi
- Możliwość zmiany wszystkich pól treningu
- Walidacja pól identyczna jak przy dodawaniu
- Po zapisaniu zmian użytkownik wraca do widoku szczegółów
- Zmiany są natychmiast widoczne

### US-018: Usuwanie treningu

Tytuł: Usunięcie zapisanego treningu

Opis: Jako użytkownik chcę usunąć błędnie dodany trening, aby utrzymać dokładność dziennika.

Kryteria akceptacji:
- Przycisk usunięcia dostępny w widoku szczegółów treningu
- Po kliknięciu wyświetla się dialog potwierdzenia
- Dialog zawiera pytanie "Czy na pewno chcesz usunąć ten trening?"
- Dostępne przyciski: "Anuluj" i "Usuń"
- Po potwierdzeniu trening jest trwale usuwany
- Użytkownik jest przekierowywany na listę treningów
- Wyświetlany jest komunikat potwierdzający usunięcie

### US-019: Dodawanie celu treningowego

Tytuł: Tworzenie nowego celu

Opis: Jako użytkownik chcę dodać cel treningowy, aby zapisać swoje zamierzenia i utrzymać motywację.

Kryteria akceptacji:
- Formularz dodawania celu dostępny z dashboardu lub sekcji celów
- Pole tekstowe na opis celu (limit 200 znaków)
- Walidacja niepustego opisu
- Maksymalna liczba aktywnych celów: 5
- Próba dodania szóstego celu wyświetla komunikat o limicie
- Nowy cel pojawia się na liście aktywnych celów

### US-020: Oznaczanie celu jako osiągnięty

Tytuł: Realizacja celu treningowego

Opis: Jako użytkownik chcę oznaczyć cel jako osiągnięty, aby śledzić swoje sukcesy.

Kryteria akceptacji:
- Przycisk "Oznacz jako osiągnięty" dostępny przy każdym aktywnym celu
- Po kliknięciu cel zmienia status na "osiągnięty"
- Osiągnięty cel jest przenoszony do sekcji osiągniętych celów
- Data osiągnięcia jest automatycznie zapisywana
- Liczba aktywnych celów zmniejsza się o 1
- Możliwość dodania nowego celu jeśli limit nie jest przekroczony

### US-021: Archiwizacja celu

Tytuł: Przeniesienie celu do archiwum

Opis: Jako użytkownik chcę zarchiwizować nieaktualny cel, aby usunąć go z listy aktywnych bez usuwania.

Kryteria akceptacji:
- Przycisk "Archiwizuj" dostępny przy każdym aktywnym celu
- Po kliknięciu cel zmienia status na "zarchiwizowany"
- Zarchiwizowany cel znika z listy aktywnych
- Liczba aktywnych celów zmniejsza się o 1
- Zarchiwizowane cele są dostępne w osobnej sekcji

### US-022: Przeglądanie celów

Tytuł: Lista celów treningowych

Opis: Jako użytkownik chcę przeglądać wszystkie swoje cele, aby śledzić postępy i historię.

Kryteria akceptacji:
- Widok celów dostępny z nawigacji głównej
- Sekcja aktywnych celów z liczbą (np. "Aktywne cele: 3/5")
- Sekcja osiągniętych celów z datami realizacji
- Sekcja zarchiwizowanych celów
- Możliwość przywrócenia zarchiwizowanego celu do aktywnych (jeśli limit pozwala)

### US-023: Eksport pojedynczego treningu do PDF

Tytuł: Generowanie PDF ze szczegółami treningu

Opis: Jako użytkownik chcę wygenerować PDF z pojedynczego treningu, aby mieć dokumentację offline.

Kryteria akceptacji:
- Przycisk "Eksportuj do PDF" dostępny w widoku szczegółów treningu
- PDF zawiera wszystkie dane treningu w formacie tabelarycznym
- Nazwa pliku zawiera datę treningu (np. "trening_2026-01-20.pdf")
- Plik jest pobierany automatycznie po wygenerowaniu
- PDF zawiera nagłówek z nazwą aplikacji i datą wygenerowania

### US-024: Eksport podsumowania tygodniowego do PDF

Tytuł: Raport tygodniowy w formacie PDF

Opis: Jako użytkownik chcę wygenerować PDF z podsumowaniem tygodnia, aby analizować swoją aktywność.

Kryteria akceptacji:
- Opcja eksportu tygodniowego dostępna w sekcji historii
- Picker pozwala wybrać tydzień do eksportu
- PDF zawiera tabelę z wszystkimi treningami z wybranego tygodnia
- PDF zawiera podsumowanie: liczba treningów, łączny czas, średnie oceny
- Format tabelaryczny bez wykresów
- Nazwa pliku zawiera zakres dat (np. "podsumowanie_2026-01-13_2026-01-19.pdf")

### US-025: Eksport podsumowania miesięcznego do PDF

Tytuł: Raport miesięczny w formacie PDF

Opis: Jako użytkownik chcę wygenerować PDF z podsumowaniem miesiąca, aby mieć pełną dokumentację okresu.

Kryteria akceptacji:
- Opcja eksportu miesięcznego dostępna w sekcji historii
- Picker pozwala wybrać miesiąc i rok do eksportu
- PDF zawiera tabelę z wszystkimi treningami z wybranego miesiąca
- PDF zawiera podsumowanie: liczba treningów, łączny czas, średnie oceny, rozkład rodzajów treningów
- Format tabelaryczny bez wykresów
- Nazwa pliku zawiera miesiąc i rok (np. "podsumowanie_2026-01.pdf")

### US-026: Nawigacja w aplikacji

Tytuł: Poruszanie się między widokami

Opis: Jako użytkownik chcę łatwo nawigować między różnymi sekcjami aplikacji, aby szybko dotrzeć do potrzebnych funkcji.

Kryteria akceptacji:
- Menu nawigacyjne zawiera: Dashboard, Historia, Cele, Wyloguj
- Menu jest zawsze widoczne (sidebar lub top navigation)
- Aktualnie aktywna sekcja jest wyróżniona
- Nawigacja jest responsywna (hamburger menu na mobile)
- Logo/nazwa aplikacji prowadzi do dashboardu

### US-027: Obsługa błędów sieciowych

Tytuł: Informowanie o problemach z połączeniem

Opis: Jako użytkownik chcę być informowany o problemach z połączeniem, aby wiedzieć że moje dane mogą nie zostać zapisane.

Kryteria akceptacji:
- Komunikat o braku połączenia wyświetlany gdy serwer nie odpowiada
- Komunikat zawiera informację o konieczności ponowienia próby
- Formularz nie jest czyszczony przy błędzie sieciowym
- Przycisk ponowienia próby jest dostępny
- Sukces operacji po ponowieniu wyświetla odpowiedni komunikat

### US-028: Walidacja formularzy

Tytuł: Sprawdzanie poprawności wprowadzanych danych

Opis: Jako użytkownik chcę otrzymywać jasne komunikaty o błędach, aby poprawnie wypełnić formularze.

Kryteria akceptacji:
- Walidacja działa w czasie rzeczywistym (podczas wypełniania)
- Pola z błędami są wizualnie wyróżnione (czerwona ramka)
- Komunikaty błędów są wyświetlane przy konkretnych polach
- Komunikaty są w języku polskim i zrozumiałe
- Przycisk zapisu jest nieaktywny gdy formularz zawiera błędy
- Po poprawieniu błędu komunikat znika automatycznie

### US-029: Responsywność interfejsu

Tytuł: Dostosowanie do różnych urządzeń

Opis: Jako użytkownik chcę korzystać z aplikacji na różnych urządzeniach, aby mieć dostęp do dziennika w dowolnym miejscu.

Kryteria akceptacji:
- Aplikacja działa poprawnie na desktopie (min. 1024px)
- Aplikacja działa poprawnie na tablecie (768px - 1023px)
- Aplikacja działa poprawnie na telefonie (do 767px)
- Elementy interfejsu dostosowują się do rozmiaru ekranu
- Formularze są czytelne i łatwe do wypełnienia na każdym urządzeniu
- Przyciski mają odpowiedni rozmiar dla obsługi dotykowej

### US-030: Bezpieczeństwo sesji

Tytuł: Ochrona sesji użytkownika

Opis: Jako użytkownik chcę, aby moja sesja była bezpieczna, aby nikt nieuprawniony nie miał dostępu do moich danych.

Kryteria akceptacji:
- Sesja wygasa po 24 godzinach nieaktywności
- Próba dostępu do chronionych zasobów bez sesji przekierowuje na logowanie
- Token sesji jest przechowywany bezpiecznie
- Wylogowanie unieważnia token sesji
- Hasła są hashowane w bazie danych
- Komunikacja odbywa się przez HTTPS

### US-031: Pusta lista treningów

Tytuł: Stan początkowy bez danych

Opis: Jako nowy użytkownik bez żadnych treningów chcę widzieć przyjazny komunikat zachęcający do dodania pierwszego treningu.

Kryteria akceptacji:
- Pusta historia wyświetla komunikat "Nie masz jeszcze żadnych treningów"
- Widoczny jest przycisk/link "Dodaj pierwszy trening"
- Komunikat zawiera krótką instrukcję lub zachętę
- Stan pusty jest wizualnie atrakcyjny (ikona lub ilustracja)

### US-032: Edycja własnego typu treningu

Tytuł: Modyfikacja nazwy własnego rodzaju treningu

Opis: Jako użytkownik chcę edytować nazwę własnego typu treningu, aby poprawić literówkę lub zmienić nazwę.

Kryteria akceptacji:
- Lista własnych typów treningów dostępna w ustawieniach
- Możliwość edycji nazwy każdego własnego typu
- Walidacja: nazwa nie może być pusta, max 50 znaków
- Zmiana nazwy aktualizuje wszystkie treningi z tym typem
- Możliwość usunięcia własnego typu (tylko jeśli nie jest używany)

### US-033: Limit notatki tekstowej

Tytuł: Ograniczenie długości notatki

Opis: Jako użytkownik chcę wiedzieć ile znaków mogę wpisać w notatce, aby nie przekroczyć limitu.

Kryteria akceptacji:
- Notatka ma limit 1000 znaków
- Licznik pozostałych znaków jest widoczny podczas pisania
- Próba wpisania większej liczby znaków jest blokowana
- Wizualne ostrzeżenie gdy pozostało mniej niż 100 znaków

## 6. Metryki sukcesu

### 6.1 Metryki funkcjonalne (kryteria akceptacji MVP)

| Metryka | Kryterium sukcesu |
|---------|-------------------|
| Rejestracja i logowanie | Użytkownik może założyć konto, zweryfikować email i zalogować się |
| Dodawanie treningów | Użytkownik może zapisać trening ze wszystkimi wymaganymi polami |
| Ocena zadowolenia | Użytkownik może ocenić trening w skali 1-5 w wielu kategoriach |
| Filtrowanie | Użytkownik może filtrować treningi łącząc wiele kryteriów |
| Cele | Użytkownik może dodać, oznaczyć jako osiągnięty i archiwizować cele |
| Eksport PDF | Użytkownik może wygenerować PDF pojedynczego treningu i podsumowań |
| Edycja/usuwanie | Użytkownik może edytować i usuwać zapisane treningi |

### 6.2 Metryki techniczne

| Metryka | Cel |
|---------|-----|
| Czas ładowania strony | Poniżej 3 sekund |
| Dostępność serwisu | 99% uptime |
| Responsywność | Pełna funkcjonalność na desktop, tablet i mobile |
| Bezpieczeństwo | Brak krytycznych podatności (OWASP Top 10) |
| Weryfikacja email | Email weryfikacyjny dostarczany w ciągu 5 minut |

### 6.3 Metryki jakościowe

| Metryka | Metoda pomiaru |
|---------|----------------|
| Kompletność funkcjonalna | 100% historii użytkownika zaimplementowanych |
| Pokrycie testami | Minimum 80% pokrycia kodu testami jednostkowymi |
| Walidacja formularzy | Wszystkie pola mają odpowiednią walidację |
| Komunikaty błędów | Wszystkie błędy mają zrozumiałe komunikaty w języku polskim |

---

Dokument wygenerowany: 2026-01-20
Wersja: 1.0
