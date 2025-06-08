import { openRouterService } from '../lib/services/openrouter.service';
import type { ChatMessage } from '../types';

/**
 * Examples of using the OpenRouter service
 * These examples demonstrate how to use the service in different scenarios
 */

// Example 1: Basic Chat Completion
async function basicChatExample(): Promise<void> {
  // Define messages for the chat
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content: 'What is the capital of France?' },
  ];

  try {
    // Send the chat completion request
    const response = await openRouterService.chatCompletion(messages);

    // Log the assistant's response
    console.log('Assistant:', response.choices[0].message.content);

    // You can also access metadata about the response
    console.log('Model used:', response.model);
    console.log('Tokens used:', response.usage.total_tokens);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 2: Using a specific model with parameters
async function advancedChatExample(): Promise<void> {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a creative storytelling assistant.' },
    { role: 'user', content: 'Tell me a short story about a space explorer.' },
  ];

  try {
    const response = await openRouterService.chatCompletion(messages, {
      model: 'anthropic/claude-3-sonnet', // Specify the model to use
      temperature: 0.7, // Control randomness (0.0 to 1.0)
      maxTokens: 500, // Limit response length
      topP: 0.9, // Control diversity
    });

    console.log('Story:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 3: Structured JSON Response
async function structuredResponseExample(): Promise<void> {
  // Define a JSON schema for product information
  const productSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      price: { type: 'number' },
      description: { type: 'string' },
      features: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['name', 'price', 'description'],
  };

  // Create a response format using the schema
  const responseFormat = openRouterService.createJsonSchemaFormat(
    'product',
    productSchema,
    true // Strict mode ensures the response follows the schema
  );

  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a product information assistant.' },
    { role: 'user', content: 'Create a product description for a smartphone.' },
  ];

  try {
    const response = await openRouterService.chatCompletion(messages, {
      responseFormat,
    });

    // Parse the JSON response
    const productData = JSON.parse(response.choices[0].message.content);

    // Now you have a structured object
    console.log('Product Name:', productData.name);
    console.log('Price:', productData.price);
    console.log('Description:', productData.description);

    if (productData.features) {
      console.log('Features:');
      productData.features.forEach((feature: string, index: number) => {
        console.log(`  ${index + 1}. ${feature}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 4: Streaming Response
async function streamingResponseExample(): Promise<void> {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content: 'Explain quantum computing in simple terms.' },
  ];

  let fullResponse = '';

  try {
    // Define an update function for the UI
    const updateUI = (text: string) => {
      // In a real app, this would update a UI element
      console.log('Received chunk:', text);
    };

    await openRouterService.streamChatCompletion(
      messages,
      { model: 'openai/gpt-4' },
      (chunk) => {
        // Process each chunk as it arrives
        if (chunk.choices[0].delta.content) {
          const content = chunk.choices[0].delta.content;
          fullResponse += content;

          // Update the UI with the new content
          updateUI(content);
        }
      }
    );

    console.log('Complete response:', fullResponse);
  } catch (error) {
    console.error('Streaming error:', error);
  }
}

// Example 5: Using the API endpoint (client-side)
async function apiEndpointExample(): Promise<void> {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content: 'What are the benefits of exercise?' },
  ];

  try {
    // In a client-side context, use the API endpoint instead of direct service call
    const response = await fetch('/api/openrouter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        options: {
          model: 'openai/gpt-3.5-turbo',
          temperature: 0.5,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'An error occurred');
    }

    const data = await response.json();
    console.log('Response:', data.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 6: Streaming API endpoint (client-side)
async function streamingApiExample(): Promise<void> {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content: 'Write a short poem about nature.' },
  ];

  try {
    // Use EventSource for server-sent events
    const eventSource = new EventSource('/api/openrouter-stream', {
      withCredentials: true,
    });

    let fullResponse = '';

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        eventSource.close();
        console.log('Complete response:', fullResponse);
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.choices[0].delta.content) {
          const content = data.choices[0].delta.content;
          fullResponse += content;
          console.log('Received chunk:', content);
        }
      } catch (e) {
        console.error('Error parsing event data:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    // Send the initial request
    fetch('/api/openrouter-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        options: { model: 'anthropic/claude-3-haiku' },
      }),
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Export examples
export {
  basicChatExample,
  advancedChatExample,
  structuredResponseExample,
  streamingResponseExample,
  apiEndpointExample,
  streamingApiExample,
};
