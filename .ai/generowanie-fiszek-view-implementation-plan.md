# Plan implementacji widoku generowania fiszek

## 1. Przegląd
Proces generowania fiszek to kluczowa funkcjonalność aplikacji FlashGenAI, pozwalająca użytkownikom na automatyczne tworzenie fiszek edukacyjnych na podstawie wprowadzonego tekstu przy wykorzystaniu sztucznej inteligencji. Proces składa się z trzech kroków: wprowadzenia tekstu źródłowego, przeglądu i akceptacji/odrzucenia wygenerowanych fiszek oraz nadania tytułu i zapisania zestawu.

## 2. Routing widoku
- `/generate/step1` - wprowadzanie tekstu źródłowego
- `/generate/step2` - przegląd i akceptacja/odrzucenie wygenerowanych fiszek
- `/generate/step3` - podsumowanie i zapisanie zestawu

## 3. Struktura komponentów
```
GenerateLayout (layout wspólny dla wszystkich kroków)
├── ProgressIndicator
├── Step1View
│   ├── SourceTextForm
│   │   ├── TextareaWithCounter
│   │   └── GenerationLimitInfo
│   └── GenerateButton
├── Step2View
│   ├── FlashcardReviewOptions (ekran wstępny)
│   ├── FlashcardCarousel
│   │   ├── FlashcardCard
│   │   │   ├── FlashcardFront
│   │   │   └── FlashcardBack
│   │   └── ActionButtons
│   └── ReviewNavigationButtons
└── Step3View
    ├── TitleForm
    │   └── TitleInput
    ├── GenerationStats
    └── SaveSetButton
```

## 4. Szczegóły komponentów

### GenerateLayout
- Opis komponentu: Layout wspólny dla wszystkich trzech kroków procesu generowania, zapewniający spójny wygląd i nawigację.
- Główne elementy: Container, Header, ProgressIndicator, sloty na komponenty dla poszczególnych kroków
- Obsługiwane interakcje: Nawigacja między krokami
- Propsy: `currentStep: 1 | 2 | 3`, `children: ReactNode`

### ProgressIndicator
- Opis komponentu: Wskaźnik postępu informujący użytkownika na którym etapie procesu się znajduje.
- Główne elementy: Pasek postępu lub zestaw punktów z oznaczeniem aktualnego kroku
- Obsługiwane interakcje: Brak (komponent informacyjny)
- Propsy: `currentStep: 1 | 2 | 3`, `totalSteps: number = 3`

### Step1View
- Opis komponentu: Widok pierwszego kroku procesu, zawierający formularz do wprowadzania tekstu źródłowego.
- Główne elementy: SourceTextForm, GenerateButton, komunikaty o błędach
- Obsługiwane interakcje: Wprowadzanie tekstu, submisja formularza
- Obsługiwana walidacja: Długość tekstu (min. 1000, max. 10000 znaków)
- Typy: `GenerateFlashcardSetRequestDTO`, `UserGenerationLimitResponseDTO`
- Propsy: `onGenerate: (sourceText: string) => Promise<void>`, `limitInfo: UserGenerationLimitResponseDTO`

### SourceTextForm
- Opis komponentu: Formularz zawierający pole tekstowe i informację o limicie generacji.
- Główne elementy: TextareaWithCounter, GenerationLimitInfo, instrukcje dla użytkownika
- Obsługiwane interakcje: Wprowadzanie tekstu
- Obsługiwana walidacja: Długość tekstu (min. 1000, max. 10000 znaków)
- Propsy: `value: string`, `onChange: (text: string) => void`, `limitInfo: UserGenerationLimitResponseDTO`

### TextareaWithCounter
- Opis komponentu: Pole tekstowe z licznikiem znaków i wizualną informacją o spełnieniu wymagań długości.
- Główne elementy: Textarea, licznik znaków, wskaźnik walidacji
- Obsługiwane interakcje: Wprowadzanie tekstu
- Obsługiwana walidacja: Długość tekstu (min. 1000, max. 10000 znaków)
- Propsy: `value: string`, `onChange: (text: string) => void`, `minLength: number`, `maxLength: number`

