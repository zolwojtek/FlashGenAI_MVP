# Schemat bazy danych dla FlashGenAI

## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### 1.1. Użytkownicy (auth.users)

Tabela zarządzana przez Supabase auth, rozszerzona o dodatkowe kolumny:

- **timezone**: TEXT, domyślnie 'UTC' - strefa czasowa użytkownika
- **created_at**: TIMESTAMP WITH TIME ZONE, domyślnie aktualny czas - data rejestracji użytkownika

### 1.2. Zestawy fiszek (flashcard_sets)

- **id**: UUID, PRIMARY KEY, domyślnie generowany losowo - unikalny identyfikator zestawu
- **user_id**: UUID, NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE - powiązanie z właścicielem
- **title**: TEXT, NOT NULL, ograniczenie długości do 255 znaków, nie może być pusty - tytuł zestawu
- **created_at**: TIMESTAMP WITH TIME ZONE, domyślnie aktualny czas - data utworzenia zestawu
- **last_reviewed_at**: TIMESTAMP WITH TIME ZONE, może być NULL - data ostatniego przeglądania
- **total_cards_count**: INTEGER, domyślnie 0 - liczba fiszek w zestawie

### 1.3. Fiszki (flashcards)

- **id**: UUID, PRIMARY KEY, domyślnie generowany losowo - unikalny identyfikator fiszki
- **set_id**: UUID, NOT NULL, REFERENCES flashcard_sets(id) ON DELETE CASCADE - powiązanie z zestawem
- **front_content**: TEXT, NOT NULL, ograniczenie długości do 500 znaków, nie może być pusty - treść przodu fiszki
- **back_content**: TEXT, NOT NULL, ograniczenie długości do 1000 znaków, nie może być pusty - treść tyłu fiszki
- **creation_mode**: ENUM ('manual', 'ai', 'ai_edited'), NOT NULL, domyślnie 'manual' - sposób utworzenia fiszki
- **created_at**: TIMESTAMP WITH TIME ZONE, domyślnie aktualny czas - data utworzenia fiszki
- **updated_at**: TIMESTAMP WITH TIME ZONE, domyślnie aktualny czas - data ostatniej aktualizacji fiszki

### 1.4. Teksty źródłowe (source_texts)

- **id**: UUID, PRIMARY KEY, domyślnie generowany losowo - unikalny identyfikator tekstu źródłowego
- **set_id**: UUID, NOT NULL, UNIQUE, REFERENCES flashcard_sets(id) ON DELETE CASCADE - powiązanie z zestawem (jeden zestaw ma jeden tekst źródłowy)
- **content**: TEXT, NOT NULL, ograniczenie długości od 1000 do 10000 znaków - oryginalny tekst źródłowy
- **created_at**: TIMESTAMP WITH TIME ZONE, domyślnie aktualny czas - data dodania tekstu źródłowego

### 1.5. Limity generacji (generation_limits)

- **user_id**: UUID, NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE - powiązanie z użytkownikiem
- **date**: DATE, NOT NULL - data, dla której obowiązuje limit
- **used_count**: INTEGER, NOT NULL, domyślnie 0, ograniczenie wartości od 0 do 5 - liczba wykorzystanych generacji w danym dniu
- PRIMARY KEY: (user_id, date) - klucz złożony zapewniający unikalność rekordu dla użytkownika na dany dzień

### 1.6. Logi generowania (generation_logs)

- **id**: UUID, PRIMARY KEY, domyślnie generowany losowo - unikalny identyfikator logu
- **user_id**: UUID, NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE - powiązanie z użytkownikiem
- **set_id**: UUID, NOT NULL, REFERENCES flashcard_sets(id) ON DELETE CASCADE - powiązanie z zestawem
- **generated_count**: INTEGER, NOT NULL, domyślnie 0, wartość nieujemna - liczba wygenerowanych fiszek
- **accepted_count**: INTEGER, NOT NULL, domyślnie 0, wartość nieujemna - liczba zaakceptowanych fiszek
- **rejected_count**: INTEGER, NOT NULL, domyślnie 0, wartość nieujemna - liczba odrzuconych fiszek
- **generated_at**: TIMESTAMP WITH TIME ZONE, domyślnie aktualny czas - data generowania

