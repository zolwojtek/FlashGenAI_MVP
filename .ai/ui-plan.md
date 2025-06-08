# Architektura UI dla FlashGenAI

## 1. Przegląd struktury UI

Aplikacja FlashGenAI będzie posiadać trzy główne widoki:
- Dashboard - centralny punkt aplikacji z sekcjami "Twoje talie" i "Powtórki"
- Proces generowania fiszek - trzyetapowy workflow
- Widok pojedynczego zestawu fiszek - zarządzanie fiszkami w zestawie

Aplikacja będzie zawierać spójną nawigację główną widoczną na każdej stronie dla zalogowanych użytkowników, z responsywnym zachowaniem na różnych rozmiarach ekranu.

## 2. Lista widoków

### Widok uwierzytelniania
- **Ścieżka**: /auth
- **Główny cel**: Umożliwienie użytkownikowi logowania lub rejestracji
- **Kluczowe informacje**: 
  - Formularz logowania/rejestracji
  - Przełącznik między logowaniem a rejestracją
  - Pola email/hasło
  - Komunikaty o błędach walidacji
  - Link do resetowania hasła
- **Kluczowe komponenty**:
  - Formularz z walidacją
  - Przyciski akcji
  - Przełącznik logowanie/rejestracja
- **UX/Dostępność/Bezpieczeństwo**:
  - Jasne komunikaty błędów
  - Autofocus na pierwszym polu
  - Walidacja danych po stronie klienta
  - Zabezpieczenie przed atakami (rate limiting)
  - WCAG: dostępność dla czytników ekranowych

### Dashboard
- **Ścieżka**: /
- **Główny cel**: Zapewnienie szybkiego dostępu do wszystkich funkcji aplikacji
- **Kluczowe informacje**:
  - Lista/siatka zestawów fiszek
  - Liczba zestawów wymagających powtórki
  - Pozostały dzienny limit generacji
- **Kluczowe komponenty**:
  - Nagłówek z nazwą aplikacji i profilem użytkownika
  - Sekcja "Twoje talie" z kartami zestawów
  - Sekcja "Powtórki" z zestawami wymagającymi powtórki
  - Przycisk "Nowa talia" 
  - Skeleton loaders podczas ładowania danych
- **UX/Dostępność/Bezpieczeństwo**:
  - Skeleton loaders dla poprawy postrzeganej wydajności
  - Responsywny układ (siatka na większych ekranach, lista na mniejszych)
  - Sortowanie zestawów (najnowsze/najstarsze)
  - WCAG: odpowiedni kontrast, dostępne opisy elementów

### Proces generowania fiszek - Etap 1
- **Ścieżka**: /generate/step1
- **Główny cel**: Umożliwienie wprowadzenia tekstu źródłowego do generowania fiszek
- **Kluczowe informacje**:
  - Pole tekstowe na tekst źródłowy
  - Licznik znaków (1000-10000)
  - Informacja o pozostałym limicie generacji
- **Kluczowe komponenty**:
  - Indykator postępu (1 z 3)
  - Textarea z licznikiem znaków
  - Informacja o limicie dziennym
  - Przycisk "Generuj fiszki"
  - Spinner podczas generowania
- **UX/Dostępność/Bezpieczeństwo**:
  - Walidacja długości tekstu w czasie rzeczywistym
  - Zapisywanie wprowadzonego tekstu w przypadku opuszczenia strony
  - Blokada przycisku generowania przy przekroczeniu limitu
  - WCAG: jasne komunikaty błędów

### Proces generowania fiszek - Etap 2
- **Ścieżka**: /generate/step2
- **Główny cel**: Umożliwienie przeglądania i akceptacji/odrzucania wygenerowanych fiszek
- **Kluczowe informacje**:
  - Pojedyncza fiszka (przód/tył)
  - Przyciski akceptacji/odrzucenia
  - Indykator postępu
- **Kluczowe komponenty**:
  - Indykator postępu (2 z 3)
  - Ekran wstępny z opcjami "Akceptuj wszystkie"/"Odrzuć wszystkie"/"Przejdź do pierwszej fiszki"
  - Interfejs karuzelowy z pojedynczą fiszką
  - Przyciski akceptacji/odrzucenia
  - Indykator postępu (np. "Fiszka 3 z 10")
  - Animacja flip dla pokazania tyłu fiszki
- **UX/Dostępność/Bezpieczeństwo**:
  - Kolorowe obwódki dla zaakceptowanych/odrzuconych fiszek
  - Skróty klawiaturowe dla szybkiej nawigacji
  - Możliwość edycji fiszki przed akceptacją
  - WCAG: odpowiednie oznaczenia stanu (zaakceptowana/odrzucona)

