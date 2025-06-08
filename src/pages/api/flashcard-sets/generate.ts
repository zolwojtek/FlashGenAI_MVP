/* eslint-disable prettier/prettier */
import type { APIRoute } from "astro";
import { z } from "zod";
import { flashcardGenerationService } from "../../../lib/services/flashcard-generation.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// Disable static generation for this endpoint
export const prerender = false;

// Schema for request validation
const generateFlashcardsSchema = z.object({
  source_text: z.string().min(1).max(10000),
  title: z.string().optional(),
});

/**
 * POST handler for generating a new flashcard set
 *
 * Processes a request to generate flashcards from source text using AI.
 * The endpoint returns flashcard proposals that can be reviewed by the user.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get supabase client from Astro locals
    const supabase = locals.supabase;
    
    // Get user ID from session, fallback to default for development
    let userId = DEFAULT_USER_ID;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user?.id) {
      userId = session.user.id;
    }

    // Parse and validate request body
    const body = await request.json();
    const result = generateFlashcardsSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          message: 'Invalid request', 
          errors: result.error.format() 
        }),
        { status: 400 }
      );
    }

    // Generate flashcards
    const generatedSet = await flashcardGenerationService.generateFlashcards(
      supabase,
      {
        userId,
        sourceText: result.data.source_text,
        title: result.data.title,
      }
    );

    // Return successful response
    return new Response(
      JSON.stringify(generatedSet),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return new Response(
      JSON.stringify({ 
        message: error instanceof Error ? error.message : 'Failed to generate flashcards' 
      }),
      { status: 500 }
    );
  }
};
