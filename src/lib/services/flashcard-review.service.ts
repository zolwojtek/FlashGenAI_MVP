/* eslint-disable prettier/prettier */
import { randomUUID } from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { ReviewFlashcardSetRequestDTO, BatchFlashcardActionResponseDTO, FlashcardGeneratedDTO } from "../../types";

/**
 * Service for handling flashcard review process
 * This service saves accepted flashcards to the database and creates generation logs
 */
class FlashcardReviewService {
  // Private static instance for singleton pattern
  private static instance: FlashcardReviewService;

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Empty constructor is required for singleton pattern
  }

  /**
   * Get the singleton instance of FlashcardReviewService
   * @returns The single instance of FlashcardReviewService
   */
  public static getInstance(): FlashcardReviewService {
    if (!FlashcardReviewService.instance) {
      FlashcardReviewService.instance = new FlashcardReviewService();
    }
    return FlashcardReviewService.instance;
  }

  /**
   * Process user review of flashcard proposals
   * Saves accepted flashcards and creates generation log
   *
   * @param supabase Supabase client
   * @param userId User ID
   * @param reviewData User review data containing accepted/rejected flashcards
   * @returns Result of the review process with set ID and counts
   */
  async processFlashcardReview(
    supabase: SupabaseClient,
    userId: string,
    reviewData: ReviewFlashcardSetRequestDTO
  ): Promise<BatchFlashcardActionResponseDTO> {
    const { set_id: tempSetId, accept: acceptedIds, reject: rejectedIds } = reviewData;

    // MOCK implementation for now, since we're focusing on generation endpoint
    // eslint-disable-next-line no-console
    console.log(`[MOCK] Processing review for temp set ${tempSetId}`);
    // eslint-disable-next-line no-console
    console.log(`[MOCK] User ${userId} accepted ${acceptedIds.length} and rejected ${rejectedIds.length} flashcards`);

    // Generate a permanent set ID (in real implementation, this would be from the database)
    const permanentSetId = randomUUID();

    // In a real implementation, we would:
    // 1. Create a new flashcard set in the database
    // 2. Save the source text
    // 3. Save only the accepted flashcards
    // 4. Create a generation log entry

    // Return success response
    return {
      set_id: permanentSetId,
      accepted_count: acceptedIds.length,
      rejected_count: rejectedIds.length,
      success: true,
    };
  }

  /**
   * Implementation for saving flashcards and creating generation log
   * This would be used in a real production environment
   *
   * @param supabase Supabase client
   * @param userId User ID
   * @param reviewData User review data
   */
  async saveReviewedFlashcards(
    supabase: SupabaseClient,
    userId: string,
    reviewData: ReviewFlashcardSetRequestDTO
  ): Promise<BatchFlashcardActionResponseDTO> {
    const { accept: acceptedIds, reject: rejectedIds } = reviewData;

    // In production, this would use a database transaction to:

    // 1. Create the flashcard set
    /*
    const { data: setData, error: setError } = await supabase
      .from("flashcard_sets")
      .insert({
        title: reviewData.title,
        user_id: userId
      })
      .select("id")
      .single();

    if (setError) {
      console.error("Error creating flashcard set:", setError);
      throw new Error("Failed to create flashcard set");
    }

    const setId = setData.id;
    */

    // 2. Save the source text
    /*
    const { error: sourceError } = await supabase
      .from("source_texts")
      .insert({
        set_id: setId,
        content: reviewData.source_text,
        user_id: userId
      });

    if (sourceError) {
      console.error("Error saving source text:", sourceError);
      throw new Error("Failed to save source text");
    }
    */

    // 3. Save accepted flashcards
    /*
    const flashcardsToSave = acceptedIds.map(id => {
      const flashcard = flashcards[id];
      return {
        id: flashcard.id,
        set_id: setId,
        front_content: flashcard.front_content,
        back_content: flashcard.back_content,
        creation_mode: flashcard.creation_mode,
        user_id: userId
      };
    });

    if (flashcardsToSave.length > 0) {
      const { error: cardsError } = await supabase
        .from("flashcards")
        .insert(flashcardsToSave);

      if (cardsError) {
        console.error("Error saving flashcards:", cardsError);
        throw new Error("Failed to save flashcards");
      }
    }
    */

    // 4. Create generation log
    /*
    const { error: logError } = await supabase
      .from("generation_logs")
      .insert({
        user_id: userId,
        set_id: setId,
        set_title: reviewData.title,
        generated_count: acceptedIds.length + rejectedIds.length,
        accepted_count: acceptedIds.length,
        rejected_count: rejectedIds.length
      });

    if (logError) {
      console.error("Error creating generation log:", logError);
      throw new Error("Failed to create generation log");
    }
    */

    // Return mock result for now
    return {
      set_id: randomUUID(),
      accepted_count: acceptedIds.length,
      rejected_count: rejectedIds.length,
      success: true,
    };
  }
}

// Singleton instance for use throughout the application
export const flashcardReviewService = FlashcardReviewService.getInstance();