## 2. Relacje między tabelami

1. **Users (1) → Flashcard Sets (n)**
   - Jeden użytkownik może mieć wiele zestawów fiszek
   - Relacja realizowana przez klucz obcy `user_id` w tabeli `flashcard_sets`
   - Usunięcie użytkownika powoduje kaskadowe usunięcie wszystkich jego zestawów

2. **Flashcard Sets (1) → Flashcards (n)**
   - Jeden zestaw fiszek może zawierać wiele fiszek
   - Relacja realizowana przez klucz obcy `set_id` w tabeli `flashcards`
   - Usunięcie zestawu powoduje kaskadowe usunięcie wszystkich fiszek w zestawie

3. **Flashcard Sets (1) → Source Texts (1)**
   - Jeden zestaw fiszek ma jeden tekst źródłowy
   - Relacja realizowana przez klucz obcy `set_id` w tabeli `source_texts` z ograniczeniem UNIQUE
   - Usunięcie zestawu powoduje kaskadowe usunięcie powiązanego tekstu źródłowego

4. **Users (1) → Generation Limits (n)**
   - Jeden użytkownik może mieć wiele rekordów limitów generacji (po jednym na każdy dzień)
   - Relacja realizowana przez klucz obcy `user_id` w tabeli `generation_limits`
   - Usunięcie użytkownika powoduje kaskadowe usunięcie wszystkich jego limitów generacji

5. **Users (1) → Generation Logs (n)**
   - Jeden użytkownik może mieć wiele logów generowania
   - Relacja realizowana przez klucz obcy `user_id` w tabeli `generation_logs`
   - Usunięcie użytkownika powoduje kaskadowe usunięcie wszystkich jego logów generowania

6. **Flashcard Sets (1) → Generation Logs (n)**
   - Jeden zestaw fiszek może mieć wiele logów generowania (jeśli generowano kilkukrotnie)
   - Relacja realizowana przez klucz obcy `set_id` w tabeli `generation_logs`
   - Usunięcie zestawu powoduje kaskadowe usunięcie wszystkich powiązanych logów generowania

## 3. Indeksy

1. **flashcard_sets_user_id_idx** na kolumnie `user_id` w tabeli `flashcard_sets`
   - Przyspiesza wyszukiwanie zestawów należących do konkretnego użytkownika
   - Istotny dla operacji pobierania listy zestawów dla zalogowanego użytkownika

2. **flashcards_set_id_idx** na kolumnie `set_id` w tabeli `flashcards`
   - Przyspiesza wyszukiwanie fiszek należących do konkretnego zestawu
   - Istotny dla operacji przeglądania fiszek w danym zestawie

3. **source_texts_set_id_idx** na kolumnie `set_id` w tabeli `source_texts`
   - Przyspiesza wyszukiwanie tekstu źródłowego dla konkretnego zestawu
   - Przydatny przy regeneracji fiszek lub wyświetlaniu oryginalnego tekstu

4. **generation_logs_user_id_idx** na kolumnie `user_id` w tabeli `generation_logs`
   - Przyspiesza wyszukiwanie logów generowania dla konkretnego użytkownika
   - Przydatny przy analizie metryk dla konkretnego użytkownika

5. **generation_logs_set_id_idx** na kolumnie `set_id` w tabeli `generation_logs`
   - Przyspiesza wyszukiwanie logów generowania dla konkretnego zestawu
   - Przydatny przy analizie historii generowania fiszek dla danego zestawu

## 4. Wyzwalacze (Triggery) i funkcje

### 4.1. Aktualizacja liczby fiszek w zestawie

Wyzwalacz uruchamiany automatycznie po dodaniu lub usunięciu fiszki, który aktualizuje licznik `total_cards_count` w tabeli `flashcard_sets`:
- Po dodaniu fiszki: zwiększa licznik o 1
- Po usunięciu fiszki: zmniejsza licznik o 1

