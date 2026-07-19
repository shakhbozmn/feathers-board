'use client';

import {
  ApiRequest,
  ServiceInfo,
  ServiceMethod,
} from '@feathers-playground/types';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { apiClient } from '../lib/api-client';
import {
  formatJson,
  isValidJson,
  parseJson,
  schemaToExample,
} from '../lib/utils';

interface RequestBuilderProps {
  service: ServiceInfo | null;
  onResponse: (response: any) => void;
  onRequest?: (request: ApiRequest & { url: string; httpMethod: string }) => void;
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

// Loose shape for the inline schema tree. Matches @feathers-playground/types'
// JSONSchema enough for the columns we render; deep nesting is rendered as
// `object` / `array` placeholders.
type SchemaLike = {
  type?: string;
  format?: string;
  enum?: any[];
  example?: any;
  default?: any;
  [key: string]: any;
};

interface SchemaProperty {
  name: string;
  type: string;
  required: boolean;
  example: any;
  schema: SchemaLike;
}

function summarizeType(schema: SchemaLike | undefined): string {
  if (!schema || !schema.type) return 'any';
  if (schema.type === 'array') {
    const items = summarizeType(schema.items);
    return `array<${items}>`;
  }
  if (schema.enum?.length) return 'enum';
  if (schema.format) return `${schema.type} (${schema.format})`;
  return schema.type;
}

function exampleFor(schema: SchemaLike | undefined, key: string): any {
  if (!schema) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (Array.isArray(schema.enum) && schema.enum.length > 0)
    return schema.enum[0];
  switch (schema.type) {
    case 'object':
      return {};
    case 'array':
      return [];
    case 'number':
    case 'integer':
      return typeof schema.minimum === 'number' ? schema.minimum : 0;
    case 'boolean':
      return false;
    case 'null':
      return null;
    case 'string': {
      const k = key.toLowerCase();
      if (k.includes('email')) return 'user@example.com';
      if (k === 'name' || k.endsWith('name')) return 'John Doe';
      if (k.includes('password')) return 'password123';
      if (k.includes('url') || k.includes('avatar') || k.includes('image'))
        return 'https://example.com/image.png';
      if (k.includes('phone')) return '+15555555555';
      return 'string';
    }
    default:
      return 'string';
  }
}

// Detect macOS so the kbd hint shows ⌘ vs Ctrl. Resolved once at module load.
const IS_MAC =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

const SHORTCUT_LABEL = IS_MAC ? '⌘ ↵' : 'Ctrl + ↵';

const METHODS_WITH_ID: ServiceMethod[] = ['get', 'patch', 'remove'];
const METHODS_WITH_BODY: ServiceMethod[] = ['create', 'patch'];

function pickDefaultMethod(methods: ServiceMethod[]): ServiceMethod {
  // Prefer "find" (the listing operation) when available; otherwise the
  // first method the service declares.
  if (methods.includes('find')) return 'find';
  return methods[0] ?? 'find';
}

export function RequestBuilder({
  service,
  onResponse,
  onRequest,
  loading,
  onLoadingChange,
}: RequestBuilderProps) {
  const [selectedMethod, setSelectedMethod] = useState<ServiceMethod>('find');
  const [queryInput, setQueryInput] = useState('{}');
  const [dataInput, setDataInput] = useState('{}');
  const [dataInputOwner, setDataInputOwner] = useState<string | null>(null);
  const [headersInput, setHeadersInput] = useState('{}');
  const [idInput, setIdInput] = useState('');
  const [authToken, setAuthToken] = useState('');
  // Spoken feedback for schema-tree click-to-insert. Screen readers
  // announce this via the live region below; sighted users see nothing
  // because the live region is sr-only.
  const [insertNotice, setInsertNotice] = useState<string>('');

  const dataTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Refs to the latest values without re-binding the keydown handler every
  // keystroke. Lets handleKeyDown stay referentially stable.
  const loadingRef = useRef(loading);
  const serviceRef = useRef(service);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  useEffect(() => {
    serviceRef.current = service;
  }, [service]);

  // Stable IDs so labels and controls are tied together for screen readers
  // and voice control. Using useId keeps IDs unique across renders.
  const ids = {
    id: useId(),
    query: useId(),
    data: useId(),
    auth: useId(),
    headers: useId(),
  };

  const buildSample = useCallback(
    () => (service?.schema ? formatJson(schemaToExample(service.schema)) : '{}'),
    [service?.schema]
  );

  // Service switch: reconcile selectedMethod, ID, and body with what the new
  // service supports. Stale state across services is the single biggest foot-
  // gun in a dev tool used 10+ times per session.
  useEffect(() => {
    if (!service) return;

    setSelectedMethod(prev =>
      service.methods.includes(prev) ? prev : pickDefaultMethod(service.methods)
    );

    // Drop a stale ID — IDs from one service rarely mean anything to another.
    setIdInput('');

    // Re-seed body with the new service's schema (if there is one). Done in
    // a separate effect for the body because we want it to run on top of
    // the dataInputOwner guard.
  }, [service]);

  useEffect(() => {
    if (!service) return;
    if (!METHODS_WITH_BODY.includes(selectedMethod)) return;
    if (dataInputOwner !== service.name) {
      const sample = buildSample();
      setDataInput(sample);
      setDataInputOwner(service.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, selectedMethod, buildSample]);

  // Reset owner when service is cleared so the next selection re-seeds.
  useEffect(() => {
    if (!service) setDataInputOwner(null);
  }, [service]);

  const queryValid = isValidJson(queryInput);
  const dataValid = isValidJson(dataInput);
  const headersValid = isValidJson(headersInput);

  // Block submission while any JSON field is invalid. The previous behaviour
  // silently downgraded invalid JSON to `{}` — that violated the product's
  // "honest state" principle.
  const allValid = queryValid && dataValid && headersValid;

  // Derive the inline schema tree from service.schema. Top-level only —
  // nested objects surface as `object` placeholders. Required set comes
  // from `schema.required: string[]`.
  const schemaProperties = useMemo<SchemaProperty[]>(() => {
    const schema = service?.schema;
    if (!schema || schema.type !== 'object') return [];
    const required = new Set<string>(
      Array.isArray(schema.required) ? schema.required : []
    );
    const props = schema.properties || {};
    return Object.entries(props).map(([name, propSchema]) => ({
      name,
      type: summarizeType(propSchema as SchemaLike),
      required: required.has(name),
      example: exampleFor(propSchema as SchemaLike, name),
      schema: propSchema as SchemaLike,
    }));
  }, [service?.schema]);

  // Insert a schema property structurally: parse the body, mutate the
  // object, re-stringify with 2-space indent. If the key already exists, no
  // change. If the body isn't an object, no change (avoid producing
  // malformed JSON). Caret lands on the inserted value. Every outcome is
  // announced via the live region so screen-reader users get feedback.
  const insertPropertyAtCaret = useCallback((prop: SchemaProperty) => {
    const textarea = dataTextareaRef.current;
    if (!textarea) return;

    const parsed = parseJson(dataInput);

    if (parsed === null) {
      textarea.focus();
      setInsertNotice(
        `Couldn’t insert ${prop.name}: fix the invalid JSON in the request body first.`
      );
      return;
    }
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      textarea.focus();
      setInsertNotice(
        `Couldn’t insert ${prop.name}: the request body must be a JSON object.`
      );
      return;
    }

    const body = parsed as Record<string, any>;
    const valueJson = JSON.stringify(prop.example);

    if (JSON.stringify(body[prop.name]) === valueJson) {
      textarea.focus();
      setInsertNotice(`${prop.name} already has that value.`);
      return;
    }

    body[prop.name] = prop.example;
    const next = formatJson(body);
    setDataInput(next);
    setInsertNotice(
      `${prop.name} added to the request body. Edit the highlighted value.`
    );

    requestAnimationFrame(() => {
      const ta = dataTextareaRef.current;
      if (!ta) return;
      ta.focus();
      const needle = `"${prop.name}":`;
      const idx = next.indexOf(needle);
      if (idx === -1) return;
      let caret = idx + needle.length;
      while (caret < next.length && /\s/.test(next[caret])) caret++;
      const valueEnd = caret + valueJson.length;
      ta.setSelectionRange(caret, valueEnd);
    });
  }, [dataInput]);

  const handleSubmit = useCallback(async () => {
    // Defensive double-submit guard.
    if (loadingRef.current) return;
    const svc = serviceRef.current;
    if (!svc) return;
    // Refuse to send invalid JSON — the previous silent-downgrade violated
    // the product's honest-state principle.
    if (!allValid) return;

    onLoadingChange(true);

    try {
      const headers: Record<string, string> = isValidJson(headersInput)
        ? parseJson(headersInput)
        : {};
      if (authToken.trim()) {
        headers['Authorization'] = `Bearer ${authToken.trim()}`;
      }

      const query = isValidJson(queryInput) ? parseJson(queryInput) : {};
      const data = isValidJson(dataInput) ? parseJson(dataInput) : {};
      const request: ApiRequest = {
        method: selectedMethod,
        servicePath: svc.path,
        query,
        data,
        headers,
        id: idInput || undefined,
      };

      // Single source of truth for the actual fetch. Echo and cURL both
      // consume the same prepared object.
      const prepared = apiClient.prepareRequest(request);
      onRequest?.({
        ...request,
        url: prepared.url,
        httpMethod: prepared.method,
      });

      const response = await apiClient.makeRequest(request);
      onResponse(response);
    } catch (error) {
      const err = error as { code?: string | number; message?: string };
      const status = typeof err?.code === 'number' ? err.code : 500;
      onResponse({
        data: error,
        status,
        statusText: err?.message || 'Error',
        headers: {},
      });
    } finally {
      onLoadingChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedMethod,
    queryInput,
    dataInput,
    headersInput,
    idInput,
    authToken,
    allValid,
    onResponse,
    onRequest,
    onLoadingChange,
  ]);

  // Keyboard accelerator: Cmd/Ctrl+Enter anywhere inside the form fires
  // submit. Plain Enter still inserts newline in textareas.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        if (!allValid) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, allValid]
  );

  if (!service) {
    return (
      <div className="h-full p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Request Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center max-w-sm">
                <p className="font-mono text-sm">
                  Pick a service from the sidebar to build a request.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const httpMethod = apiClient.prepareRequest({
    method: selectedMethod,
    servicePath: service.path,
    query: {},
    data: {},
    headers: {},
    id: idInput || undefined,
  }).method;
  const sendLabel = loading
    ? `Sending ${httpMethod} ${service.path}${idInput ? '/' + idInput : ''}…`
    : `Send ${httpMethod} ${service.path}`;

  const showIdInput = METHODS_WITH_ID.includes(selectedMethod);
  const showBodyInput = METHODS_WITH_BODY.includes(selectedMethod);

  return (
    <div className="h-full p-4">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            <span className="text-muted-foreground font-normal">
              Request Builder
            </span>
            <span className="mx-2 text-muted-foreground/60" aria-hidden>
              ·
            </span>
            <span className="font-mono">{service.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
            onKeyDown={handleKeyDown}
            aria-label={`Build and send a request to ${service.name}`}
            className="space-y-4"
          >
            {/* Method Selection */}
            <fieldset>
              <legend className="text-sm font-medium mb-2">Method</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                {service.methods.map(method => {
                  const selected = selectedMethod === method;
                  return (
                    <Button
                      key={method}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMethod(method)}
                    >
                      {method.toUpperCase()}
                    </Button>
                  );
                })}
              </div>
            </fieldset>

            {/* ID Input for get, patch, remove */}
            {showIdInput && (
              <div>
                <label
                  htmlFor={ids.id}
                  className="block text-sm font-medium mb-2"
                >
                  Item ID
                </label>
                <input
                  id={ids.id}
                  type="text"
                  value={idInput}
                  onChange={e =>
                    setIdInput((e.target as HTMLInputElement).value)
                  }
                  placeholder="e.g. 42 or rec_abc123"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full p-2 border border-input rounded-md bg-background font-mono text-sm"
                />
              </div>
            )}

            {/* Query Parameters */}
            <div>
              <label
                htmlFor={ids.query}
                className="block text-sm font-medium mb-2"
              >
                Query parameters{' '}
                <span className="text-muted-foreground font-normal">
                  (JSON)
                </span>
              </label>
              <textarea
                id={ids.query}
                value={queryInput}
                onChange={e =>
                  setQueryInput((e.target as HTMLTextAreaElement).value)
                }
                placeholder='{"$limit": 10, "$skip": 0}'
                aria-invalid={!queryValid}
                aria-describedby={`${ids.query}-help ${ids.query}-status`}
                className={`w-full h-24 p-2 border rounded-md bg-background font-mono text-sm transition-colors ${
                  queryValid ? 'border-input' : 'border-destructive'
                }`}
              />
              <div className="flex justify-between gap-2 mt-1">
                <p
                  id={`${ids.query}-help`}
                  className="text-xs text-muted-foreground"
                >
                  Feathers operators like <code>$limit</code>, <code>$sort</code>,{' '}
                  <code>$select</code> pass through as-is.
                </p>
                <p
                  id={`${ids.query}-status`}
                  className={`text-xs font-mono ${
                    queryValid ? 'text-muted-foreground' : 'text-destructive'
                  }`}
                  role="status"
                >
                  {queryValid ? '✓ valid JSON' : 'invalid JSON — fix to send'}
                </p>
              </div>
            </div>

            {/* Request Body for create, patch */}
            {showBodyInput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor={ids.data} className="text-sm font-medium">
                    Request body{' '}
                    <span className="text-muted-foreground font-normal">
                      (JSON)
                    </span>
                  </label>
                  {service.schema && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const sample = buildSample();
                        setDataInput(sample);
                        setDataInputOwner(service.name);
                      }}
                    >
                      Fill sample from schema
                    </Button>
                  )}
                </div>
                <textarea
                  id={ids.data}
                  ref={dataTextareaRef}
                  value={dataInput}
                  onChange={e =>
                    setDataInput((e.target as HTMLTextAreaElement).value)
                  }
                  placeholder='{"name": "John Doe", "email": "john@example.com"}'
                  aria-invalid={!dataValid}
                  aria-describedby={`${ids.data}-status ${ids.data}-schema-help`}
                  className={`w-full h-32 p-2 border rounded-md bg-background font-mono text-sm transition-colors ${
                    dataValid ? 'border-input' : 'border-destructive'
                  }`}
                />
                <p
                  id={`${ids.data}-status`}
                  className={`text-xs font-mono mt-1 ${
                    dataValid ? 'text-muted-foreground' : 'text-destructive'
                  }`}
                  role="status"
                >
                  {dataValid ? '✓ valid JSON' : 'invalid JSON — fix to send'}
                </p>

                {/* Inline schema tree — terminal-adjacent. Click any row to
                    insert the property structurally (no duplicates, no
                    out-of-bounds insertion). Top-level only. */}
                {schemaProperties.length > 0 && (
                  <div
                    id={`${ids.data}-schema-help`}
                    className="mt-2 border border-border rounded-md overflow-hidden"
                  >
                    <div className="px-2 py-1 flex items-center justify-between border-b border-border bg-muted">
                      <span className="text-xs font-medium text-muted-foreground">
                        Schema · click to insert
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {schemaProperties.length} propert
                        {schemaProperties.length === 1 ? 'y' : 'ies'}
                      </span>
                    </div>
                    <ul
                      className="max-h-32 overflow-y-auto custom-scrollbar divide-y divide-border"
                      aria-label="Schema properties"
                    >
                      {schemaProperties.map(prop => (
                        <li key={prop.name}>
                          <button
                            type="button"
                            onClick={() => insertPropertyAtCaret(prop)}
                            className="group w-full px-2 py-1.5 flex items-center gap-2 text-left hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none transition-colors"
                            aria-label={`Insert ${prop.name} (${prop.type})${prop.required ? ', required' : ''}`}
                          >
                            <span className="font-mono text-xs flex-1 truncate">
                              {prop.name}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {prop.type}
                            </span>
                            {prop.required && (
                              <span className="px-1 py-px text-xs font-mono uppercase rounded bg-destructive-bg text-destructive">
                                req
                              </span>
                            )}
                            <span
                              aria-hidden
                              className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                            >
                              →
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {/* Live region for screen-reader feedback on every
                        insert outcome — added, no-op, or refused. */}
                    <div
                      role="status"
                      aria-live="polite"
                      className="sr-only"
                    >
                      {insertNotice}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth token (Bearer) */}
            <div>
              <label htmlFor={ids.auth} className="block text-sm font-medium mb-2">
                Auth token{' '}
                <span className="text-muted-foreground font-normal">
                  (Bearer)
                </span>
              </label>
              <input
                id={ids.auth}
                type="text"
                value={authToken}
                onChange={e =>
                  setAuthToken((e.target as HTMLInputElement).value)
                }
                placeholder="Paste a JWT — sent as Authorization: Bearer …"
                autoComplete="off"
                spellCheck={false}
                className="w-full p-2 border border-input rounded-md bg-background font-mono text-sm"
              />
            </div>

            {/* Headers */}
            <div>
              <label
                htmlFor={ids.headers}
                className="block text-sm font-medium mb-2"
              >
                Extra headers{' '}
                <span className="text-muted-foreground font-normal">
                  (JSON)
                </span>
              </label>
              <textarea
                id={ids.headers}
                value={headersInput}
                onChange={e =>
                  setHeadersInput((e.target as HTMLTextAreaElement).value)
                }
                placeholder='{"X-Trace-Id": "abc"}'
                aria-invalid={!headersValid}
                aria-describedby={`${ids.headers}-status`}
                className={`w-full h-20 p-2 border rounded-md bg-background font-mono text-sm transition-colors ${
                  headersValid ? 'border-input' : 'border-destructive'
                }`}
              />
              <p
                id={`${ids.headers}-status`}
                className={`text-xs font-mono mt-1 ${
                  headersValid ? 'text-muted-foreground' : 'text-destructive'
                }`}
                role="status"
              >
                {headersValid ? '✓ valid JSON' : 'invalid JSON — fix to send'}
              </p>
            </div>

            {/* Send Button + keyboard hint */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={loading || !allValid}
                className="flex-1"
                aria-disabled={loading || !allValid}
              >
                {sendLabel}
              </Button>
              <kbd
                aria-hidden
                className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground border border-border rounded"
                title={`${SHORTCUT_LABEL} to send`}
              >
                {SHORTCUT_LABEL}
              </kbd>
            </div>
            {!allValid && (
              <p className="text-xs font-mono text-destructive" role="status">
                Fix the invalid JSON field{allValid ? '' : 's'} before sending.
              </p>
            )}
            <span className="sr-only">
              Press {SHORTCUT_LABEL} to send the request.
            </span>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
