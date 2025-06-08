import { z } from "zod";

/**
 * Schema for validating flashcard set generation requests
 * Ensures source text is between 1000-10000 characters
 * Optional title must be 255 characters or less
 */
export const generateFlashcardSetRequestSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Tekst źródłowy musi zawierać co najmniej 1000 znaków")
    .max(10000, "Tekst źródłowy nie może przekraczać 10000 znaków"),
  title: z.string().max(255, "Tytuł nie może przekraczać 255 znaków").optional(),
});

export type GenerateFlashcardSetRequest = z.infer<typeof generateFlashcardSetRequestSchema>;
