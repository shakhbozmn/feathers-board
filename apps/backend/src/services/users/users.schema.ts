import { JSONSchema } from '@feathers-playground/types';
import { z } from 'zod';

// Zod schema for user validation
export const userSchema = z.object({
  id: z.number().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const userPatchSchema = userSchema.partial().omit({ id: true });
export const userQuerySchema = z.object({
  $limit: z.number().optional(),
  $skip: z.number().optional(),
  $sort: z.record(z.union([z.literal(1), z.literal(-1)])).optional(),
  email: z.string().optional(),
  name: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserData = z.infer<typeof userPatchSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;

// JSON Schema for API documentation
export const userJsonSchema: JSONSchema = {
  type: 'object',
  properties: {
    id: { type: 'number', description: 'Unique identifier' },
    email: { type: 'string', format: 'email', description: 'User email address' },
    name: { type: 'string', minLength: 1, description: 'User full name' },
    avatar: { type: 'string', format: 'uri', description: 'Avatar image URL' },
    createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
    updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' },
  },
  required: ['email', 'name'],
  additionalProperties: false,
};