### 4.2. Aktualizacja daty modyfikacji fiszki

Wyzwalacz uruchamiany automatycznie przed aktualizacją fiszki, który ustawia pole `updated_at` na aktualny czas.

### 4.3. Funkcje do zarządzania limitami generacji

1. **increment_generation_used**
   - Funkcja zwiększająca licznik wykorzystanych generacji dla użytkownika w danym dniu
   - Uwzględnia strefę czasową użytkownika przy określaniu bieżącego dnia
   - Zwraca wartość logiczną informującą, czy użytkownik nie przekroczył limitu (5 generacji)

2. **check_generation_limit**
   - Funkcja sprawdzająca pozostały limit generacji dla użytkownika w danym dniu
   - Uwzględnia strefę czasową użytkownika przy określaniu bieżącego dnia
   - Zwraca liczbę pozostałych możliwych generacji (od 0 do 5)

## 5. Polityki bezpieczeństwa na poziomie wierszy (RLS)

### 5.1. Zestawy fiszek (flashcard_sets)

- **Polityka SELECT**: Użytkownik może odczytywać tylko własne zestawy fiszek
- **Polityka INSERT**: Użytkownik może dodawać zestawy tylko dla siebie
- **Polityka UPDATE**: Użytkownik może aktualizować tylko własne zestawy fiszek
- **Polityka DELETE**: Użytkownik może usuwać tylko własne zestawy fiszek

### 5.2. Fiszki (flashcards)

- **Polityka SELECT**: Użytkownik może odczytywać tylko fiszki należące do jego zestawów
- **Polityka INSERT**: Użytkownik może dodawać fiszki tylko do własnych zestawów
- **Polityka UPDATE**: Użytkownik może aktualizować tylko fiszki należące do jego zestawów
- **Polityka DELETE**: Użytkownik może usuwać tylko fiszki należące do jego zestawów

### 5.3. Teksty źródłowe (source_texts)

Analogiczne polityki jak dla fiszek, oparte na własności zestawu.

### 5.4. Limity generacji (generation_limits)

- **Polityka SELECT**: Użytkownik może odczytywać tylko własne limity generacji
- **Polityka INSERT**: Użytkownik może dodawać limity tylko dla siebie
- **Polityka UPDATE**: Użytkownik może aktualizować tylko własne limity generacji

### 5.5. Logi generowania (generation_logs)

Analogiczne polityki jak dla limitów generacji i fiszek.

## 6. Uwagi dodatkowe

1. **Automatyczne usuwanie**: Wykorzystanie klauzuli ON DELETE CASCADE zapewnia, że usunięcie konta użytkownika spowoduje kaskadowe usunięcie wszystkich powiązanych danych, co upraszcza zarządzanie danymi i zapobiega pozostawianiu osieroconych rekordów.

2. **Walidacja długości tekstu**: Zaimplementowano ograniczenia na długość przodu (500 znaków) i tyłu (1000 znaków) fiszek oraz tekstu źródłowego (1000-10000 znaków), zgodnie z wymaganiami produktu.

3. **Strefa czasowa użytkownika**: Funkcje dotyczące limitów generacji uwzględniają strefę czasową użytkownika, zapewniając reset o północy lokalnego czasu, co jest bardziej intuicyjne dla użytkownika.

4. **UUID**: Wykorzystanie UUID jako kluczy głównych zapewnia lepszą skalowalność i bezpieczeństwo w porównaniu do identyfikatorów sekwencyjnych, szczególnie w kontekście potencjalnej przyszłej synchronizacji danych między instancjami.

5. **Metryki jakości**: System logowania umożliwia obliczanie procentu akceptacji poprzez porównanie liczby zaakceptowanych fiszek do wszystkich wygenerowanych, co pozwala śledzić jedną z głównych metryk sukcesu produktu.

6. **Typ wyliczeniowy**: Wykorzystanie typu enum dla oznaczenia pochodzenia fiszek (manualne/AI/AI z edycją) zapewnia integralność danych i ułatwia raportowanie. 