import { z } from 'zod';

// Service method types
export type ServiceMethod = 'find' | 'get' | 'create' | 'patch' | 'remove';

// JSON Schema type
export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  description?: string;
  enum?: any[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  additionalProperties?: boolean | JSONSchema;
  [key: string]: any;
}

// Service discovery response
export interface ServiceInfo {
  name: string;
  path: string;
  methods: ServiceMethod[];
  schema?: JSONSchema;
  description?: string;
}

// API request types
export interface ApiRequest {
  method: ServiceMethod;
  servicePath: string;
  query?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  id?: string | number;
}

// API response types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  code?: string | number;
  className?: string;
  data?: any;
  errors?: any;
}

// Playground configuration
export interface PlaygroundConfig {
  path?: string;
  exposeSchemas?: boolean;
  title?: string;
  description?: string;
  version?: string;
  apiUrl?: string;
  cors?: boolean;
  authentication?: {
    enabled: boolean;
    strategies?: string[];
  };
}

// Request builder form data
export interface RequestFormData {
  method: ServiceMethod;
  query: string;
  data: string;
  headers: string;
  authToken?: string;
  id?: string;
}

// Zod schemas for validation
export const ServiceMethodSchema = z.enum([
  'find',
  'get',
  'create',
  'patch',
  'remove',
]);

export const ServiceInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
  methods: z.array(ServiceMethodSchema),
  schema: z.any().optional(),
  description: z.string().optional(),
});

export const ApiRequestSchema = z.object({
  method: ServiceMethodSchema,
  servicePath: z.string(),
  query: z.record(z.any()).optional(),
  data: z.any().optional(),
  headers: z.record(z.string()).optional(),
  id: z.union([z.string(), z.number()]).optional(),
});

export const PlaygroundConfigSchema = z.object({
  path: z.string().optional(),
  exposeSchemas: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  apiUrl: z.string().optional(),
  cors: z.boolean().optional(),
  authentication: z
    .object({
      enabled: z.boolean(),
      strategies: z.array(z.string()).optional(),
    })
    .optional(),
});
