# API Endpoint Implementation Plan: POST /api/flashcard-sets/generate and POST /api/flashcard-sets/review

## 1. Przegląd punktów końcowych
System implementuje dwuetapowy proces generowania fiszek:

1. **Etap 1 (Generowanie)**: Endpoint `/api/flashcard-sets/generate` służy do generowania propozycji fiszek na podstawie dostarczonego tekstu źródłowego przy użyciu sztucznej inteligencji. Użytkownik dostarcza tekst źródłowy i opcjonalnie tytuł zestawu. Jeśli tytuł nie zostanie podany, system automatycznie wygeneruje go przy użyciu AI na podstawie dostarczonego tekstu. Wygenerowane fiszki są zwracane użytkownikowi jako propozycje.

2. **Etap 2 (Akceptacja)**: Endpoint `/api/flashcard-sets/review` służy do przetwarzania decyzji użytkownika dotyczących zaakceptowania lub odrzucenia propozycji fiszek. Tylko zaakceptowane fiszki są zapisywane w bazie danych. Na tym etapie tworzony jest również wpis w logu generacji, który śledzi statystyki akceptacji.

## 2. Szczegóły żądania i odpowiedzi

### Endpoint 1: POST /api/flashcard-sets/generate

#### Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/flashcard-sets/generate`
- **Parametry**:
  - **Wymagane**: 
    - `source_text` (string): Tekst źródłowy do generowania fiszek (1000-10000 znaków)
  - **Opcjonalne**: 
    - `title` (string): Tytuł nowego zestawu fiszek (max 255 znaków)
- **Request Body**:
  ```json
  {
    "source_text": "string",
    "title": "string" // opcjonalne
  }
  ```
- **Nagłówki**:
  - `Authorization`: Bearer token JWT

#### Szczegóły odpowiedzi
- **Kod sukcesu**: 201 Created
- **Struktura odpowiedzi**:
  ```json
  {
    "set_id": "uuid", // Tymczasowe ID dla propozycji
    "title": "string",
    "flashcards": [
      {
        "id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "creation_mode": "ai"
      }
    ],
    "created_at": "timestamp",
    "total_cards_count": "integer"
  }
  ```
- **Kody błędów**:
  - 400 Bad Request - Nieprawidłowy tekst źródłowy (za krótki, za długi)
  - 401 Unauthorized - Użytkownik nie jest uwierzytelniony
  - 429 Too Many Requests - Dzienny limit generacji został osiągnięty

### Endpoint 2: POST /api/flashcard-sets/review

