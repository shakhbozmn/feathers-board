'use client';

import {
  ApiRequest,
  ServiceInfo,
  ServiceMethod,
} from '@feathers-playground/types';
import { useEffect, useId, useState } from 'react';
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
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

const httpVerbFor = (method: ServiceMethod): string =>
  (
    {
      find: 'GET',
      get: 'GET',
      create: 'POST',
      patch: 'PATCH',
      remove: 'DELETE',
    } as const
  )[method] ?? 'GET';

export function RequestBuilder({
  service,
  onResponse,
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

  // Stable IDs so labels and controls are tied together for screen readers
  // and voice control. Using useId keeps IDs unique across renders.
  const ids = {
    id: useId(),
    query: useId(),
    data: useId(),
    auth: useId(),
    headers: useId(),
  };

  const buildSample = () =>
    service?.schema ? formatJson(schemaToExample(service.schema)) : '{}';

  // When the service changes, re-seed the body with a fresh schema sample
  // (only for body-carrying methods). Tracking the owner by service name
  // avoids clobbering user edits on a method switch.
  useEffect(() => {
    if (!service) return;
    if (!['create', 'patch'].includes(selectedMethod)) return;
    if (dataInputOwner !== service.name) {
      const sample = buildSample();
      setDataInput(sample);
      setDataInputOwner(service.name);
    }
    // buildSample reads service.schema which is stable for a given service.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, selectedMethod]);

  // Reset owner when service is cleared so the next selection re-seeds.
  useEffect(() => {
    if (!service) setDataInputOwner(null);
  }, [service]);

  const queryValid = isValidJson(queryInput);
  const dataValid = isValidJson(dataInput);
  const headersValid = isValidJson(headersInput);

  const handleSubmit = async () => {
    if (!service) return;

    onLoadingChange(true);

    try {
      const headers: Record<string, string> = isValidJson(headersInput)
        ? parseJson(headersInput)
        : {};
      // A Bearer token entered in the dedicated field wins over headers JSON.
      if (authToken.trim()) {
        headers['Authorization'] = `Bearer ${authToken.trim()}`;
      }

      const request: ApiRequest = {
        method: selectedMethod,
        servicePath: service.path,
        query: isValidJson(queryInput) ? parseJson(queryInput) : {},
        data: isValidJson(dataInput) ? parseJson(dataInput) : {},
        headers,
        id: idInput || undefined,
      };

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
  };

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

  const httpVerb = httpVerbFor(selectedMethod);
  const sendLabel = loading
    ? `Sending ${httpVerb} ${service.path}${idInput ? '/' + idInput : ''}…`
    : `Send ${httpVerb} ${service.path}`;

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
          {/* Method Selection */}
          <fieldset>
            <legend className="text-sm font-medium mb-2">Method</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {service.methods.map(method => {
                const selected = selectedMethod === method;
                return (
                  <Button
                    key={method}
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
          {['get', 'patch', 'remove'].includes(selectedMethod) && (
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
                {queryValid ? '✓ valid JSON' : 'invalid JSON — will send {}'}
              </p>
            </div>
          </div>

          {/* Request Body for create, patch */}
          {['create', 'patch'].includes(selectedMethod) && (
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
                value={dataInput}
                onChange={e =>
                  setDataInput((e.target as HTMLTextAreaElement).value)
                }
                placeholder='{"name": "John Doe", "email": "john@example.com"}'
                aria-invalid={!dataValid}
                aria-describedby={`${ids.data}-status`}
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
                {dataValid ? '✓ valid JSON' : 'invalid JSON — will send {}'}
              </p>
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
              {headersValid ? '✓ valid JSON' : 'invalid JSON — will send {}'}
            </p>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {sendLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