### GenerationLimitInfo
- Opis komponentu: Informacja o dziennym limicie generacji fiszek dla użytkownika.
- Główne elementy: Tekst informacyjny, ikona, wskaźnik wykorzystania limitu
- Obsługiwane interakcje: Brak (komponent informacyjny)
- Propsy: `usedCount: number`, `maxDailyLimit: number`, `resetAt: string`

### GenerateButton
- Opis komponentu: Przycisk do uruchomienia procesu generowania fiszek.
- Główne elementy: Przycisk, opcjonalny spinner podczas ładowania
- Obsługiwane interakcje: Kliknięcie
- Propsy: `onClick: () => void`, `isLoading: boolean`, `isDisabled: boolean`

### Step2View
- Opis komponentu: Widok drugiego kroku procesu, umożliwiający przeglądanie i akceptację/odrzucenie wygenerowanych fiszek.
- Główne elementy: FlashcardReviewOptions, FlashcardCarousel, ReviewNavigationButtons
- Obsługiwane interakcje: Przeglądanie fiszek, akceptacja/odrzucenie, nawigacja
- Typy: `FlashcardGeneratedDTO[]`, `BatchFlashcardActionRequestDTO`
- Propsy: `flashcards: FlashcardGeneratedDTO[]`, `onComplete: (decisions: {accept: string[], reject: string[]}) => void`

### FlashcardReviewOptions
- Opis komponentu: Ekran wstępny z opcjami rozpoczęcia przeglądu, akceptacji wszystkich lub odrzucenia wszystkich fiszek.
- Główne elementy: Przyciski akcji, tekst informacyjny
- Obsługiwane interakcje: Wybór opcji przeglądu
- Propsy: `flashcardsCount: number`, `onAcceptAll: () => void`, `onRejectAll: () => void`, `onStartReview: () => void`

### FlashcardCarousel
- Opis komponentu: Karuzela wyświetlająca pojedyncze fiszki do przeglądu, z możliwością nawigacji między nimi.
- Główne elementy: FlashcardCard, ActionButtons, wskaźnik postępu (np. "3 z 10")
- Obsługiwane interakcje: Nawigacja między fiszkami, odwracanie fiszki, akceptacja/odrzucenie
- Propsy: `flashcards: FlashcardGeneratedDTO[]`, `onDecision: (id: string, decision: 'accept' | 'reject') => void`

### FlashcardCard
- Opis komponentu: Komponent wyświetlający pojedynczą fiszkę z animacją odwracania.
- Główne elementy: FlashcardFront, FlashcardBack, kontener z animacją flip
- Obsługiwane interakcje: Kliknięcie (odwrócenie), edycja
- Propsy: `flashcard: FlashcardGeneratedDTO`, `isFlipped: boolean`, `onFlip: () => void`, `onEdit: (id: string, field: 'front_content' | 'back_content', value: string) => void`

### ActionButtons
- Opis komponentu: Przyciski do akceptacji, odrzucenia i edycji fiszki.
- Główne elementy: Przyciski z ikonami, opcjonalne podpowiedzi
- Obsługiwane interakcje: Kliknięcie przycisków
- Propsy: `onAccept: () => void`, `onReject: () => void`, `onEdit: () => void`

### ReviewNavigationButtons
- Opis komponentu: Przyciski do nawigacji między fiszkami i przejścia do kolejnego kroku.
- Główne elementy: Przyciski "Poprzednia", "Następna", "Zakończ przegląd"
- Obsługiwane interakcje: Nawigacja, zakończenie przeglądu
- Propsy: `onPrevious: () => void`, `onNext: () => void`, `onComplete: () => void`, `canGoBack: boolean`, `canGoForward: boolean`, `canComplete: boolean`

### Step3View
- Opis komponentu: Widok trzeciego kroku procesu, umożliwiający nadanie tytułu i zapisanie zestawu.
- Główne elementy: TitleForm, GenerationStats, SaveSetButton
- Obsługiwane interakcje: Edycja tytułu, zapis zestawu
- Obsługiwana walidacja: Niepusty tytuł
- Typy: `ReviewFlashcardSetRequestDTO`, `BatchFlashcardActionResponseDTO`
- Propsy: `suggestedTitle: string`, `flashcardsStats: {accepted: number, rejected: number}`, `onSave: (title: string) => Promise<void>`, `onBack: () => void`

