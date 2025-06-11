import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';
import { OPENAI_API_KEY } from '$env/static/private';
import { dev } from '$app/environment';
import type { ChatMessage } from '../validation/chat.js';
import {
  RateLimitError,
  QuotaExceededError,
  AuthenticationError,
  ServiceError
} from '../errors/index.js';

const openai = createOpenAI({
  apiKey: OPENAI_API_KEY
});

export class ChatService {
  private static isApiKeyTested = false;
  private static apiKeyTestPromise: Promise<void> | null = null;

  constructor() {
    // Initialize API key testing on first instantiation
    if (!ChatService.isApiKeyTested && !ChatService.apiKeyTestPromise) {
      ChatService.apiKeyTestPromise = this.initializeAndTestApiKey();
    }
  }

  private async initializeAndTestApiKey(): Promise<void> {
    try {
      this.validateApiKey();
      await this.testApiKey();
      ChatService.isApiKeyTested = true;
      console.log('✅ API key validation completed successfully');
    } catch (error) {
      ChatService.apiKeyTestPromise = null; // Reset so we can retry later
      throw error;
    }
  }

  private async ensureApiKeyTested(): Promise<void> {
    if (ChatService.isApiKeyTested) {
      return; // Already tested and valid
    }

    if (ChatService.apiKeyTestPromise) {
      await ChatService.apiKeyTestPromise; // Wait for ongoing test
      return;
    }

    // Start a new test
    ChatService.apiKeyTestPromise = this.initializeAndTestApiKey();
    await ChatService.apiKeyTestPromise;
  }
  private validateApiKey(): void {
    console.log('Validating API key...');

    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured in environment variables');
      throw new ServiceError('Service configuration error. Please try again later.', 500);
    }

    console.log(
      `API key present: ${OPENAI_API_KEY.length} characters, starts with: ${OPENAI_API_KEY.substring(0, 4)}...`
    );

    // Basic API key format validation
    if (!OPENAI_API_KEY.startsWith('sk-')) {
      console.error('Invalid OpenAI API key format detected - does not start with sk-');
      throw new AuthenticationError('Service authentication error. Please try again later.');
    }

    // Check for obviously invalid keys (too short, contains placeholders, etc.)
    if (
      OPENAI_API_KEY.length < 20 ||
      OPENAI_API_KEY.includes('your_') ||
      OPENAI_API_KEY.includes('xxx') ||
      OPENAI_API_KEY.includes('...')
    ) {
      console.error('OpenAI API key appears to be invalid or placeholder');
      throw new AuthenticationError('Service authentication error. Please try again later.');
    }

