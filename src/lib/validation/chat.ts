import { z } from 'zod';

// Constants for validation limits
export const MAX_MESSAGE_LENGTH = 500; // Maximum length for a single chat message

// Zod schema for validation
export const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string()
    .min(1, 'Message content cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message content cannot exceed ${MAX_MESSAGE_LENGTH} characters`),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1, 'At least one message is required').max(50, 'Too many messages in conversation'),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Validation utility
export function validateChatRequest(body: unknown): ChatRequest {
  return ChatRequestSchema.parse(body);
}