### TitleForm
- Opis komponentu: Formularz do wprowadzania tytułu zestawu.
- Główne elementy: TitleInput, etykieta, opcjonalny komunikat o sugerowanym tytule
- Obsługiwane interakcje: Wprowadzanie tekstu
- Obsługiwana walidacja: Niepusty tytuł
- Propsy: `value: string`, `onChange: (title: string) => void`, `suggestedTitle: string`

### TitleInput
- Opis komponentu: Pole do wprowadzania tytułu zestawu.
- Główne elementy: Input, opcjonalny komunikat walidacji
- Obsługiwane interakcje: Wprowadzanie tekstu
- Obsługiwana walidacja: Niepusty tytuł
- Propsy: `value: string`, `onChange: (title: string) => void`, `placeholder: string`

### GenerationStats
- Opis komponentu: Statystyki wygenerowanych fiszek (zaakceptowane/odrzucone).
- Główne elementy: Liczniki, ikony, tekst informacyjny
- Obsługiwane interakcje: Brak (komponent informacyjny)
- Propsy: `acceptedCount: number`, `rejectedCount: number`

### SaveSetButton
- Opis komponentu: Przycisk do zapisania zestawu fiszek.
- Główne elementy: Przycisk, opcjonalny spinner podczas zapisywania
- Obsługiwane interakcje: Kliknięcie
- Propsy: `onClick: () => void`, `isLoading: boolean`, `isDisabled: boolean`

## 5. Typy

### Typy DTO (dostępne w types.ts)
Większość typów jest już zdefiniowana w pliku types.ts. Kluczowe typy to:
- `GenerateFlashcardSetRequestDTO` - żądanie generowania fiszek
- `FlashcardGeneratedDTO` - wygenerowana fiszka
- `GenerateFlashcardSetResponseDTO` - odpowiedź z wygenerowanymi fiszkami
- `ReviewFlashcardSetRequestDTO` - żądanie zapisania fiszek po przeglądzie
- `BatchFlashcardActionResponseDTO` - odpowiedź po zapisaniu fiszek
- `UserGenerationLimitResponseDTO` - informacje o limicie generacji

### Nowe typy ViewModel
```typescript
// Stan procesu generowania
interface GenerationProcessState {
  sourceText: string;                             // Wprowadzony tekst źródłowy
  currentStep: 1 | 2 | 3;                         // Aktualny krok procesu
  generatedFlashcards: FlashcardGeneratedDTO[];   // Wygenerowane fiszki
  acceptedIds: string[];                          // ID zaakceptowanych fiszek
  rejectedIds: string[];                          // ID odrzuconych fiszek
  suggestedTitle: string;                         // Sugerowany tytuł
  editedTitle: string;                            // Tytuł po ewentualnej edycji
  tempSetId: string;                              // Tymczasowe ID zestawu
  loading: boolean;                               // Czy trwa ładowanie
  error: string | null;                           // Komunikat błędu
}

// Stan przeglądu fiszek
interface FlashcardReviewState {
  currentIndex: number;                           // Indeks aktualnie wyświetlanej fiszki
  isFlipped: boolean;                             // Czy fiszka jest odwrócona
  editMode: boolean;                              // Czy fiszka jest w trybie edycji
  editedFlashcards: Record<string, {              // Edytowane fiszki
    frontContent?: string;
    backContent?: string;
  }>;
}

// Stan formularza tekstu
interface TextInputState {
  text: string;                                   // Wprowadzony tekst
  charCount: number;                              // Liczba znaków
  isValid: boolean;                               // Czy długość tekstu jest poprawna
  validationMessage: string | null;               // Komunikat walidacji
}
```

## 6. Zarządzanie stanem

### Hook: useGenerationProcess
Custom hook zarządzający całym procesem generowania fiszek, przechowujący stan między krokami i obsługujący komunikację z API.

