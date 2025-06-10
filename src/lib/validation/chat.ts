import { z } from 'zod';

// Zod schema for validation
export const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1, 'At least one message is required'),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Validation utility
export function validateChatRequest(body: unknown): ChatRequest {
  return ChatRequestSchema.parse(body);
}
