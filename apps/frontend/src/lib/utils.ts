import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJson(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export function parseJson(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// Escape a string for safe inclusion inside a single-quoted shell argument.
// Standard POSIX shell: 'foo'bar -> 'foo'\''bar'. The trailing `'\''`
// closes the quoted string, adds an escaped single quote, and reopens.
function shellQuoteSingle(value: string): string {
  return value.replace(/'/g, "'\\''");
}

export interface CurlRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: any;
}

/**
 * Build a canonical cURL command string from a request. Multi-line with
 * backslash continuations, headers alphabetised, body escaped to one line.
 * Output is copy-pasteable into a POSIX shell (bash / zsh).
 */
export function buildCurl(req: CurlRequest): string {
  const method = req.method.toUpperCase();
  const headerLines = Object.entries(req.headers || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  -H '${shellQuoteSingle(`${k}: ${v}`)}'`)
    .join(' \\\n');

  const hasBody =
    req.data !== undefined &&
    req.data !== null &&
    !(typeof req.data === 'object' && Object.keys(req.data).length === 0) &&
    method !== 'GET' &&
    method !== 'DELETE';
  const bodyJson =
    typeof req.data === 'string' ? req.data : JSON.stringify(req.data);
  const bodyLine = hasBody
    ? `  -d '${shellQuoteSingle(bodyJson)}'`
    : '';

  return [
    `curl -X ${method} '${shellQuoteSingle(req.url)}'`,
    headerLines,
    bodyLine,
  ]
    .filter(Boolean)
    .join(' \\\n');
}

// Minimal JSON Schema shape we care about (matches @feathers-playground/types).
type SchemaLike = {
  type?: string;
  properties?: Record<string, SchemaLike>;
  items?: SchemaLike;
  required?: string[];
  enum?: any[];
  format?: string;
  minimum?: number;
  default?: any;
  example?: any;
  [key: string]: any;
};

// Pick a sample string using the property name and JSON Schema `format`.
function sampleString(key: string, schema: SchemaLike): string {
  const k = key.toLowerCase();
  switch (schema.format) {
    case 'email':
      return 'user@example.com';
    case 'uri':
    case 'url':
      return 'https://example.com';
    case 'date-time':
      return '2024-01-01T00:00:00.000Z';
    case 'date':
      return '2024-01-01';
    case 'uuid':
      return '00000000-0000-0000-0000-000000000000';
  }
  if (k.includes('email')) return 'user@example.com';
  if (k === 'name' || k.endsWith('name')) return 'John Doe';
  if (k.includes('password')) return 'password123';
  if (k.includes('url') || k.includes('avatar') || k.includes('image'))
    return 'https://example.com/image.png';
  if (k.includes('phone')) return '+15555555555';
  return 'string';
}

/**
 * Generate a sample value from a JSON Schema, so the request body can be
 * pre-filled. Uses `example`/`default` when present, otherwise infers from
 * type, `format`, `enum`, and the property name. Ignores read-only-ish fields
 * (id, createdAt, updatedAt) for request bodies.
 */
export function schemaToExample(schema?: SchemaLike, key = ''): any {
  if (!schema || typeof schema !== 'object') return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0];

  switch (schema.type) {
    case 'object': {
      const out: Record<string, any> = {};
      const props = schema.properties || {};
      const skip = new Set(['id', '_id', 'createdat', 'updatedat']);
      for (const [propKey, propSchema] of Object.entries(props)) {
        if (skip.has(propKey.toLowerCase())) continue;
        out[propKey] = schemaToExample(propSchema, propKey);
      }
      return out;
    }
    case 'array':
      return [schemaToExample(schema.items, key)];
    case 'number':
    case 'integer':
      return typeof schema.minimum === 'number' ? schema.minimum : 0;
    case 'boolean':
      return false;
    case 'null':
      return null;
    case 'string':
      return sampleString(key, schema);
    default:
      // No type info: best-effort object if it has properties, else empty.
      return schema.properties ? schemaToExample({ ...schema, type: 'object' }, key) : '';
  }
}