```typescript
const useGenerationProcess = () => {
  const [state, setState] = useState<GenerationProcessState>({
    sourceText: '',
    currentStep: 1,
    generatedFlashcards: [],
    acceptedIds: [],
    rejectedIds: [],
    suggestedTitle: '',
    editedTitle: '',
    tempSetId: '',
    loading: false,
    error: null
  });

  // Metody zarządzające stanem...
  
  // Pobieranie limitu generacji
  const fetchGenerationLimit = async () => {...};
  
  // Ustawienie tekstu źródłowego
  const setSourceText = (text: string) => {...};
  
  // Generowanie fiszek
  const generateFlashcards = async () => {...};
  
  // Nawigacja między krokami
  const goToStep = (step: 1 | 2 | 3) => {...};
  
  // Akceptacja/odrzucenie fiszki
  const acceptFlashcard = (id: string) => {...};
  const rejectFlashcard = (id: string) => {...};
  
  // Edycja fiszki
  const editFlashcard = (id: string, field: 'front_content' | 'back_content', value: string) => {...};
  
  // Ustawienie tytułu
  const setTitle = (title: string) => {...};
  
  // Zapisanie zestawu
  const saveFlashcardSet = async () => {...};
  
  return {
    state,
    setSourceText,
    generateFlashcards,
    goToStep,
    acceptFlashcard,
    rejectFlashcard,
    editFlashcard,
    setTitle,
    saveFlashcardSet,
    fetchGenerationLimit
  };
};
```

### Hook: useFlashcardReview
Custom hook do zarządzania przeglądem fiszek (nawigacja, odwracanie, edycja).

```typescript
const useFlashcardReview = (
  flashcards: FlashcardGeneratedDTO[],
  onDecision: (id: string, decision: 'accept' | 'reject') => void
) => {
  const [state, setState] = useState<FlashcardReviewState>({
    currentIndex: 0,
    isFlipped: false,
    editMode: false,
    editedFlashcards: {}
  });
  
  // Metody zarządzające stanem...
  
  // Aktualnie wyświetlana fiszka
  const currentFlashcard = flashcards[state.currentIndex];
  
  // Odwrócenie fiszki
  const flipCard = () => {...};
  
  // Nawigacja
  const goToNext = () => {...};
  const goToPrevious = () => {...};
  
  // Akcje
  const acceptCurrent = () => {...};
  const rejectCurrent = () => {...};
  const editCurrent = (field: 'front_content' | 'back_content', value: string) => {...};
  
  return {
    currentFlashcard,
    isFlipped: state.isFlipped,
    editMode: state.editMode,
    currentIndex: state.currentIndex,
    totalCount: flashcards.length,
    flipCard,
    goToNext,
    goToPrevious,
    acceptCurrent,
    rejectCurrent,
    editCurrent
  };
};
```

### Hook: useCharacterCounter
Custom hook do liczenia znaków w polu tekstowym i walidacji.

```typescript
const useCharacterCounter = (minLength: number, maxLength: number) => {
  const [state, setState] = useState<TextInputState>({
    text: '',
    charCount: 0,
    isValid: false,
    validationMessage: null
  });
  
  // Ustawienie tekstu i walidacja
  const setText = (text: string) => {...};
  
  return {
    text: state.text,
    charCount: state.charCount,
    isValid: state.isValid,
    validationMessage: state.validationMessage,
    setText
  };
};
```

## 7. Integracja API

### Endpoint: POST /api/flashcard-sets/generate
- **Cel**: Generowanie fiszek z tekstu źródłowego
- **Wywołanie**: W komponencie Step1View po kliknięciu przycisku "Generuj fiszki"
- **Dane wejściowe**: `GenerateFlashcardSetRequestDTO`
- **Dane wyjściowe**: `GenerateFlashcardSetResponseDTO`
- **Obsługa błędów**: Wyświetlenie komunikatu błędu w Step1View

```typescript
const generateFlashcards = async (sourceText: string): Promise<GenerateFlashcardSetResponseDTO> => {
  const response = await fetch('/api/flashcard-sets/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_text: sourceText })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Wystąpił błąd podczas generowania fiszek');
  }
  
  return response.json();
};
```

### Endpoint: POST /api/flashcard-sets/review
- **Cel**: Zapisanie zestawu fiszek po przeglądzie
- **Wywołanie**: W komponencie Step3View po kliknięciu przycisku "Zapisz zestaw"
- **Dane wejściowe**: `ReviewFlashcardSetRequestDTO`
- **Dane wyjściowe**: `BatchFlashcardActionResponseDTO`
- **Obsługa błędów**: Wyświetlenie komunikatu błędu w Step3View

