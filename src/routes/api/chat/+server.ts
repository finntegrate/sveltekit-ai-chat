import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { OPENAI_API_KEY } from '$env/static/private';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Validate request body
    const body = await request.json().catch(() => null);
    if (!body || !body.messages) {
      return json(
        { error: 'Invalid request body. Messages array is required.' },
        { status: 400 }
      );
    }

    const { messages }: { messages: ChatMessage[] } = body;

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return json(
        { error: 'Messages must be a non-empty array.' },
        { status: 400 }
      );
    }

    // Validate message format
    for (const message of messages) {
      if (!message.role || !message.content) {
        return json(
          { error: 'Each message must have role and content properties.' },
          { status: 400 }
        );
      }
      
      // Validate role values
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        return json(
          { error: 'Message role must be "system", "user", or "assistant".' },
          { status: 400 }
        );
      }
    }

    // Check if API key is configured
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return json(
        { error: 'Service configuration error. Please try again later.' },
        { status: 500 }
      );
    }

    try {
      const result = streamText({
        model: openai('gpt-4o'),
        messages,
      });

      return result.toDataStreamResponse();
    } catch (aiError: any) {
      console.error('OpenAI API error:', aiError);
      
      // Handle specific AI SDK errors
      if (aiError?.message?.includes('rate limit')) {
        return json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (aiError?.message?.includes('quota') || aiError?.message?.includes('billing')) {
        return json(
          { error: 'Service quota exceeded. Please try again later.' },
          { status: 503 }
        );
      }
      
      if (aiError?.message?.includes('invalid') || aiError?.message?.includes('authentication')) {
        console.error('Authentication error with OpenAI API');
        return json(
          { error: 'Service authentication error. Please try again later.' },
          { status: 503 }
        );
      }

      // Generic AI service error
      return json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in chat API:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }
    
    // Generic server error
    return json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}