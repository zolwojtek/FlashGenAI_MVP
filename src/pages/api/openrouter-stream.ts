import type { APIRoute } from 'astro';
import { openRouterService } from '../../lib/services/openrouter.service';

/**
 * API endpoint for streaming OpenRouter responses
 * Uses Server-Sent Events (SSE) to stream responses back to the client
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

    // Create a TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start streaming in the background
    openRouterService
      .streamChatCompletion(messages, { ...options, stream: true }, (chunk) => {
        const data = `data: ${JSON.stringify(chunk)}\n\n`;
        writer.write(encoder.encode(data));
      })
      .then(() => {
        writer.write(encoder.encode('data: [DONE]\n\n'));
        writer.close();
      })
      .catch((error) => {
        console.error('Streaming error:', error);
        const errorMsg = `data: ${JSON.stringify({
          error:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        })}\n\n`;
        writer.write(encoder.encode(errorMsg));
        writer.close();
      });

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in OpenRouter streaming API endpoint:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