```typescript
const saveFlashcardSet = async (reviewData: ReviewFlashcardSetRequestDTO): Promise<BatchFlashcardActionResponseDTO> => {
  const response = await fetch('/api/flashcard-sets/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Wystąpił błąd podczas zapisywania zestawu');
  }
  
  return response.json();
};
```

### Endpoint: POST /api/flashcard-sets/suggest-title
- **Cel**: Sugerowanie tytułu zestawu na podstawie tekstu źródłowego
- **Wywołanie**: Automatycznie podczas przejścia do kroku 3
- **Dane wejściowe**: `SuggestTitleRequestDTO`
- **Dane wyjściowe**: `SuggestTitleResponseDTO`
- **Obsługa błędów**: Użycie domyślnego tytułu w przypadku błędu

```typescript
const suggestTitle = async (sourceText: string): Promise<string> => {
  try {
    const response = await fetch('/api/flashcard-sets/suggest-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_text: sourceText })
    });
    
    if (!response.ok) {
      throw new Error('Błąd sugerowania tytułu');
    }
    
    const data = await response.json();
    return data.suggested_title;
  } catch (error) {
    console.error('Błąd podczas sugerowania tytułu:', error);
    return 'Nowy zestaw fiszek'; // Domyślny tytuł
  }
};
```

## 8. Interakcje użytkownika

### Krok 1: Wprowadzanie tekstu źródłowego
1. Użytkownik wprowadza tekst w pole tekstowe
   - Aktualizacja licznika znaków w czasie rzeczywistym
   - Walidacja długości tekstu (min. 1000, max. 10000 znaków)
   - Wizualne wskazanie poprawności długości
2. Użytkownik klika przycisk "Generuj fiszki"
   - Walidacja tekstu przed wysłaniem
   - Wyświetlenie spinnera podczas generowania
   - Po sukcesie przejście do kroku 2
   - W przypadku błędu wyświetlenie komunikatu

### Krok 2: Przegląd i akceptacja/odrzucenie fiszek
1. Użytkownik widzi ekran wstępny z opcjami
   - Możliwość akceptacji wszystkich fiszek
   - Możliwość odrzucenia wszystkich fiszek
   - Możliwość przejścia do pojedynczego przeglądu
2. Podczas pojedynczego przeglądu:
   - Użytkownik widzi przód fiszki
   - Kliknięcie fiszki odwraca ją, pokazując tył
   - Użytkownik może zaakceptować/odrzucić fiszkę przyciskami
   - Użytkownik może edytować fiszkę przed decyzją
   - Po decyzji następuje automatyczne przejście do następnej fiszki
3. Po przeglądzie wszystkich fiszek:
   - Automatyczne przejście do kroku 3
   - Możliwość powrotu do przeglądu

### Krok 3: Nadanie tytułu i zapisanie zestawu
1. Użytkownik widzi sugerowany tytuł w polu edycji
   - Możliwość edycji tytułu
   - Walidacja (niepusty tytuł)
2. Użytkownik widzi statystyki (liczba zaakceptowanych/odrzuconych fiszek)
3. Użytkownik klika przycisk "Zapisz zestaw"
   - Wyświetlenie spinnera podczas zapisywania
   - Po sukcesie przekierowanie do dashboardu
   - W przypadku błędu wyświetlenie komunikatu

## 9. Warunki i walidacja

### Walidacja tekstu źródłowego
- **Warunek**: Długość tekstu między 1000 a 10000 znaków
- **Komponenty**: TextareaWithCounter, Step1View
- **Efekty**: 
  - Licznik znaków zmienia kolor (czerwony < 1000, zielony 1000-10000, czerwony > 10000)
  - Komunikat walidacji poniżej pola
  - Przycisk "Generuj fiszki" jest nieaktywny gdy tekst nie spełnia warunków

### Limit dziennych generacji
- **Warunek**: Użytkownik nie przekroczył limitu 5 generacji dziennie
- **Komponenty**: GenerationLimitInfo, Step1View
- **Efekty**:
  - Wyświetlenie informacji o pozostałym limicie
  - Przycisk "Generuj fiszki" jest nieaktywny gdy limit jest wyczerpany
  - Komunikat z informacją o czasie resetowania limitu

