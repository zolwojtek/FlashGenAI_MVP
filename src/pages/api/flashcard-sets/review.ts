/* eslint-disable prettier/prettier */
import type { APIRoute } from "astro";
import { batchFlashcardActionSchema } from "../../../schemas/flashcard-actions.schema";
import { flashcardReviewService } from "../../../lib/services/flashcard-review.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import type { ReviewFlashcardSetRequestDTO } from "../../../types";

// Disable static generation for this endpoint
export const prerender = false;

/**
 * POST handler for processing user review of generated flashcards
 *
 * This is the second step in the flashcard generation flow:
 * 1. User generates flashcards using the /generate endpoint
 * 2. User reviews the flashcards and decides which ones to keep
 * 3. This endpoint processes the user's decisions and saves accepted flashcards
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get supabase client from Astro locals
    const supabase = locals.supabase;

    // Get user ID from session, fallback to default for development
    let userId = DEFAULT_USER_ID;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      userId = session.user.id;
    }

    // Parse and validate request body
    const requestBody = await request.json();
    const validationResult = batchFlashcardActionSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract validated data
    const reviewData = validationResult.data;

    // Ensure there are accepted flashcards (at least one required)
    if (reviewData.accept.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          message: "Musisz zaakceptować co najmniej jedną fiszkę",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Process review and save accepted flashcards
    const result = await flashcardReviewService.processFlashcardReview(supabase, userId, reviewData);

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing flashcard review:", error);

    // Handle other errors
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
