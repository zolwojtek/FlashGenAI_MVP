# OpenRouter Service Implementation Plan

## 1. Service Description

The OpenRouter service is a TypeScript class that provides a client interface to interact with the OpenRouter.ai API. This service will enable the application to communicate with various Large Language Models (LLMs) through a unified interface, managing chat sessions, handling API responses, and providing structured data based on predefined schemas.

## 2. Constructor

The service will follow the singleton pattern similar to other services in the project:

```typescript
class OpenRouterService {
  private static instance: OpenRouterService;
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  
  private constructor() {
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      console.error('OpenRouter API key is not defined in environment variables');
    }
  }

  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }
}
```

## 3. Public Methods and Properties

### 3.1 Chat Completion Method

```typescript
/**
 * Send a chat completion request to OpenRouter API
 * @param messages Array of chat messages (system, user, assistant)
 * @param options Additional options including model, parameters, and response format
 * @returns The model's response
 */
async chatCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string;
    responseFormat?: ResponseFormat;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stream?: boolean;
  }
): Promise<ChatCompletionResponse>
```

### 3.2 Stream Chat Completion Method

```typescript
/**
 * Stream a chat completion response from OpenRouter API
 * @param messages Array of chat messages
 * @param options Additional options
 * @param onChunk Callback function for each chunk received
 * @returns Promise that resolves when the stream is complete
 */
async streamChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions,
  onChunk: (chunk: ChatCompletionChunk) => void
): Promise<void>
```

### 3.3 Model Selection Method

```typescript
/**
 * Set the default model to use for requests
 * @param modelName The model identifier (e.g., 'openai/gpt-4-turbo')
 */
setDefaultModel(modelName: string): void
```

### 3.4 Response Format Method

```typescript
/**
 * Set the default response format for structured outputs
 * @param format The JSON schema format specification
 */
setDefaultResponseFormat(format: ResponseFormat): void
```

## 4. Private Methods and Properties

### 4.1 API Request Method

```typescript
/**
 * Make a request to the OpenRouter API
 * @param endpoint API endpoint
 * @param method HTTP method
 * @param body Request body
 * @returns API response
 */
private async makeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST',
  body?: any
): Promise<T>
```

### 4.2 Error Handling Method

```typescript
/**
 * Handle and process API errors
 * @param error Error object from API request
 * @returns Standardized error object
 */
private handleApiError(error: any): OpenRouterError
```

### 4.3 Response Parsing Method

```typescript
/**
 * Parse and validate API response
 * @param response Raw API response
 * @param schema Optional JSON schema for validation
 * @returns Parsed and validated response
 */
private parseResponse(response: any, schema?: JSONSchema): any
```

### 4.4 Token Counting Method

```typescript
/**
 * Estimate token count for a message array
 * @param messages Array of chat messages
 * @returns Estimated token count
 */
private estimateTokenCount(messages: ChatMessage[]): number
```

## 5. Error Handling

The service will implement comprehensive error handling for various scenarios:

1. **Connection Errors**: Handle network failures when connecting to OpenRouter API
   ```typescript
   try {
     const response = await this.makeRequest('/chat/completions', 'POST', requestBody);
     return response;
   } catch (error) {
     if (error instanceof NetworkError) {
       // Log error and return friendly message
       console.error('Network error connecting to OpenRouter:', error);
       throw new Error('Unable to connect to AI service. Please try again later.');
     }
     throw this.handleApiError(error);
   }
   ```

2. **Authentication Errors**: Handle invalid API keys
   ```typescript
   if (error.status === 401 || error.status === 403) {
     console.error('Authentication error with OpenRouter API:', error);
     throw new Error('Authentication failed with AI service. Please check your API key.');
   }
   ```

3. **Rate Limiting Errors**: Handle quota and usage limits
   ```typescript
   if (error.status === 429) {
     console.error('Rate limit exceeded with OpenRouter API:', error);
     throw new Error('AI service quota exceeded. Please try again later.');
   }
   ```

