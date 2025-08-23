'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { isValidJson, parseJson } from '@/lib/utils';
import { ApiRequest, ServiceInfo, ServiceMethod } from '@feathers-playground/types';
import { useState } from 'react';

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

  const handleSubmit = async () => {
    if (!service) return;

    onLoadingChange(true);
    
    try {
      const request: ApiRequest = {
        method: selectedMethod,
        servicePath: service.path,
        query: isValidJson(queryInput) ? parseJson(queryInput) : {},
        data: isValidJson(dataInput) ? parseJson(dataInput) : {},
        headers: isValidJson(headersInput) ? parseJson(headersInput) : {},
        id: idInput || undefined,
      };

      const response = await apiClient.makeRequest(request);
      onResponse(response);
    } catch (error) {
      onResponse({
        data: error,
        status: 500,
        statusText: 'Error',
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
              {service.methods.map((method) => (
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
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="Enter ID"
                className="w-full p-2 border border-input rounded-md bg-background"
              />
            </div>
          )}

          {/* Query Parameters */}
          <div>
            <label className="block text-sm font-medium mb-2">Query Parameters (JSON)</label>
            <textarea
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder='{"$limit": 10, "$skip": 0}'
              className="w-full h-24 p-2 border border-input rounded-md bg-background font-mono text-sm"
            />
          </div>

          {/* Request Body for create, patch */}
          {['create', 'patch'].includes(selectedMethod) && (
            <div>
              <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
              <textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder='{"name": "John Doe", "email": "john@example.com"}'
                className="w-full h-32 p-2 border border-input rounded-md bg-background font-mono text-sm"
              />
            </div>
          )}

          {/* Headers */}
          <div>
            <label className="block text-sm font-medium mb-2">Headers (JSON)</label>
            <textarea
              value={headersInput}
              onChange={(e) => setHeadersInput(e.target.value)}
              placeholder='{"Authorization": "Bearer token"}'
              className="w-full h-20 p-2 border border-input rounded-md bg-background font-mono text-sm"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}