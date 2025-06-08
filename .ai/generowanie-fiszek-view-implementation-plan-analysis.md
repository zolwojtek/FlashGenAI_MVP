# Analiza planu implementacji widoku generowania fiszek

## Zidentyfikowane niespójności i braki

### 1. **Niespójność z architekturą Astro**

**Problem**: Plan zakłada użycie React hooks (`useGenerationProcess`, `useFlashcardReview`, `useCharacterCounter`) i React Router, ale aplikacja używa Astro z selective hydration.

**Rozwiązanie**: 
- Komponenty statyczne powinny być napisane w Astro (.astro)
- Interaktywne komponenty w React (.tsx) z directive `client:load`
- Stan globalny przez Astro's stores lub Context API w React komponentach
- Routing przez Astro's file-based routing

### 2. **Brakujące typy ViewModel w types.ts**

**Problem**: Plan definiuje typy `GenerationProcessState`, `FlashcardReviewState`, `TextInputState`, ale nie ma ich w `types.ts`.

**Braki w types.ts**:
```typescript
// Typy do dodania w types.ts
export interface GenerationProcessState {
  sourceText: string;
  currentStep: 1 | 2 | 3;
  generatedFlashcards: FlashcardGeneratedDTO[];
  acceptedIds: string[];
  rejectedIds: string[];
  suggestedTitle: string;
  editedTitle: string;
  tempSetId: string;
  loading: boolean;
  error: string | null;
}

export interface FlashcardReviewState {
  currentIndex: number;
  isFlipped: boolean;
  editMode: boolean;
  editedFlashcards: Record<string, {
    frontContent?: string;
    backContent?: string;
  }>;
}

export interface TextInputState {
  text: string;
  charCount: number;
  isValid: boolean;
  validationMessage: string | null;
}
```

### 3. **Brakujący endpoint dla generation limit**

**Problem**: Plan wspomina o pobieraniu limitu generacji, ale nie określa, kiedy i jak to się dzieje.

**Brak**: 
- Wywołanie `GET /api/user/generation-limit` w Step1View
- Integracja z `UserGenerationLimitResponseDTO`

### 4. **Niespójność w edycji fiszek podczas generowania**

**Problem**: Plan mówi o edycji fiszek w Step2, ale nie ma mechanizmu persystencji tych zmian przed zapisem.

**Rozwiązanie**:
- Edytowane fiszki powinny być przechowywane lokalnie w stanie komponentu
- Przekazanie edytowanych danych w `ReviewFlashcardSetRequestDTO`
- Aktualizacja typu `ReviewFlashcardSetRequestDTO` o pole `edited_flashcards`

### 5. **Brakujące szczegóły session storage**

**Problem**: Plan wspomina o zapisywaniu stanu w sessionStorage, ale nie ma implementacji.

**Braki**:
- Kiedy zapisywać stan (opuszczenie strony, błąd, timeout)
- Jakie dane zapisywać (cały `GenerationProcessState`?)
- Kiedy przywracać stan (przy powrocie do procesu)

### 6. **Niespójność w routing**

**Problem**: Plan używa ścieżek `/generate/step1`, `/generate/step2`, `/generate/step3`, ale nie uwzględnia specyfiki Astro routing.

**Rozwiązanie Astro**:
- `src/pages/generate/step1.astro`
- `src/pages/generate/step2.astro` 
- `src/pages/generate/step3.astro`
- Lub `src/pages/generate/[step].astro` z dynamic routing

### 7. **Brakujące API dla edycji tymczasowych fiszek**

**Problem**: Plan zakłada edycję fiszek przed zatwierdzeniem, ale API nie obsługuje edycji tymczasowych fiszek.

**Rozwiązanie**:
- Edycja tylko po stronie klienta przed wysłaniem do `/api/flashcard-sets/review`
- Lub dodanie endpointu `PATCH /api/flashcard-sets/temp/{tempId}/flashcards/{id}`

### 8. **Niespójność w responsywności**

**Problem**: PRD mówi "bez optymalizacji dla urządzeń mobilnych", ale UI plan i implementacja plan wspominają o responsywności.

**Wyjaśnienie potrzebne**: 
- Czy aplikacja ma być responsive ale bez mobile-first podejścia?
- Czy desktop-first z podstawową responsywnością?

### 9. **Brakujące szczegóły error recovery**

**Problem**: Plan wspomina o obsłudze błędów, ale nie ma szczegółów dotyczących recovery.

**Braki**:
- Retry mechanizm dla failed API calls
- Fallback dla AI service failures
- Progressive enhancement w przypadku JS errors

### 10. **Integracja z istniejącymi serwisami**

**Problem**: Plan nie uwzględnia w pełni implementacji istniejących serwisów.

**Do sprawdzenia**:
- `aiService.generateFlashcards()` zwraca już `FlashcardGeneratedDTO[]`
- `flashcardGenerationService.checkUserGenerationLimit()` jest już zaimplementowany
- `flashcardReviewService.processFlashcardReview()` obsługuje już review flow

### 11. **Brakujące szczegóły dla offline handling**

**Problem**: Plan wspomina o wykrywaniu offline, ale nie ma implementacji.

**Potrzebne**:
- Service Worker dla offline detection
- Cache Strategy dla partial offline functionality
- User feedback dla offline state

## Rekomendacje napraw

### Pilne (przed implementacją)
1. Dostosować architekturę do Astro (komponenty .astro + React islands)
2. Dodać brakujące typy do `types.ts`
3. Określić strategię edycji fiszek (client-side vs API)
4. Ustalić routing strategy (static pages vs dynamic)

### Ważne (podczas implementacji)
1. Dodać endpoint dla generation limit lub określić kiedy go pobierać
2. Zaimplementować session storage strategy
3. Dodać error recovery mechanisms
4. Określić responsywność requirements

### Nice-to-have (po MVP)
1. Offline handling
2. Progressive enhancement
3. Advanced error recovery
4. Performance optimizations

## Sugerowane zmiany w planie

1. **Sekcja "Architektura Astro"** - dodać szczegóły o tym, które komponenty są statyczne (.astro), a które interaktywne (.tsx)

2. **Aktualizacja typów** - przenieść typy ViewModel do `types.ts`

3. **Sekcja "State Management"** - zastąpić React hooks na Astro stores + React Context dla interaktywnych części

4. **Routing strategy** - określić jak dokładnie będzie działać routing w Astro

5. **API Integration** - doprecyzować integrację z istniejącymi serwisami

6. **Error Handling** - dodać szczegółowe scenariusze recovery

7. **Session Persistence** - dodać konkretną implementację sessionStorage 