### Proces generowania fiszek - Etap 3
- **Ścieżka**: /generate/step3
- **Główny cel**: Podsumowanie procesu generowania i zapisanie zestawu
- **Kluczowe informacje**:
  - Pole tytułu zestawu (z sugerowanym tytułem)
  - Statystyki (zaakceptowane/odrzucone)
  - Przycisk zapisania zestawu
- **Kluczowe komponenty**:
  - Indykator postępu (3 z 3)
  - Pole tytułu zestawu
  - Statystyki akceptacji
  - Przycisk "Zapisz zestaw"
  - Przycisk "Wróć do edycji"
- **UX/Dostępność/Bezpieczeństwo**:
  - Autofocus na polu tytułu
  - Walidacja tytułu
  - Zabezpieczenie przed podwójnym zapisaniem
  - WCAG: jasne komunikaty statusu

### Widok pojedynczego zestawu fiszek
- **Ścieżka**: /sets/{id}
- **Główny cel**: Zarządzanie fiszkami w zestawie
- **Kluczowe informacje**:
  - Lista fiszek w zestawie (przód)
  - Tytuł zestawu
  - Opcje zarządzania zestawem
- **Kluczowe komponenty**:
  - Tytuł zestawu (inline-editable)
  - Lista fiszek (pokazująca tylko przód)
  - Przycisk dodania nowej fiszki
  - Przycisk rozpoczęcia powtórki
  - Przycisk powrotu do Dashboardu
  - Przycisk usunięcia zestawu
- **UX/Dostępność/Bezpieczeństwo**:
  - Inline-editable tytuły
  - Dwustopniowy proces usuwania zestawu
  - Możliwość filtrowania fiszek
  - WCAG: jasne etykiety dla interaktywnych elementów

### Widok powtórki zestawu
- **Ścieżka**: /sets/{id}/review
- **Główny cel**: Umożliwienie powtórki fiszek w zestawie
- **Kluczowe informacje**:
  - Pojedyncza fiszka (przód)
  - Przycisk "Pokaż tył"
  - Przyciski nawigacji
- **Kluczowe komponenty**:
  - Pojedyncza fiszka z animacją odwracania
  - Przyciski nawigacji (następna/poprzednia)
  - Indykator postępu
  - Przycisk zakończenia powtórki
- **UX/Dostępność/Bezpieczeństwo**:
  - Skróty klawiaturowe dla szybkiej nawigacji
  - Animacja flip dla pokazania tyłu fiszki
  - Podsumowanie po zakończeniu powtórki
  - WCAG: dostępne oznaczenia stanu (przód/tył)

### Modal edycji fiszki
- **Ścieżka**: N/A (komponent modalny)
- **Główny cel**: Edycja zawartości fiszki
- **Kluczowe informacje**:
  - Pola przód/tył fiszki
  - Przyciski akcji
- **Kluczowe komponenty**:
  - Pola przód/tył o równej wysokości
  - Przyciski "Zapisz"/"Anuluj"
  - Opcja usunięcia fiszki
- **UX/Dostępność/Bezpieczeństwo**:
  - Pułapka na fokus (focus trap) dla modalu
  - Autofocus na pierwszym polu
  - Potwierdzenie przed usunięciem
  - WCAG: dostępna nawigacja klawiaturą

## 3. Mapa podróży użytkownika

### Rejestracja i logowanie
1. Użytkownik wchodzi na stronę aplikacji
2. Jeśli nie jest zalogowany, zostaje przekierowany do widoku uwierzytelniania
3. Wypełnia formularz rejestracji lub logowania
4. Po udanym uwierzytelnieniu przechodzi do Dashboardu

### Generowanie nowego zestawu fiszek
1. Z Dashboardu użytkownik klika przycisk "Nowa talia"
2. Etap 1: Wprowadza tekst źródłowy i klika "Generuj fiszki"
3. System sprawdza limit dzienny i długość tekstu
4. Jeśli wszystko OK, system generuje fiszki i przechodzi do Etapu 2
5. Etap 2: Użytkownik widzi ekran wstępny z opcjami
   - Może wybrać "Akceptuj wszystkie" i przejść do Etapu 3
   - Może wybrać "Odrzuć wszystkie" i wrócić do Etapu 1
   - Może przejść do pierwszej fiszki i rozpocząć przeglądanie