    console.log('API key format validation passed');
  }

  // Test the API key by making a small request (called only once during initialization)
  private async testApiKey(): Promise<void> {
    console.log('🔍 Testing API key with minimal request...');

    try {
      const testResult = await generateText({
        model: openai('gpt-4o'),
        prompt: 'Say "test"',
        maxTokens: 5
      });

      console.log('✅ API key test successful:', testResult.text);
    } catch (error) {
      console.error('❌ API key test failed:', error);
      this.handleAiError(error);
    }
  }
  private handleAiError(error: unknown): never {
    const errorObj = error as {
      message?: string;
      code?: string | number;
      status?: string | number;
      statusCode?: string | number;
      name?: string;
      responseBody?: string | object;
      data?: { error?: { code?: string; type?: string; message?: string; param?: string } };
      url?: string;
      isRetryable?: boolean;
      responseHeaders?: Record<string, string>;
      stack?: string;
    };

    const message = errorObj?.message?.toLowerCase() || '';
    const rawErrorCode = errorObj?.code || errorObj?.status || errorObj?.statusCode;
    // Normalize error code to number for consistent comparison
    const errorCode = rawErrorCode ? Number(rawErrorCode) : undefined;

    // Extract clean error information for developers
    console.error('🚨 ============ AI SERVICE ERROR ============ 🚨');
    console.error('ERROR SUMMARY:');
    console.error('  Type:', errorObj?.name || 'Unknown');
    console.error('  Status Code:', rawErrorCode, '(normalized:', errorCode, ')');
    console.error('  Message:', errorObj?.message);

    // Extract and display responseBody error details if available
    if (errorObj?.responseBody) {
      console.error('📄 RESPONSE BODY ERROR DETAILS:');
      try {
        const responseData =
          typeof errorObj.responseBody === 'string'
            ? JSON.parse(errorObj.responseBody)
            : errorObj.responseBody;

        if (responseData?.error) {
          console.error('  OpenAI Error Code:', responseData.error.code);
          console.error('  OpenAI Error Type:', responseData.error.type);
          console.error('  OpenAI Error Message:', responseData.error.message);
          console.error('  OpenAI Error Param:', responseData.error.param);
        }
      } catch {
        console.error('  Raw Response Body:', errorObj.responseBody);
      }
    }

    // Display data.error if available (alternative error format)
    if (errorObj?.data?.error) {
      console.error('📊 DATA ERROR DETAILS:');
      console.error('  Code:', errorObj.data.error.code);
      console.error('  Type:', errorObj.data.error.type);
      console.error('  Message:', errorObj.data.error.message);
    }

    // Additional context
    if (errorObj?.url) {
      console.error('🌐 REQUEST URL:', errorObj.url);
    }

    console.error('🔧 DEVELOPER ACTION REQUIRED:');

    if (errorCode === 429 || /rate.?limit/i.test(message)) {
      console.error('  ➤ Rate limit exceeded - implement retry logic or reduce request frequency');
      throw new RateLimitError('Rate limit exceeded. Please try again later.');
    }

    if (errorCode === 402 || /quota|billing|insufficient.*funds/i.test(message)) {
      console.error(
        '  ➤ Check OpenAI billing and account limits at https://platform.openai.com/usage'
      );
      throw new QuotaExceededError('Service quota exceeded. Please try again later.');
    }

    if (errorCode === 401 || /invalid.*key|authentication|unauthorized/i.test(message)) {
      console.error(
        '  ➤ Check OPENAI_API_KEY in .env.local - get a valid key from https://platform.openai.com/api-keys'
      );
      throw new AuthenticationError('Service authentication error. Please try again later.');
    }

    if (errorCode === 400 || /bad.?request/i.test(message)) {
      console.error('  ➤ Review request format and parameters');
      throw new ServiceError('Invalid request format. Please try again.', 400);
    }

    console.error('  ➤ Unhandled error - check logs above for details');
    console.error('🚨 ========================================== 🚨');

    // Detailed error dump for debugging
    console.error('FULL ERROR OBJECT FOR DEBUGGING:', {
      name: errorObj?.name,
      message: errorObj?.message,
      code: rawErrorCode,
      normalizedCode: errorCode,
      statusCode: errorObj?.statusCode,
      url: errorObj?.url,
      isRetryable: errorObj?.isRetryable,
      responseHeaders: errorObj?.responseHeaders,
      stack: errorObj?.stack
    });

    throw new ServiceError('AI service temporarily unavailable. Please try again later.', 503);
  }

  async streamChat(messages: ChatMessage[]) {
    console.log('=== Starting chat stream ===');
    console.log('Messages count:', messages.length);

    // Only log full message content in development mode to protect user privacy
    if (dev) {
      console.log('Messages:', JSON.stringify(messages, null, 2));
    } else {
      // In production, only log safe metadata about messages
      const messagesSummary = messages.map((msg, index) => ({
        index,
        role: msg.role,
        contentLength: msg.content?.length || 0,
        hasContent: !!msg.content
      }));
      console.log('Messages summary:', JSON.stringify(messagesSummary, null, 2));
    }

    // Ensure API key is tested (cached after first test)
    await this.ensureApiKeyTested();

    try {
      console.log('Creating streamText request...');
      const result = await streamText({
        model: openai('gpt-4o'),
        messages
      });

      console.log('streamText successful, converting to DataStreamResponse...');
      const response = result.toDataStreamResponse();
      console.log('DataStreamResponse created successfully');

      return response;
    } catch (error) {
      console.error('Error in streamChat:', error);

      // If we get an authentication error, reset the cached state so we retest next time
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = Number(error.code);
        if (errorCode === 401) {
          console.log('Authentication error detected, resetting API key test cache');
          ChatService.isApiKeyTested = false;
          ChatService.apiKeyTestPromise = null;
        }
      }

      this.handleAiError(error);
    }
  }
}
