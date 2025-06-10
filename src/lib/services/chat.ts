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
      console.error('Required service configuration is missing');
      throw new ServiceError('Service configuration error. Please try again later.', 500);
    }
  }

  private handleAiError(error: any): never {
    const message = error?.message?.toLowerCase() || '';
    const errorCode = error?.code || error?.status;
    
    if (errorCode === 429 || /rate.?limit/i.test(message)) {
      throw new RateLimitError('Rate limit exceeded. Please try again later.');
    }
    
    if (errorCode === 402 || /quota|billing|insufficient.*funds/i.test(message)) {
      throw new QuotaExceededError('Service quota exceeded. Please try again later.');
    }
    
    if (errorCode === 401 || /invalid.*key|authentication|unauthorized/i.test(message)) {
      console.error('Required service configuration is missing');
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