#### Szczegóły żądania
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/flashcard-sets/review`
- **Parametry**:
  - **Wymagane**: 
    - `set_id` (string): Tymczasowe ID zestawu z etapu generowania
    - `title` (string): Tytuł zestawu (może być zmodyfikowany przez użytkownika)
    - `source_text` (string): Oryginalny tekst źródłowy
    - `accept` (array): Tablica ID fiszek do zaakceptowania
    - `reject` (array): Tablica ID fiszek do odrzucenia
- **Request Body**:
  ```json
  {
    "set_id": "uuid",
    "title": "string",
    "source_text": "string",
    "accept": ["uuid1", "uuid2"],
    "reject": ["uuid3", "uuid4"]
  }
  ```
- **Nagłówki**:
  - `Authorization`: Bearer token JWT

#### Szczegóły odpowiedzi
- **Kod sukcesu**: 201 Created
- **Struktura odpowiedzi**:
  ```json
  {
    "set_id": "uuid", // Stałe ID utworzonego zestawu
    "accepted_count": "integer",
    "rejected_count": "integer",
    "success": true
  }
  ```
- **Kody błędów**:
  - 400 Bad Request - Nieprawidłowe dane lub brak zaakceptowanych fiszek
  - 401 Unauthorized - Użytkownik nie jest uwierzytelniony
  - 500 Internal Server Error - Błąd zapisu do bazy danych

## 3. Wykorzystywane typy

### DTOs
- `GenerateFlashcardSetRequestDTO`: Struktura żądania generowania
- `GenerateFlashcardSetResponseDTO`: Struktura odpowiedzi generowania
- `FlashcardGeneratedDTO`: Struktura pojedynczej wygenerowanej fiszki
- `BatchFlashcardActionRequestDTO`: Struktura żądania akceptacji/odrzucenia
- `BatchFlashcardActionResponseDTO`: Struktura odpowiedzi akceptacji/odrzucenia

### Command Models
- `GenerateFlashcardsCommand`: Model komendy biznesowej zawierający userId, sourceText i opcjonalny title

### Schematy Zod do walidacji
- Schema do walidacji GenerateFlashcardSetRequestDTO:
  ```typescript
  import { z } from "zod";

  export const generateFlashcardSetRequestSchema = z.object({
    source_text: z.string()
      .min(1000, "Tekst źródłowy musi zawierać co najmniej 1000 znaków")
      .max(10000, "Tekst źródłowy nie może przekraczać 10000 znaków"),
    title: z.string()
      .max(255, "Tytuł nie może przekraczać 255 znaków")
      .optional(),
  });
  ```

- Schema do walidacji BatchFlashcardActionRequestDTO:
  ```typescript
  import { z } from "zod";

  export const batchFlashcardActionSchema = z.object({
    set_id: z.string().uuid("ID zestawu musi być prawidłowym UUID"),
    title: z.string().max(255, "Tytuł nie może przekraczać 255 znaków"),
    source_text: z.string()
      .min(1000, "Tekst źródłowy musi zawierać co najmniej 1000 znaków")
      .max(10000, "Tekst źródłowy nie może przekraczać 10000 znaków"),
    accept: z.array(z.string().uuid("ID zaakceptowanych fiszek muszą być prawidłowymi UUID")),
    reject: z.array(z.string().uuid("ID odrzuconych fiszek muszą być prawidłowymi UUID")),
  });
  ```

## 4. Przepływ danych

### Endpoint 1: POST /api/flashcard-sets/generate

1. **Walidacja żądania**:
   - Sprawdzenie czy użytkownik jest uwierzytelniony
   - Walidacja danych wejściowych przy użyciu schematu Zod

2. **Sprawdzenie limitów generacji**:
   - Pobranie i sprawdzenie dziennego limitu generacji użytkownika
   - Jeśli limit został osiągnięty, zwrócenie błędu 429

3. **Generowanie tytułu (jeśli nie podano)**:
   - Wywołanie serwisu AI z tekstem źródłowym w celu wygenerowania sugestii tytułu

4. **Generowanie fiszek**:
   - Wywołanie serwisu AI w celu wygenerowania fiszek na podstawie tekstu źródłowego
   - Konwersja wyniku do struktury fiszek
   - Generowanie tymczasowego ID zestawu

5. **Aktualizacja licznika użycia**:
   - Aktualizacja dziennego limitu generacji użytkownika

6. **Przygotowanie i zwrócenie odpowiedzi**:
   - Formatowanie danych do odpowiedniej struktury odpowiedzi
   - Zwrócenie odpowiedzi z kodem 201

### Endpoint 2: POST /api/flashcard-sets/review

1. **Walidacja żądania**:
   - Sprawdzenie czy użytkownik jest uwierzytelniony
   - Walidacja danych wejściowych przy użyciu schematu Zod
   - Sprawdzenie czy tablica akceptacji zawiera co najmniej jedną fiszkę

2. **Zapisywanie danych w bazie**:
   - Utworzenie nowego zestawu fiszek w tabeli `flashcard_sets`
   - Zapisanie tekstu źródłowego w tabeli `source_texts`
   - Zapisanie tylko zaakceptowanych fiszek w tabeli `flashcards`
   - Aktualizacja liczby kart w zestawie

3. **Tworzenie logu generacji**:
   - Utworzenie wpisu w logu generacji w tabeli `generation_logs` z liczbą wygenerowanych, zaakceptowanych i odrzuconych fiszek

4. **Przygotowanie i zwrócenie odpowiedzi**:
   - Pobranie ID utworzonego zestawu
   - Przygotowanie statystyk akceptacji/odrzucenia
   - Zwrócenie odpowiedzi z kodem 201

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie**: Weryfikacja JWT tokena dla każdego żądania
- **Autoryzacja**: Sprawdzenie uprawnień użytkownika do tworzenia nowych zestawów fiszek
- **Walidacja danych wejściowych**: Dokładna walidacja tekstu źródłowego pod kątem długości i potencjalnie niebezpiecznych treści
- **Limitowanie**: Implementacja limitów dziennej generacji fiszek (5 zestawów dziennie na użytkownika)
- **Zabezpieczenie bazy danych**: Wykorzystanie Row Level Security (RLS) w Supabase do zabezpieczenia dostępu do danych

## 6. Obsługa błędów

### Endpoint 1: POST /api/flashcard-sets/generate
- **400 Bad Request**:
  - Tekst źródłowy jest zbyt krótki (mniej niż 1000 znaków)
  - Tekst źródłowy jest zbyt długi (więcej niż 10000 znaków)
  - Tytuł jest zbyt długi (więcej niż 255 znaków)
  - Nieprawidłowy format danych wejściowych

- **401 Unauthorized**:
  - Brak tokenu JWT
  - Wygasły token JWT
  - Nieprawidłowy token JWT

- **429 Too Many Requests**:
  - Użytkownik osiągnął dzienny limit generacji fiszek (5 zestawów)

- **500 Internal Server Error**:
  - Błąd przy komunikacji z API Openrouter.ai
  - Nieoczekiwany błąd serwera

### Endpoint 2: POST /api/flashcard-sets/review
- **400 Bad Request**:
  - Brak zaakceptowanych fiszek
  - Nieprawidłowe ID zestawu
  - Nieprawidłowe IDs fiszek
  - Nieprawidłowy format danych wejściowych

- **401 Unauthorized**:
  - Brak tokenu JWT
  - Wygasły token JWT
  - Nieprawidłowy token JWT

- **500 Internal Server Error**:
  - Błąd przy zapisie do bazy danych
  - Nieoczekiwany błąd serwera

## 7. Rozważania dotyczące wydajności
- **Optymalizacja wywołań AI**: Grupowanie zapytań do AI w jedno wywołanie, aby zminimalizować opóźnienia
- **Asynchroniczne przetwarzanie**: Wykorzystanie asynchronicznych funkcji do obsługi długotrwałych operacji
- **Efektywne transakcje bazodanowe**: Optymalizacja operacji bazodanowych podczas zapisywania zaakceptowanych fiszek
- **Buforowanie**: Możliwość buforowania często używanych danych, takich jak limity generacji
- **Monitorowanie wydajności**: Śledzenie czasu odpowiedzi i wykorzystania zasobów w celu identyfikacji wąskich gardeł

## 8. Etapy wdrożenia

### Etap 1: Implementacja endpointu generowania
1. **Utworzenie pliku punktu końcowego**:
   ```
   src/pages/api/flashcard-sets/generate.ts
   ```

2. **Implementacja schematu walidacji**:
   ```
   src/schemas/flashcard-generate.schema.ts
   ```

3. **Implementacja serwisu AI (jeśli nie istnieje)**:
   ```
   src/lib/services/ai.service.ts
   ```

4. **Implementacja serwisu generacji fiszek**:
   ```
   src/lib/services/flashcard-generation.service.ts
   ```

### Etap 2: Implementacja endpointu akceptacji
1. **Utworzenie pliku punktu końcowego**:
   ```
   src/pages/api/flashcard-sets/review.ts
   ```

2. **Implementacja schematu walidacji**:
   ```
   src/schemas/flashcard-actions.schema.ts
   ```

3. **Implementacja serwisu akceptacji fiszek**:
   ```
   src/lib/services/flashcard-review.service.ts
   ```

4. **Implementacja logiki biznesowej**:
   - Obsługa zapisywania zaakceptowanych fiszek
   - Tworzenie logu generacji
   - Logowanie informacji o akceptacji/odrzuceniu

### Etap 3: Testowanie
1. **Testy jednostkowe**:
   - Testy walidatorów i serwisów
   - Testy obsługi błędów
   - Testy limitów generacji

2. **Testy integracyjne**:
   - Testy całego przepływu generacji i akceptacji
   - Testy zapisywania do bazy danych
   - Testy tworzenia logów generacji

3. **Testy wydajnościowe**:
   - Testy obciążeniowe przy wielu równoczesnych żądaniach
   - Testy czasu odpowiedzi

### Etap 4: Wdrożenie produkcyjne
1. **Dokumentacja**:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Opisanie potencjalnych błędów i sposobów ich rozwiązania

2. **Monitoring**:
   - Wdrożenie monitoringu błędów
   - Śledzenie wydajności
   - Alertowanie w przypadku problemów 