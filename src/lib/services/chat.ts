import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { ChatMessage } from '../validation/chat.js';
import { 
  RateLimitError, 
  QuotaExceededError, 
  AuthenticationError, 
  ServiceError 
} from '../errors/index.js';

const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
});

export class ChatService {
  private validateApiKey(): void {
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      throw new ServiceError('Service configuration error. Please try again later.', 500);
    }
  }

  private handleAiError(error: any): never {
    const message = error?.message || '';
    
    if (message.includes('rate limit')) {
      throw new RateLimitError('Rate limit exceeded. Please try again later.');
    }
    
    if (message.includes('quota') || message.includes('billing')) {
      throw new QuotaExceededError('Service quota exceeded. Please try again later.');
    }
    
    if (message.includes('invalid') || message.includes('authentication')) {
      console.error('Authentication error with OpenAI API');
      throw new AuthenticationError('Service authentication error. Please try again later.');
    }

    throw new ServiceError('AI service temporarily unavailable. Please try again later.', 503);
  }

  async streamChat(messages: ChatMessage[]) {
    this.validateApiKey();

    try {
      const result = streamText({
        model: openai('gpt-4o'),
        messages,
      });

      return result.toDataStreamResponse();
    } catch (error) {
      this.handleAiError(error);
    }
  }
}
