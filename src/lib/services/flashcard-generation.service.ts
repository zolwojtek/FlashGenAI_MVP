/* eslint-disable prettier/prettier */
import { randomUUID } from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerateFlashcardsCommand, FlashcardGeneratedDTO, GenerateFlashcardSetResponseDTO } from "../../types";
import { aiService } from "./ai.service";

/**
 * Service for handling flashcard generation
 * This service only generates flashcard proposals and does not save them to the database
 */
class FlashcardGenerationService {
  // Private static instance for singleton pattern
  private static instance: FlashcardGenerationService;

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Empty constructor is required for singleton pattern
  }

  /**
   * Get the singleton instance of FlashcardGenerationService
   * @returns The single instance of FlashcardGenerationService
   */
  public static getInstance(): FlashcardGenerationService {
    if (!FlashcardGenerationService.instance) {
      FlashcardGenerationService.instance = new FlashcardGenerationService();
    }
    return FlashcardGenerationService.instance;
  }

  /**
   * Check if user has reached their daily generation limit
   * @param supabase Supabase client
   * @param userId User ID to check limits for
   * @returns Object containing limit information
   */
  async checkUserGenerationLimit(
    supabase: SupabaseClient,
    userId: string
  ): Promise<{
    hasReachedLimit: boolean;
    usedCount: number;
    maxDailyLimit: number;
    resetAt: string;
  }> {
    // MOCK implementation: Always return that user hasn't reached the limit
    console.log(`[MOCK] Checking generation limit for user ${userId}`);

    // Return mock data indicating user has not reached their limit
    return {
      hasReachedLimit: false, // Always return false to bypass limit check
      usedCount: 0, // Mock used count
      maxDailyLimit: 5, // Mock daily limit
      resetAt: new Date(Date.now() + 86400000).toISOString(), // Reset time set to tomorrow
    };

    // Original implementation commented out
    /*
    // Query user generation limits
    const { data: limitResult, error: limitError } = await supabase.rpc("check_generation_limit", {
      user_id_param: userId,
    });

    if (limitError) {
      console.error("Error checking generation limits:", limitError);
      throw new Error("Failed to check generation limits");
    }

    // Parse the result
    return {
      hasReachedLimit: limitResult.has_reached_limit || false,
      usedCount: limitResult.used_count || 0,
      maxDailyLimit: limitResult.max_daily_limit || 5,
      resetAt: limitResult.reset_at || new Date(Date.now() + 86400000).toISOString(),
    };
    */
  }

  /**
   * Generate flashcard proposals from source text (without saving to database)
   * @param supabase Supabase client
   * @param command Command containing generation parameters
   * @returns Generated flashcard set proposals for user review
   */
  async generateFlashcards(
    supabase: SupabaseClient,
    command: GenerateFlashcardsCommand
  ): Promise<GenerateFlashcardSetResponseDTO> {
    const { userId, sourceText, title } = command;

    // 1. Check user generation limits (mock will always return not reached)
    const limitCheck = await this.checkUserGenerationLimit(supabase, userId);
    if (limitCheck.hasReachedLimit) {
      throw new Error(
        `Daily generation limit reached (${limitCheck.usedCount}/${limitCheck.maxDailyLimit}). Try again after ${new Date(
          limitCheck.resetAt
        ).toLocaleString()}.`
      );
    }

    // 2. Generate title if not provided
    let setTitle = title;
    if (!setTitle) {
      setTitle = await aiService.suggestTitle(sourceText);
    }

    // 3. Generate flashcards as proposals (not saving to database)
    const generatedFlashcards: FlashcardGeneratedDTO[] = await aiService.generateFlashcards(sourceText);

    // 4. Increment user's generation count - BYPASSED IN MOCK MODE
    // No need to call increment_generation_used in mock mode
    console.log(`[MOCK] Incrementing generation count for user ${userId} (bypassed)`);

    // Original implementation commented out
    /*
    const { error: incrementError } = await supabase.rpc("increment_generation_used", { user_id_param: userId });

    if (incrementError) {
      console.error("Error incrementing generation count:", incrementError);
      throw new Error("Failed to update generation count");
    }
    */

    // 5. Return response with proposals
    // Generate a temporary set ID that will be used later when saving accepted cards
    const tempSetId = randomUUID();

    return {
      set_id: tempSetId,
      title: setTitle,
      flashcards: generatedFlashcards,
      created_at: new Date().toISOString(),
      total_cards_count: generatedFlashcards.length,
    };
  }
}

// Singleton instance for use throughout the application
export const flashcardGenerationService = FlashcardGenerationService.getInstance();