### Walidacja tytułu
- **Warunek**: Tytuł nie może być pusty
- **Komponenty**: TitleInput, Step3View
- **Efekty**:
  - Komunikat walidacji poniżej pola
  - Przycisk "Zapisz zestaw" jest nieaktywny gdy tytuł jest pusty

### Walidacja zestawu
- **Warunek**: Co najmniej jedna fiszka musi być zaakceptowana
- **Komponenty**: Step3View
- **Efekty**:
  - Komunikat ostrzegawczy gdy wszystkie fiszki są odrzucone
  - Przycisk "Zapisz zestaw" jest nieaktywny gdy nie ma zaakceptowanych fiszek

## 10. Obsługa błędów

### Błędy API
1. **Błąd podczas generowania fiszek**
   - Przyczyny: Problemy z serwerem, brak autoryzacji, przekroczenie limitu
   - Obsługa: Wyświetlenie komunikatu z informacją o błędzie i możliwością ponowienia próby
   - Kody błędów: 400 (niepoprawne dane), 401 (brak autoryzacji), 429 (limit wyczerpany)

2. **Błąd podczas zapisywania zestawu**
   - Przyczyny: Problemy z serwerem, brak autoryzacji, niepoprawne dane
   - Obsługa: Wyświetlenie komunikatu z informacją o błędzie i możliwością ponowienia próby
   - Kody błędów: 400 (niepoprawne dane), 401 (brak autoryzacji)

### Błędy użytkownika
1. **Niepoprawna długość tekstu**
   - Przyczyna: Tekst jest za krótki lub za długi
   - Obsługa: Walidacja w czasie rzeczywistym, komunikat z wymaganiami

2. **Brak zaakceptowanych fiszek**
   - Przyczyna: Użytkownik odrzucił wszystkie fiszki
   - Obsługa: Komunikat ostrzegawczy, opcja powrotu do przeglądu lub wygenerowania nowych fiszek

### Błędy techniczne
1. **Przerwanie procesu generowania**
   - Przyczyna: Użytkownik opuszcza stronę podczas generowania
   - Obsługa: Zapisanie stanu w sessionStorage, możliwość kontynuacji po powrocie

2. **Utrata połączenia internetowego**
   - Przyczyna: Problemy z siecią
   - Obsługa: Wykrywanie stanu offline, komunikat o błędzie, automatyczne ponowienie po przywróceniu połączenia

## 11. Kroki implementacji

1. **Przygotowanie architektury**
   - Utworzenie plików komponentów zgodnie ze strukturą
   - Implementacja podstawowego routingu
   - Implementacja custom hooków (useGenerationProcess, useFlashcardReview, useCharacterCounter)

2. **Implementacja Step1View**
   - Implementacja TextareaWithCounter z walidacją
   - Implementacja GenerationLimitInfo
   - Integracja z API do sprawdzania limitu generacji
   - Dodanie logiki do przycisku "Generuj fiszki"

3. **Implementacja Step2View**
   - Implementacja FlashcardCard z animacją odwracania
   - Implementacja ActionButtons
   - Implementacja FlashcardCarousel z nawigacją
   - Dodanie logiki akceptacji/odrzucenia fiszek
   - Implementacja FlashcardReviewOptions (ekran wstępny)

4. **Implementacja Step3View**
   - Implementacja TitleForm z walidacją
   - Implementacja GenerationStats
   - Integracja z API do sugerowania tytułu
   - Dodanie logiki do przycisku "Zapisz zestaw"

5. **Integracja i testy**
   - Integracja wszystkich kroków z useGenerationProcess
   - Implementacja przechowywania stanu między krokami
   - Testy funkcjonalności (walidacja, generowanie, przegląd, zapisywanie)
   - Testy obsługi błędów i przypadków brzegowych

6. **Poprawki dostępności i UX**
   - Dodanie skrótów klawiaturowych dla nawigacji
   - Implementacja fokusa i obsługi klawiatury
   - Dodanie komunikatów dla czytników ekranu
   - Optymalizacja dla urządzeń dotykowych

7. **Finalizacja**
   - Przegląd kodu i refaktoryzacja
   - Optymalizacja wydajności
   - Testy kompatybilności przeglądarkowej
   - Dokumentacja komponentów 