6. Podczas przeglądania użytkownik widzi fiszkę, może odwrócić ją, zaakceptować lub odrzucić
7. Po przejrzeniu wszystkich fiszek system przechodzi do Etapu 3
8. Etap 3: Użytkownik widzi sugerowany tytuł zestawu i statystyki
9. Może edytować tytuł i kliknąć "Zapisz zestaw"
10. Po zapisaniu zostaje przekierowany do widoku pojedynczego zestawu

### Zarządzanie zestawem fiszek
1. Z Dashboardu użytkownik klika na kartę zestawu
2. Zostaje przekierowany do widoku pojedynczego zestawu
3. Może edytować tytuł zestawu inline
4. Może przeglądać listę fiszek (widoczny tylko przód)
5. Może kliknąć na fiszkę, aby otworzyć modal edycji
6. W modalu może edytować przód i tył fiszki lub ją usunąć
7. Może dodać nową fiszkę poprzez przycisk "Dodaj fiszkę"
8. Może usunąć cały zestaw (z potwierdzeniem)
9. Może rozpocząć powtórkę zestawu

### Powtórka zestawu
1. Z Dashboardu lub widoku pojedynczego zestawu użytkownik klika "Rozpocznij powtórkę"
2. Zostaje przekierowany do widoku powtórki
3. Widzi przednią stronę pierwszej fiszki
4. Może kliknąć "Pokaż tył", aby zobaczyć odpowiedź
5. Przechodzi do kolejnych fiszek używając przycisków nawigacji
6. Po przejrzeniu wszystkich fiszek widzi podsumowanie
7. System aktualizuje datę ostatniego użycia zestawu
8. Użytkownik wraca do Dashboardu lub widoku pojedynczego zestawu

## 4. Układ i struktura nawigacji

### Główna nawigacja
- **Stała górna belka** zawierająca:
  - Logo i nazwę aplikacji (link do Dashboardu)
  - Nazwę zalogowanego użytkownika
  - Przycisk wylogowania
  - Na urządzeniach mobilnych: przycisk menu hamburger

### Nawigacja drugiego poziomu
- **W procesie generowania fiszek**:
  - Indykator postępu (1-2-3)
  - Przyciski wstecz/dalej
  - Przycisk anulowania procesu (powrót do Dashboardu)

- **W widoku pojedynczego zestawu**:
  - Przycisk powrotu do Dashboardu
  - Przycisk rozpoczęcia powtórki

- **W widoku powtórki**:
  - Przyciski nawigacji (następna/poprzednia fiszka)
  - Przycisk zakończenia powtórki

### Przepływy nawigacyjne
1. **Główny przepływ**:
   Auth → Dashboard → (Generowanie fiszek | Widok zestawu | Powtórka)

2. **Generowanie fiszek**:
   Dashboard → Etap 1 → Etap 2 → Etap 3 → Widok zestawu lub Dashboard

3. **Zarządzanie zestawem**:
   Dashboard → Widok zestawu → (Edycja fiszki | Powtórka | Dashboard)

4. **Powtórka zestawu**:
   (Dashboard | Widok zestawu) → Powtórka → Podsumowanie → (Dashboard | Widok zestawu)

## 5. Kluczowe komponenty

### Karta zestawu fiszek
- Wyświetla tytuł zestawu, liczbę fiszek i datę ostatniej modyfikacji
- Zawiera przycisk rozpoczęcia powtórki
- Różne wersje karty dla zestawów wymagających powtórki (z wyróżnieniem)
- Używany w Dashboardzie w sekcjach "Twoje talie" i "Powtórki"

### Komponent fiszki
- Wyświetla przód i tył fiszki
- Obsługuje animację odwracania
- Różne warianty: tryb przeglądania, tryb powtórki, tryb edycji
- Używany w widoku przeglądania fiszek, powtórki i w modalu edycji

### Pasek postępu
- Wyświetla aktualny postęp w wieloetapowym procesie
- Używany w procesie generowania fiszek i w widoku powtórki

### Toast notifications
- Wyświetla komunikaty sukcesu, błędu i informacyjne
- Automatycznie znika po określonym czasie
- Używany w całej aplikacji do informowania o wynikach operacji

### Modal potwierdzenia
- Wyświetla pytanie potwierdzające operację
- Zawiera przyciski potwierdzenia i anulowania
- Używany przy usuwaniu zestawów i fiszek

### Skeleton loader
- Wyświetla placeholdery podczas ładowania danych
- Używany w Dashboardzie i widoku pojedynczego zestawu
- Poprawia postrzeganą wydajność aplikacji

### Inline-editable tytuł
- Umożliwia edycję tytułu zestawu bezpośrednio na stronie
- Przełącza się między tekstem a polem edycji po kliknięciu
- Używany w widoku pojedynczego zestawu 