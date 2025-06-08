/* eslint-disable prettier/prettier */
import { randomUUID } from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { 
  GenerateFlashcardsCommand, 
  FlashcardGeneratedDTO, 
  GenerateFlashcardSetResponseDTO,
  ChatMessage,
  CreationMode
} from "../../types";
import { openRouterService } from "./openrouter.service";

/**
 * Service for handling flashcard generation
 * This service generates flashcard proposals using OpenRouter API with Gemini Flash model
 */
class FlashcardGenerationService {
  // Private static instance for singleton pattern
  private static instance: FlashcardGenerationService;
  private modelName = "google/gemini-flash";

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Set default model to Gemini Flash
    openRouterService.setDefaultModel(this.modelName);
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
   * Generate a title suggestion for the flashcard set based on source text
   * @param sourceText The text to base the title on
   * @returns A suggested title
   */
  async suggestTitle(sourceText: string): Promise<string> {
    const messages: ChatMessage[] = [
      { 
        role: 'system', 
        content: 'You are a helpful AI assistant that creates concise, descriptive titles for educational content. Create a short, relevant title (maximum 50 characters) based on the provided text content. The title should capture the main subject matter.' 
      },
      { 
        role: 'user', 
        content: `Create a title for flashcards based on this text: ${sourceText.substring(0, 1000)}${sourceText.length > 1000 ? '...' : ''}` 
      }
    ];

    try {
      const response = await openRouterService.chatCompletion(messages, {
        model: this.modelName,
        temperature: 0.3,
        maxTokens: 30
      });

      // Extract the generated title and trim any extra quotes or whitespace
      let title = response.choices[0].message.content.trim();
      if (title.startsWith('"') && title.endsWith('"')) {
        title = title.slice(1, -1).trim();
      }
      
      // Ensure title is not too long
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }

      return title;
    } catch (error) {
      console.error('Error generating title:', error);
      return `Flashcards: ${sourceText.substring(0, 30)}...`;
    }
  }

  /**
   * Generate flashcard proposals from source text using OpenRouter API
   * @param sourceText The text to generate flashcards from
   * @returns Array of generated flashcards
   */
  async generateFlashcardsWithAI(sourceText: string): Promise<FlashcardGeneratedDTO[]> {
    // Create a JSON schema for flashcard format
    const flashcardSchema = {
      type: 'object',
      properties: {
        flashcards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              front_content: { type: 'string' },
              back_content: { type: 'string' }
            },
            required: ['front_content', 'back_content']
          }
        }
      },
      required: ['flashcards']
    };

    // Create response format using the schema
    const responseFormat = openRouterService.createJsonSchemaFormat(
      'flashcards',
      flashcardSchema,
      true
    );

    // Prepare prompt messages
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert educator specializing in creating effective flashcards for learning. 
        Create 5-8 high-quality flashcards based on the provided text. 
        For each flashcard:
        - The front should contain a clear question, prompt, or key term
        - The back should contain a concise answer or explanation
        - Cover the most important concepts from the text
        - Create a mix of definition cards, fill-in-the-blank, and contextual questions
        - Keep both sides concise and focused on a single concept
        - Ensure the cards test understanding, not just memorization`
      },
      {
        role: 'user',
        content: `Generate flashcards based on the following text: ${sourceText}`
      }
    ];

    try {
      const response = await openRouterService.chatCompletion(messages, {
        model: this.modelName,
        responseFormat,
        temperature: 0.3
      });

      // Parse the response
      const data = JSON.parse(response.choices[0].message.content);
      
      // Convert to FlashcardGeneratedDTO format
      return data.flashcards.map((card: any) => ({
        id: randomUUID(),
        front_content: card.front_content,
        back_content: card.back_content,
        creation_mode: CreationMode.AI
      }));
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw new Error('Failed to generate flashcards');
    }
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

    // 1. Check user generation limits
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
      setTitle = await this.suggestTitle(sourceText);
    }

    // 3. Generate flashcards as proposals (not saving to database)
    const generatedFlashcards = await this.generateFlashcardsWithAI(sourceText);

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
