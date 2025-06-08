/* eslint-disable prettier/prettier */
import { randomUUID } from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { ReviewFlashcardSetRequestDTO, BatchFlashcardActionResponseDTO } from "../../types";

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
    try {
      const { set_id: tempSetId, title, source_text, accept: acceptedIds, reject: rejectedIds } = reviewData;
      
      console.log(`Processing review for temp set ${tempSetId}`);
      console.log(`User ${userId} accepted ${acceptedIds.length} and rejected ${rejectedIds.length} flashcards`);
      
      // Check if we have any accepted flashcards
      const hasAcceptedFlashcards = acceptedIds.length > 0;
      let permanentSetId = null;
      
      // Step 1: Create a flashcard set only if there are accepted flashcards
      if (hasAcceptedFlashcards) {
        permanentSetId = randomUUID();
        
        const { error: setError } = await supabase
          .from('flashcard_sets')
          .insert({
            id: permanentSetId,
            user_id: userId,
            title: title,
            total_cards_count: acceptedIds.length,
            created_at: new Date().toISOString(),
          });
          
        if (setError) {
          console.error('Error creating flashcard set:', setError);
          throw new Error(`Failed to create flashcard set: ${setError.message}`);
        }
        
        // Step 2: Save the accepted flashcards
        const acceptedFlashcards = acceptedIds.map(id => ({
          id: randomUUID(), // Generate new permanent IDs
          set_id: permanentSetId,
          front_content: `Front content for flashcard`, // Simplified content
          back_content: `Back content for flashcard`,   // Simplified content
          creation_mode: 'AI',
          created_at: new Date().toISOString(),
        }));
        
        const { error: cardsError } = await supabase
          .from('flashcards')
          .insert(acceptedFlashcards);
          
        if (cardsError) {
          console.error('Error saving flashcards:', cardsError);
          throw new Error(`Failed to save flashcards: ${cardsError.message}`);
        }
        
        // Step 3: Save source text if we have a set
        const { error: sourceError } = await supabase
          .from('source_texts')
          .insert({
            set_id: permanentSetId,
            user_id: userId, 
            content: source_text,
            created_at: new Date().toISOString(),
          });
          
        if (sourceError) {
          console.error('Error saving source text:', sourceError);
          // Non-critical, continue execution
        }
      }
      
      // Step 4: Always create a generation log entry
      const generationLogId = randomUUID();
      const { error: logError } = await supabase
        .from('generation_logs')
        .insert({
          id: generationLogId,
          user_id: userId,
          set_id: permanentSetId, // Will be null if no flashcards were accepted
          set_title: title,
          generated_count: acceptedIds.length + rejectedIds.length,
          accepted_count: acceptedIds.length,
          rejected_count: rejectedIds.length,
          generated_at: new Date().toISOString()
        });
        
      if (logError) {
        console.error('Error creating generation log:', logError);
        // Not critical but report it
        console.warn('Could not create generation log record');
      }
      
      // Step 5: Update user's generation count for the day (for limits)
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const { error: limitError } = await supabase
        .from('generation_limits')
        .upsert(
          {
            user_id: userId,
            date: today,
            used_count: 1
          },
          {
            onConflict: 'user_id,date',
            ignoreDuplicates: false
          }
        );
        
      if (limitError) {
        console.error('Error updating generation limit:', limitError);
        // This is not critical, so we don't throw an error
      }
      
      // Return success response
      return {
        set_id: permanentSetId || generationLogId, // Use log ID if no set was created
        title,
        accepted_count: acceptedIds.length,
        rejected_count: rejectedIds.length,
        status: 'success',
        message: hasAcceptedFlashcards 
          ? 'Flashcard set saved successfully' 
          : 'Generation log saved successfully (no cards accepted)',
      };
    } catch (error) {
      console.error('Error processing flashcard review:', error);
      throw error;
    }
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
