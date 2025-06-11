import type { RequestHandler } from './$types';
import { validateChatRequest } from '$lib/validation/chat.js';
import { handleError } from '$lib/errors/index.js';
import { ChatService } from '$lib/services/chat.js';
import { randomUUID } from 'node:crypto';

const chatService = new ChatService();

export const POST: RequestHandler = async ({ request }) => {
  const requestId = randomUUID();
  console.log(`=== Chat API Request ${requestId} ===`);
  console.log('Timestamp:', new Date().toISOString());

  try {
    console.log(`[${requestId}] Parsing request body...`);
    const body = await request.json();

    // Safely log request body with sanitization and error handling
    try {
      const sanitizedBody = {
        ...body,
        // Redact any potentially sensitive fields
        apiKey: body.apiKey ? '[REDACTED]' : undefined,
        token: body.token ? '[REDACTED]' : undefined,
        password: body.password ? '[REDACTED]' : undefined,
        secret: body.secret ? '[REDACTED]' : undefined,
        // Keep messages but truncate if too long for readability
        messages: Array.isArray(body.messages)
          ? body.messages.map((msg: unknown) => {
              const message = msg as { content?: string; [key: string]: unknown };
              return {
                ...message,
                content:
                  typeof message.content === 'string' && message.content.length > 200
                    ? `${message.content.substring(0, 200)}... [truncated]`
                    : message.content
              };
            })
          : body.messages
      };

      console.log(`[${requestId}] Request body:`, JSON.stringify(sanitizedBody, null, 2));
    } catch (stringifyError) {
      console.log(
        `[${requestId}] Request body: [Unable to stringify - ${stringifyError instanceof Error ? stringifyError.message : 'Unknown error'}]`
      );
      console.log(`[${requestId}] Request body keys:`, Object.keys(body));
    }

    console.log(`[${requestId}] Validating request...`);

    const { messages } = validateChatRequest(body);
    console.log(`[${requestId}] Request validated successfully, ${messages.length} messages`);

    console.log(`[${requestId}] Calling chat service...`);
    const response = await chatService.streamChat(messages);

    console.log(`[${requestId}] Chat service completed successfully`);
    return response;
  } catch (error) {
    console.error(
      `[${requestId}] 🔴 CHAT API ERROR:`,
      error instanceof Error ? error.message : String(error)
    );
    return handleError(error);
  }
};
