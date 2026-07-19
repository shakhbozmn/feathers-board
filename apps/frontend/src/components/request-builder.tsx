'use client';

import {
  ApiRequest,
  ServiceInfo,
  ServiceMethod,
} from '@feathers-playground/types';
import { useEffect, useState } from 'react';
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

export function RequestBuilder({
  service,
  onResponse,
  loading,
  onLoadingChange,
}: RequestBuilderProps) {
  const [selectedMethod, setSelectedMethod] = useState<ServiceMethod>('find');
  const [queryInput, setQueryInput] = useState('{}');
  const [dataInput, setDataInput] = useState('{}');
  const [headersInput, setHeadersInput] = useState('{}');
  const [idInput, setIdInput] = useState('');
  const [authToken, setAuthToken] = useState('');

  // Build a sample request body from the service schema.
  const buildSample = () =>
    service?.schema ? formatJson(schemaToExample(service.schema)) : '{}';

  // Pre-fill the body with a schema-based sample when the service changes or a
  // body-carrying method is selected (only while the body is still untouched).
  useEffect(() => {
    if (!service) return;
    if (!['create', 'patch'].includes(selectedMethod)) return;
    if (dataInput.trim() === '' || dataInput.trim() === '{}') {
      setDataInput(buildSample());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, selectedMethod]);

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
              <div className="text-center">
                <div className="text-4xl mb-4">🔧</div>
                <p>Select a service to build requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Request Builder - {service.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Method</label>
            <div className="flex flex-wrap gap-2">
              {service.methods.map(method => (
                <Button
                  key={method}
                  variant={selectedMethod === method ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMethod(method)}
                >
                  {method.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* ID Input for get, patch, remove */}
          {['get', 'patch', 'remove'].includes(selectedMethod) && (
            <div>
              <label className="block text-sm font-medium mb-2">ID</label>
              <input
                type="text"
                value={idInput}
                onChange={e => setIdInput((e.target as HTMLInputElement).value)}
                placeholder="Enter ID"
                className="w-full p-2 border border-input rounded-md bg-background"
              />
            </div>
          )}

          {/* Query Parameters */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Query Parameters (JSON)
            </label>
            <textarea
              value={queryInput}
              onChange={e =>
                setQueryInput((e.target as HTMLTextAreaElement).value)
              }
              placeholder='{"$limit": 10, "$skip": 0}'
              className="w-full h-24 p-2 border border-input rounded-md bg-background font-mono text-sm"
            />
          </div>

          {/* Request Body for create, patch */}
          {['create', 'patch'].includes(selectedMethod) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Request Body (JSON)
                </label>
                {service.schema && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDataInput(buildSample())}
                  >
                    Fill sample from schema
                  </Button>
                )}
              </div>
              <textarea
                value={dataInput}
                onChange={e =>
                  setDataInput((e.target as HTMLTextAreaElement).value)
                }
                placeholder='{"name": "John Doe", "email": "john@example.com"}'
                className="w-full h-32 p-2 border border-input rounded-md bg-background font-mono text-sm"
              />
            </div>
          )}

          {/* Auth token (Bearer) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Auth Token (Bearer)
            </label>
            <input
              type="text"
              value={authToken}
              onChange={e =>
                setAuthToken((e.target as HTMLInputElement).value)
              }
              placeholder="Paste a JWT to send as Authorization: Bearer <token>"
              className="w-full p-2 border border-input rounded-md bg-background font-mono text-sm"
            />
          </div>

          {/* Headers */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Headers (JSON)
            </label>
            <textarea
              value={headersInput}
              onChange={e =>
                setHeadersInput((e.target as HTMLTextAreaElement).value)
              }
              placeholder='{"Authorization": "Bearer token"}'
              className="w-full h-20 p-2 border border-input rounded-md bg-background font-mono text-sm"
            />
          </div>

          {/* Send Button */}
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
