import { JSONSchema } from '@feathers-playground/types';
import { z } from 'zod';

// Zod schema for message validation
export const messageSchema = z.object({
  id: z.number().optional(),
  text: z.string().min(1),
  userId: z.number(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const messagePatchSchema = messageSchema.partial().omit({ id: true });
export const messageQuerySchema = z.object({
  $limit: z.number().optional(),
  $skip: z.number().optional(),
  $sort: z.record(z.union([z.literal(1), z.literal(-1)])).optional(),
  text: z.string().optional(),
  userId: z.number().optional(),
});

export type Message = z.infer<typeof messageSchema>;
export type MessageData = z.infer<typeof messagePatchSchema>;
export type MessageQuery = z.infer<typeof messageQuerySchema>;

// JSON Schema for API documentation
export const messageJsonSchema: JSONSchema = {
  type: 'object',
  properties: {
    id: { type: 'number', description: 'Unique identifier' },
    text: { type: 'string', minLength: 1, description: 'Message content' },
    userId: { type: 'number', description: 'ID of the user who created the message' },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
    updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
  },
  required: ['text', 'userId'],
  additionalProperties: false,
};