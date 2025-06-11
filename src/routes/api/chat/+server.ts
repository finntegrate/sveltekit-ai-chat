import type { RequestHandler } from './$types';
import { validateChatRequest } from '$lib/validation/chat.js';
import { handleError } from '$lib/errors/index.js';
import { ChatService } from '$lib/services/chat.js';

const chatService = new ChatService();

export const POST: RequestHandler = async ({ request }) => {
	const requestId = Math.random().toString(36).substring(7);
	console.log(`=== Chat API Request ${requestId} ===`);
	console.log('Timestamp:', new Date().toISOString());

	try {
		console.log(`[${requestId}] Parsing request body...`);
		const body = await request.json();

		console.log(`[${requestId}] Request body:`, JSON.stringify(body, null, 2));
		console.log(`[${requestId}] Validating request...`);

		const { messages } = validateChatRequest(body);
		console.log(`[${requestId}] Request validated successfully, ${messages.length} messages`);

		console.log(`[${requestId}] Calling chat service...`);
		const response = await chatService.streamChat(messages);

		console.log(`[${requestId}] Chat service completed successfully`);
		return response;
	} catch (error) {
		console.error(`[${requestId}] 🔴 CHAT API ERROR:`, error instanceof Error ? error.message : String(error));
		return handleError(error);
	}
};
