import type { APIRoute } from "astro";
import { generationLogService } from "../../../lib/services/generation-log.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// Disable static generation for this endpoint
export const prerender = false;

/**
 * GET handler for retrieving user's generation logs
 *
 * Returns paginated list of flashcard generation activities
 */
export const GET: APIRoute = async ({ request, locals }) => {
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

    // Parse query parameters for pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          message: "Page must be a positive integer",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 50) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          message: "Limit must be between 1 and 50",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch generation logs
    const logs = await generationLogService.getUserGenerationLogs(supabase, userId, page, limit);

    // Return success response
    return new Response(JSON.stringify(logs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching generation logs:", error);

    // Handle errors
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
