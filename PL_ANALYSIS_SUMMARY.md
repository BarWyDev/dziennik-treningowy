# Raport Wdrożeniowy: Dziennik Treningowy

Data: 3 Lutego 2026
Autor: AI Assistant

## 1. Podsumowanie Stanu Projektu

Projekt jest zaawansowaną aplikacją typu SSR (Server-Side Rendering) opartą o Astro 5 i React 19. Kod jest wysokiej jakości, z podziałem na warstwy i dobrą separacją logiki biznesowej.

### Kluczowe Elementy Architektury
- **Frontend:** Astro + React (dobra wydajność, mały bundle JS).
- **Backend:** Node.js (Astro Adapter) + Better Auth.
- **Baza danych:** PostgreSQL + Drizzle ORM (nowoczesne, bezpieczne typowanie).
- **Infrastruktura obecna:** Dostosowana do środowiska deweloperskiego (lokalny zapis plików).

## 2. Rekomendowana Architektura Produkcyjna

Aby zapewnić stabilność, bezpieczeństwo i niski koszt działania w Polsce, zaleca się architekturę hybrydową wykorzystującą usługi typu "Managed" tam, gdzie to krytyczne (Baza, Pliki), oraz tani hosting aplikacyjny.

### Schemat Rozwiązania

1.  **Aplikacja (Compute):**
    *   **Platforma:** Railway (lub VPS Mikrus/Hetzner z Coolify).
    *   **Zaleta:** Łatwość wdrożenia (Git push -> Deploy), skalowalność wertykalna.
    *   **Koszt:** ~20 PLN/mc.

2.  **Przechowywanie Plików (Storage) - ZMIANA KRYTYCZNA:**
    *   **Problem:** Obecny system zapisuje pliki lokalnie (`src/lib/storage/local.ts`). Na produkcji pliki te znikną przy każdym redeployu aplikacji.
    *   **Rozwiązanie:** Migracja na **Cloudflare R2** (kompatybilne z S3).
    *   **Zaleta:** Brak opłat za transfer (egress fees), co jest kluczowe przy hostowaniu wideo. 10GB storage za darmo.
    *   **Implementacja:** Wymaga napisania adaptera S3 implementującego interfejs `StorageService`.

3.  **Baza Danych:**
    *   **Platforma:** Supabase (PostgreSQL).
    *   **Zaleta:** Stabilność, automatyczne backupy, darmowy tier wystarczający na start.

4.  **Dystrybucja Treści (CDN) i DNS:**
    *   **Platforma:** Cloudflare.
    *   **Zaleta:** Caching statycznych zasobów, ochrona DDoS, darmowy SSL, szybkie DNS.

## 3. Plan Działania (Roadmapa)

1.  **Kod:** Implementacja adaptera S3/R2 w `src/lib/storage`.
2.  **Konta:** Założenie kont Cloudflare (R2), Supabase, Railway/Hetzner.
3.  **Konfiguracja:** Ustawienie zmiennych środowiskowych (`.env`) na produkcji.
4.  **Migracja:** Uruchomienie `pnpm db:push` / `db:migrate` na bazie produkcyjnej.
5.  **Testy:** Weryfikacja uploadu plików i wysyłki emaili na środowisku produkcyjnym.

## 4. Szacowane Koszty (Miesięcznie)

| Usługa | Plan Startowy (< 100 użytkowników) | Plan Rozwojowy (~1000 użytkowników) |
|--------|------------------------------------|-------------------------------------|
| Hosting App | ~20 PLN (Railway Hobby) | ~80 PLN (Railway Pro) |
| Baza Danych | 0 PLN (Supabase Free) | ~100 PLN (Supabase Pro) |
| Storage (R2)| 0 PLN | ~20 PLN (Zależnie od ilości wideo) |
| Email | 0 PLN (Resend Free) | ~100 PLN (Resend Pro) |
| **SUMA** | **~20 PLN** | **~300 PLN** |

## 5. Bezpieczeństwo

- **SSL:** Wymuszone przez Cloudflare (Full Strict).
- **Dostęp do plików:** Pliki w R2 powinny być serwowane przez publiczny URL Cloudflare, ale upload możliwy tylko przez podpisane URL-e lub przez backend aplikacji (obecna implementacja backendu jest bezpieczna, sprawdza uprawnienia).
- **Baza danych:** Dostęp tylko z adresu IP aplikacji (Railway) lub przez connection string z hasłem.
