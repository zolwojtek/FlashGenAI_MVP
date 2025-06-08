/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Database } from './db/database.types';

// Database Table Types
// Using underscore prefix to indicate these are intentionally defined but may not be directly used
type _FlashcardSet = Database['public']['Tables']['flashcard_sets']['Row'];
type _Flashcard = Database['public']['Tables']['flashcards']['Row'];
type _SourceText = Database['public']['Tables']['source_texts']['Row'];
type _GenerationLimit =
  Database['public']['Tables']['generation_limits']['Row'];
type _GenerationLog = Database['public']['Tables']['generation_logs']['Row'];

// Common DTO Types
export interface PaginationResponseDTO {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// User DTOs
export interface UserProfileResponseDTO {
  id: string;
  email: string;
  created_at: string;
}

export interface UserGenerationLimitResponseDTO {
  max_daily_limit: number;
  used_count: number;
  remaining_count: number;
  reset_at: string;
}

// Flashcard Set DTOs
export interface FlashcardSetItemDTO {
  id: string;
  title: string;
  created_at: string;
  last_reviewed_at: string | null;
  total_cards_count: number;
  is_due_for_review: boolean;
}

export interface FlashcardSetListResponseDTO {
  data: FlashcardSetItemDTO[];
  pagination: PaginationResponseDTO;
}

export type FlashcardSetResponseDTO = FlashcardSetItemDTO;

export interface CreateFlashcardSetRequestDTO {
  title: string;
}

export interface CreateFlashcardSetResponseDTO {
  id: string;
  title: string;
  created_at: string;
  total_cards_count: number;
}

export interface UpdateFlashcardSetRequestDTO {
  title: string;
}

export interface UpdateFlashcardSetResponseDTO {
  id: string;
  title: string;
  created_at: string;
  last_reviewed_at: string | null;
  total_cards_count: number;
}

export interface ReviewCompleteResponseDTO {
  id: string;
  last_reviewed_at: string;
}

export interface GenerateFlashcardSetRequestDTO {
  source_text: string;
  title?: string;
}

export interface FlashcardGeneratedDTO {
  id: string;
  front_content: string;
  back_content: string;
  creation_mode: CreationMode;
}

export interface GenerateFlashcardSetResponseDTO {
  set_id: string;
  title: string;
  flashcards: FlashcardGeneratedDTO[];
  created_at: string;
  total_cards_count: number;
}

export interface SuggestTitleRequestDTO {
  source_text: string;
}

export interface SuggestTitleResponseDTO {
  suggested_title: string;
}

// Flashcard DTOs
export interface FlashcardItemDTO {
  id: string;
  front_content: string;
  back_content: string;
  creation_mode: CreationMode;
  created_at: string;
  updated_at: string | null;
}

export interface FlashcardListResponseDTO {
  data: FlashcardItemDTO[];
  pagination: PaginationResponseDTO;
}

export interface FlashcardResponseDTO {
  id: string;
  set_id: string;
  front_content: string;
  back_content: string;
  creation_mode: CreationMode;
  created_at: string;
  updated_at: string | null;
}

export interface CreateFlashcardRequestDTO {
  front_content: string;
  back_content: string;
}

export interface CreateFlashcardResponseDTO {
  id: string;
  set_id: string;
  front_content: string;
  back_content: string;
  creation_mode: CreationMode;
  created_at: string;
  updated_at: string | null;
}

export interface UpdateFlashcardRequestDTO {
  front_content: string;
  back_content: string;
}

export interface UpdateFlashcardResponseDTO {
  id: string;
  set_id: string;
  front_content: string;
  back_content: string;
  creation_mode: CreationMode;
  created_at: string;
  updated_at: string | null;
}

export interface BatchFlashcardActionRequestDTO {
  accept: string[];
  reject: string[];
}

export interface ReviewFlashcardSetRequestDTO {
  set_id: string;
  title: string;
  source_text: string;
  accept: string[];
  reject: string[];
}

export interface BatchFlashcardActionResponseDTO {
  set_id: string;
  title?: string;
  accepted_count: number;
  rejected_count: number;
  status: 'success' | 'error';
  message?: string;
}

// Source Text DTOs
export interface SourceTextResponseDTO {
  id: string;
  set_id: string;
  content: string;
  created_at: string;
}

// Generation Logs DTOs
export interface GenerationLogItemDTO {
  id: string;
  set_id: string;
  set_title: string;
  generated_count: number;
  accepted_count: number;
  rejected_count: number;
  generated_at: string;
}

export interface GenerationLogListResponseDTO {
  data: GenerationLogItemDTO[];
  pagination: PaginationResponseDTO;
}

// Enum for creation mode
export enum CreationMode {
  MANUAL = 'manual',
  AI = 'ai',
  AI_EDITED = 'ai_edited',
}

// Command Models - for business logic operations
export interface GenerateFlashcardsCommand {
  userId: string;
  sourceText: string;
  title?: string;
}

export interface UpdateGenerationLogCommand {
  logId: string;
  acceptedIds: string[];
  rejectedIds: string[];
}

export interface ReviewSetCommand {
  setId: string;
  userId: string;
}

// Generation Process View Models
export interface GenerationProcessState {
  sourceText: string; // Wprowadzony tekst źródłowy
  currentStep: 1 | 2 | 3; // Aktualny krok procesu
  generatedFlashcards: FlashcardGeneratedDTO[]; // Wygenerowane fiszki
  acceptedIds: string[]; // ID zaakceptowanych fiszek
  rejectedIds: string[]; // ID odrzuconych fiszek
  suggestedTitle: string; // Sugerowany tytuł
  editedTitle: string; // Tytuł po ewentualnej edycji
  tempSetId: string; // Tymczasowe ID zestawu
  loading: boolean; // Czy trwa ładowanie
  error: string | null; // Komunikat błędu
  editedFlashcards: Record<
    string,
    {
      // Edytowane fiszki
      front_content?: string;
      back_content?: string;
    }
  >;
}

// Stan przeglądu fiszek
export interface FlashcardReviewState {
  currentIndex: number; // Indeks aktualnie wyświetlanej fiszki
  isFlipped: boolean; // Czy fiszka jest odwrócona
  editMode: boolean; // Czy fiszka jest w trybie edycji
  editedFlashcards: Record<
    string,
    {
      // Edytowane fiszki
      frontContent?: string;
      backContent?: string;
    }
  >;
}

// Stan formularza tekstu
export interface TextInputState {
  text: string; // Wprowadzony tekst
  charCount: number; // Liczba znaków
  isValid: boolean; // Czy długość tekstu jest poprawna
  validationMessage: string | null; // Komunikat walidacji
}

// OpenRouter API types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: any;
  };
}

export interface ChatCompletionOptions {
  model?: string;
  responseFormat?: ResponseFormat;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionChunk {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    delta: Partial<ChatMessage>;
    finish_reason: string | null;
  }[];
}

export interface OpenRouterError {
  code: string;
  message: string;
  details?: any;
}
