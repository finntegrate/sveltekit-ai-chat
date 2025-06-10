import type { RequestHandler } from './$types';
import { validateChatRequest } from '$lib/validation/chat.js';
import { handleError } from '$lib/errors/index.js';
import { ChatService } from '$lib/services/chat.js';

const chatService = new ChatService();

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages } = validateChatRequest(body);
    
    return await chatService.streamChat(messages);
  } catch (error) {
    return handleError(error);
  }
};
