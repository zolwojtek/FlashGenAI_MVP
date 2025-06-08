/* eslint-disable prettier/prettier */
import { z } from 'zod';
import type { ReviewFlashcardSetRequestDTO } from '../types';

/**
 * Schema for validating flashcard review actions (accept/reject)
 * Used when user reviews the generated flashcard proposals
 */
export const batchFlashcardActionSchema = z.object({
  set_id: z.string().uuid('ID zestawu musi być prawidłowym UUID'),
  title: z.string().max(255, 'Tytuł nie może przekraczać 255 znaków'),
  source_text: z
    .string()
    .min(100, 'Tekst źródłowy musi zawierać co najmniej 100 znaków')
    .max(10000, 'Tekst źródłowy nie może przekraczać 10000 znaków'),
  accept: z.array(
    z.string().uuid('ID zaakceptowanych fiszek muszą być prawidłowymi UUID')
  ),
  reject: z.array(
    z.string().uuid('ID odrzuconych fiszek muszą być prawidłowymi UUID')
  ),
});

// Use the type from types.ts for consistency
export type BatchFlashcardActionRequest = ReviewFlashcardSetRequestDTO;