4. **Context Length Errors**: Handle token limits for models
   ```typescript
   const estimatedTokens = this.estimateTokenCount(messages);
   if (estimatedTokens > MAX_TOKEN_LIMIT) {
     throw new Error(`Input exceeds maximum token limit of ${MAX_TOKEN_LIMIT}.`);
   }
   ```

5. **Timeout Errors**: Handle requests that take too long
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
   
   try {
     const response = await fetch(url, {
       signal: controller.signal,
       // other fetch options
     });
     clearTimeout(timeoutId);
     return response;
   } catch (error) {
     if (error.name === 'AbortError') {
       throw new Error('Request to AI service timed out. Please try again.');
     }
     throw error;
   }
   ```

## 6. Security Considerations

1. **API Key Protection**:
   - Store API keys in environment variables
   - Never expose API keys in client-side code
   - Use server-side API endpoints to proxy requests to OpenRouter

2. **Input Validation**:
   - Sanitize all user inputs before sending to the API
   - Implement input length limits to prevent abuse
   - Validate inputs against expected formats

3. **Response Validation**:
   - Validate API responses against expected schemas
   - Handle malformed responses gracefully
   - Never directly inject AI responses into HTML without sanitization

4. **Error Message Security**:
   - Ensure error messages don't leak sensitive information
   - Log detailed errors server-side but return generic messages to clients
   - Implement proper exception handling to prevent information leakage

## 7. Implementation Plan

### Step 1: Create Type Definitions

Create or update the `src/types.ts` file with necessary types:

```typescript
// OpenRouter API types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: any;
  };
}

export interface ChatCompletionOptions {
  model?: string;
  responseFormat?: ResponseFormat;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionChunk {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    delta: Partial<ChatMessage>;
    finish_reason: string | null;
  }[];
}

export interface OpenRouterError {
  code: string;
  message: string;
  details?: any;
}
```

### Step 2: Create OpenRouter Service

Create a new file `src/lib/services/openrouter.service.ts`:

```typescript
import type {
  ChatMessage,
  ResponseFormat,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatCompletionChunk,
  OpenRouterError
} from '../../types';

class OpenRouterService {
  private static instance: OpenRouterService;
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private defaultModel: string = 'openai/gpt-3.5-turbo';
  private defaultResponseFormat?: ResponseFormat;
  
  private constructor() {
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      console.error('OpenRouter API key is not defined in environment variables');
    }
  }

  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }
  
  // Implement the public and private methods as defined in sections 3 and 4
}

// Export singleton instance
export const openRouterService = OpenRouterService.getInstance();
```

### Step 3: Implement Core Methods

Add the implementation for the core methods:

```typescript
async chatCompletion(
  messages: ChatMessage[],
  options?: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  if (!this.apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }
  
  const model = options?.model || this.defaultModel;
  const responseFormat = options?.responseFormat || this.defaultResponseFormat;
  
  const requestBody = {
    model,
    messages,
    response_format: responseFormat,
    temperature: options?.temperature,
    max_tokens: options?.maxTokens,
    top_p: options?.topP,
    frequency_penalty: options?.frequencyPenalty,
    presence_penalty: options?.presencePenalty,
    stream: false
  };
  
  try {
    const response = await this.makeRequest<ChatCompletionResponse>(
      '/chat/completions',
      'POST',
      requestBody
    );
    return response;
  } catch (error) {
    throw this.handleApiError(error);
  }
}

async streamChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions,
  onChunk: (chunk: ChatCompletionChunk) => void
): Promise<void> {
  if (!this.apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }
  
  const model = options.model || this.defaultModel;
  const responseFormat = options.responseFormat || this.defaultResponseFormat;
  
  const requestBody = {
    model,
    messages,
    response_format: responseFormat,
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    top_p: options.topP,
    frequency_penalty: options.frequencyPenalty,
    presence_penalty: options.presencePenalty,
    stream: true
  };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
  
  try {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': document.title
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw this.handleApiError(errorData);
    }
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk
        .split('\n')
        .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6);
            const data = JSON.parse(jsonStr) as ChatCompletionChunk;
            onChunk(data);
          } catch (e) {
            console.error('Error parsing streaming response:', e);
          }
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request to AI service timed out');
    }
    throw this.handleApiError(error);
  }
}

setDefaultModel(modelName: string): void {
  this.defaultModel = modelName;
}

setDefaultResponseFormat(format: ResponseFormat): void {
  this.defaultResponseFormat = format;
}

private async makeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST',
  body?: any
): Promise<T> {
  const url = `${this.baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`,
  };
  
  // Add referer and title headers if in browser environment
  if (typeof window !== 'undefined') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = document.title;
  }
  
  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  options.signal = controller.signal;
  
  try {
    const response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request to AI service timed out');
    }
    throw error;
  }
}

private handleApiError(error: any): Error {
  console.error('OpenRouter API error:', error);
  
  // Handle different error types
  if (error.status === 401 || error.status === 403) {
    return new Error('Authentication failed with AI service. Please check your API key.');
  }
  
  if (error.status === 429) {
    return new Error('AI service quota exceeded. Please try again later.');
  }
  
  if (error.status === 400) {
    return new Error(`Bad request: ${error.message || 'Invalid request parameters'}`);
  }
  
  if (error.status >= 500) {
    return new Error('AI service is currently unavailable. Please try again later.');
  }
  
  // Default error
  return new Error(error.message || 'An error occurred with the AI service');
}

private estimateTokenCount(messages: ChatMessage[]): number {
  // Simple estimation: ~4 chars per token
  let totalChars = 0;
  
  for (const msg of messages) {
    totalChars += msg.content.length;
    // Add overhead for message role and structure
    totalChars += 10;
  }
  
  return Math.ceil(totalChars / 4);
}
```

### Step 4: Create Helper Methods for Common Response Formats

Add helper methods for working with structured responses:

```typescript
/**
 * Create a JSON schema response format
 * @param schemaName Name of the schema
 * @param schema JSON schema object
 * @param strict Whether the model must strictly follow the schema
 * @returns ResponseFormat object
 */
createJsonSchemaFormat(
  schemaName: string,
  schema: any,
  strict: boolean = true
): ResponseFormat {
  return {
    type: 'json_schema',
    json_schema: {
      name: schemaName,
      strict,
      schema
    }
  };
}

/**
 * Validate a response against a schema
 * @param response The response to validate
 * @param schema The schema to validate against
 * @returns Whether the response is valid
 */
validateJsonResponse(response: any, schema: any): boolean {
  // Simple validation logic - in a real implementation, use a JSON schema validator library
  try {
    const parsedResponse = typeof response === 'string' 
      ? JSON.parse(response) 
      : response;
    
    // Check required properties
    if (schema.required) {
      for (const prop of schema.required) {
        if (!(prop in parsedResponse)) {
          return false;
        }
      }
    }
    
    // Check property types
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in parsedResponse) {
          const value = parsedResponse[key];
          const type = propSchema.type;
          
          if (type === 'string' && typeof value !== 'string') return false;
          if (type === 'number' && typeof value !== 'number') return false;
          if (type === 'boolean' && typeof value !== 'boolean') return false;
          if (type === 'array' && !Array.isArray(value)) return false;
          if (type === 'object' && (typeof value !== 'object' || value === null)) return false;
        }
      }
    }
    
    return true;
  } catch (e) {
    console.error('Error validating JSON response:', e);
    return false;
  }
}
```

### Step 5: Create API Environment Variables

Update the Astro environment type definitions in `src/env.d.ts`:

```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string; // Add this line
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Step 6: Create Server-Side API Endpoint

