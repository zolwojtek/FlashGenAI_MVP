import type { APIRoute } from 'astro';
import { openRouterService } from '../../lib/services/openrouter.service';

/**
 * API endpoint for OpenRouter service
 * Acts as a proxy to protect API key and standardize requests
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages, options } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request: messages array is required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await openRouterService.chatCompletion(messages, options);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in OpenRouter API endpoint:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
