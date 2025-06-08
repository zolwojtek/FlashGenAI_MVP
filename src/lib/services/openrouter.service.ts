import type {
  ChatMessage,
  ResponseFormat,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatCompletionChunk,
  OpenRouterError,
} from '../../types';

/**
 * Service for interacting with the OpenRouter.ai API
 * Provides a unified interface to communicate with various LLM models
 */
class OpenRouterService {
  private static instance: OpenRouterService;
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private defaultModel = 'openai/gpt-3.5-turbo';
  private defaultResponseFormat?: ResponseFormat;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      console.error(
        'OpenRouter API key is not defined in environment variables'
      );
    }
  }

  /**
   * Get the singleton instance of OpenRouterService
   * @returns The single instance of OpenRouterService
   */
  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }

  /**
   * Send a chat completion request to OpenRouter API
   * @param messages Array of chat messages (system, user, assistant)
   * @param options Additional options including model, parameters, and response format
   * @returns The model's response
   */
  async chatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const model = options?.model || this.defaultModel;
    const responseFormat =
      options?.responseFormat || this.defaultResponseFormat;

    const requestBody = {
      model,
      messages,
      response_format: responseFormat,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      frequency_penalty: options?.frequencyPenalty,
      presence_penalty: options?.presencePenalty,
      stream: false,
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
      stream: true,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer':
            typeof window !== 'undefined' ? window.location.origin : 'server',
          'X-Title':
            typeof window !== 'undefined' ? document.title : 'FlashGenAI',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
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
          .filter(
            (line) => line.trim() !== '' && line.trim() !== 'data: [DONE]'
          );

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
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request to AI service timed out');
      }
      throw this.handleApiError(error);
    }
  }

  /**
   * Set the default model to use for requests
   * @param modelName The model identifier (e.g., 'openai/gpt-4-turbo')
   */
  setDefaultModel(modelName: string): void {
    this.defaultModel = modelName;
  }

  /**
   * Set the default response format for structured outputs
   * @param format The JSON schema format specification
   */
  setDefaultResponseFormat(format: ResponseFormat): void {
    this.defaultResponseFormat = format;
  }

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
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    // Add referer and title headers if in browser environment
    if (typeof window !== 'undefined') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = document.title;
    }

    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
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
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request to AI service timed out');
      }
      throw error;
    }
  }

  /**
   * Handle and process API errors
   * @param error Error object from API request
   * @returns Standardized error
   */
  private handleApiError(error: unknown): Error {
    console.error('OpenRouter API error:', error);

    // Handle different error types
    if (error instanceof Error) {
      if (error.status === 401 || error.status === 403) {
        return new Error(
          'Authentication failed with AI service. Please check your API key.'
        );
      }

      if (error.status === 429) {
        return new Error('AI service quota exceeded. Please try again later.');
      }

      if (error.status === 400) {
        return new Error(
          `Bad request: ${error.message || 'Invalid request parameters'}`
        );
      }

      if (error.status >= 500) {
        return new Error(
          'AI service is currently unavailable. Please try again later.'
        );
      }
    }

    // Default error
    return new Error(
      error instanceof Error
        ? error.message
        : 'An error occurred with the AI service'
    );
  }

  /**
   * Estimate token count for a message array
   * @param messages Array of chat messages
   * @returns Estimated token count
   */
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

  /**
   * Create a JSON schema response format
   * @param schemaName Name of the schema
   * @param schema JSON schema object
   * @param strict Whether the model must strictly follow the schema
   * @returns ResponseFormat object
   */
  createJsonSchemaFormat(
    schemaName: string,
    schema: Record<string, unknown>,
    strict = true
  ): ResponseFormat {
    return {
      type: 'json_schema',
      json_schema: {
        name: schemaName,
        strict,
        schema,
      },
    };
  }

  /**
   * Validate a response against a schema
   * @param response The response to validate
   * @param schema The schema to validate against
   * @returns Whether the response is valid
   */
  validateJsonResponse(
    response: unknown,
    schema: Record<string, unknown>
  ): boolean {
    // Simple validation logic - in a real implementation, use a JSON schema validator library
    try {
      const parsedResponse =
        typeof response === 'string' ? JSON.parse(response) : response;

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
        for (const [key, propSchema] of Object.entries<Record<string, unknown>>(
          schema.properties as Record<string, Record<string, unknown>>
        )) {
          if (key in parsedResponse) {
            const value = parsedResponse[key];
            const type = propSchema.type;

            if (type === 'string' && typeof value !== 'string') return false;
            if (type === 'number' && typeof value !== 'number') return false;
            if (type === 'boolean' && typeof value !== 'boolean') return false;
            if (type === 'array' && !Array.isArray(value)) return false;
            if (
              type === 'object' &&
              (typeof value !== 'object' || value === null)
            )
              return false;
          }
        }
      }

      return true;
    } catch (e) {
      console.error('Error validating JSON response:', e);
      return false;
    }
  }

  /**
   * Parse and validate API response
   * @param response Raw API response
   * @param schema Optional JSON schema for validation
   * @returns Parsed and validated response
   */
  private parseResponse(
    response: unknown,
    schema?: Record<string, unknown>
  ): Record<string, unknown> {
    try {
      const parsedResponse =
        typeof response === 'string' ? JSON.parse(response) : response;

      // If schema is provided, validate the response
      if (schema && !this.validateJsonResponse(parsedResponse, schema)) {
        console.warn(
          'Response does not match expected schema:',
          parsedResponse
        );
      }

      return parsedResponse;
    } catch (e) {
      console.error('Error parsing response:', e);
      throw new Error('Failed to parse API response');
    }
  }
}

// Export singleton instance
export const openRouterService = OpenRouterService.getInstance();