Create `src/pages/api/openrouter.ts` to proxy requests to OpenRouter (for security):

```typescript
import type { APIRoute } from 'astro';
import { openRouterService } from '../../lib/services/openrouter.service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages, options } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array is required' }),
        { status: 400 }
      );
    }
    
    const response = await openRouterService.chatCompletion(messages, options);
    
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in OpenRouter API endpoint:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { status: 500 }
    );
  }
}
```

### Step 7: Create a Streaming API Endpoint

Create `src/pages/api/openrouter-stream.ts` for streaming responses:

```typescript
import type { APIRoute } from 'astro';
import { openRouterService } from '../../lib/services/openrouter.service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages, options } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array is required' }),
        { status: 400 }
      );
    }
    
    // Create a TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();
    
    // Start streaming in the background
    openRouterService.streamChatCompletion(
      messages,
      { ...options, stream: true },
      (chunk) => {
        const data = `data: ${JSON.stringify(chunk)}\n\n`;
        writer.write(encoder.encode(data));
      }
    ).then(() => {
      writer.write(encoder.encode('data: [DONE]\n\n'));
      writer.close();
    }).catch((error) => {
      console.error('Streaming error:', error);
      const errorMsg = `data: ${JSON.stringify({ error: error.message })}\n\n`;
      writer.write(encoder.encode(errorMsg));
      writer.close();
    });
    
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in OpenRouter streaming API endpoint:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { status: 500 }
    );
  }
}
```

### Step 8: Usage Examples

Here are examples of how to use the OpenRouter service in your application:

#### Basic Chat Completion

```typescript
import { openRouterService } from '../lib/services/openrouter.service';

// Simple chat completion
const messages = [
  { role: 'system', content: 'You are a helpful AI assistant.' },
  { role: 'user', content: 'What is the capital of France?' }
];

try {
  const response = await openRouterService.chatCompletion(messages);
  console.log(response.choices[0].message.content);
} catch (error) {
  console.error('Error:', error);
}
```

#### Structured JSON Response

```typescript
// Get a structured JSON response
const productSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    price: { type: 'number' },
    description: { type: 'string' }
  },
  required: ['name', 'price']
};

const responseFormat = openRouterService.createJsonSchemaFormat(
  'product',
  productSchema,
  true
);

const messages = [
  { role: 'system', content: 'You are a product information assistant.' },
  { role: 'user', content: 'Create a product for a smartphone.' }
];

try {
  const response = await openRouterService.chatCompletion(
    messages,
    { responseFormat }
  );
  
  const productData = JSON.parse(response.choices[0].message.content);
  console.log('Product:', productData);
} catch (error) {
  console.error('Error:', error);
}
```

#### Streaming Response

```typescript
// Stream a response
const messages = [
  { role: 'system', content: 'You are a storytelling assistant.' },
  { role: 'user', content: 'Tell me a short story about space exploration.' }
];

let story = '';

try {
  await openRouterService.streamChatCompletion(
    messages,
    { model: 'anthropic/claude-3-sonnet' },
    (chunk) => {
      if (chunk.choices[0].delta.content) {
        story += chunk.choices[0].delta.content;
        // Update UI with new content
        updateStoryDisplay(story);
      }
    }
  );
  
  console.log('Complete story:', story);
} catch (error) {
  console.error('Streaming error:', error);
}
```

## Summary

This implementation plan provides a comprehensive approach to integrating the OpenRouter.ai API into your Astro + React application. The service follows the singleton pattern used by other services in your project and provides a clean, type-safe interface for communicating with various LLM models.

Key features include:
- Structured API request and response handling
- Support for streaming responses
- JSON schema validation for structured outputs
- Comprehensive error handling
- Security best practices
- API endpoint proxying for client-side usage

By following this plan, you'll have a robust and flexible OpenRouter service that can be used throughout your application for AI-powered features. 