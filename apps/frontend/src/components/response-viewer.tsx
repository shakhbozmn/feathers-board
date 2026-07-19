'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildCurl, formatJson } from '@/lib/utils';
import { useState } from 'react';
import { ApiRequest } from '@feathers-playground/types';

interface ResponseViewerProps {
  response: any;
  request?: (ApiRequest & { url: string; httpMethod: string }) | null;
  loading: boolean;
}

type StatusTone = 'success' | 'warning' | 'danger';

function toneFor(status: number): StatusTone {
  if (status >= 200 && status < 300) return 'success';
  if (status >= 400) return 'danger';
  return 'warning';
}

function summarize(status: number, statusText: string): string {
  if (status >= 200 && status < 300) return `Success — ${statusText}`;
  if (status === 401) return 'Not authenticated. Check your token.';
  if (status === 403) return 'Forbidden. You don’t have access.';
  if (status === 404) return 'Not found.';
  if (status === 422) return 'Validation failed. Check the request body.';
  if (status >= 500) return 'Server error. Try again or check the logs.';
  if (status >= 400) return `Request failed — ${statusText}`;
  return statusText;
}

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-destructive-bg text-destructive',
};

export function ResponseViewer({
  response,
  request,
  loading,
}: ResponseViewerProps) {
  const [echoOpen, setEchoOpen] = useState(true);
  const [copied, setCopied] = useState<'url' | 'curl' | null>(null);

  if (loading) {
    return (
      <div className="h-full p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p className="font-mono text-sm text-center max-w-sm">
                Send a request to see the response here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tone = toneFor(response.status);
  const summary = summarize(response.status, response.statusText);
  const curlString = request ? buildCurl({
    method: request.httpMethod,
    url: request.url,
    headers: request.headers,
    data: request.data,
  }) : null;

  const copyToClipboard = async (
    value: string,
    label: 'url' | 'curl'
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard may be unavailable in some browsers / contexts. Silent
      // failure is acceptable — the developer can still select-and-copy
      // manually from the echo panel.
    }
  };

  return (
    <div className="h-full p-4">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Response</CardTitle>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs rounded font-mono font-medium ${toneClasses[tone]}`}
              aria-label={`Status ${response.status} ${response.statusText}`}
            >
              {response.status} {response.statusText}
            </span>
            {curlString && (
              <button
                type="button"
                onClick={() => copyToClipboard(curlString, 'curl')}
                aria-label="Copy request as cURL"
                title="Copy request as cURL"
                className="px-2 py-1 text-xs rounded font-mono font-medium border border-input hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                {copied === 'curl' ? 'copied' : 'curl'}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="h-full overflow-auto">
          <div className="space-y-4">
            {/* aria-live region: status + summary announced together */}
            <div role="status" aria-live="polite" className="sr-only">
              {response.status} {response.statusText}. {summary}
            </div>

            <p
              className={`text-sm ${
                tone === 'danger'
                  ? 'text-destructive'
                  : tone === 'warning'
                    ? 'text-warning'
                    : 'text-muted-foreground'
              }`}
            >
              {summary}
            </p>

            {/* Request echo — the URL, headers, and body that actually left
                the browser. Collapsed by default to keep the response body
                dominant; one-click expand for debugging. */}
            {request && (
              <section
                aria-label="Request that was sent"
                className="border border-border rounded-md overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setEchoOpen(o => !o)}
                  aria-expanded={echoOpen}
                  aria-controls="request-echo-body"
                  className="w-full px-3 py-2 flex items-center justify-between text-left bg-muted hover:bg-secondary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Request sent
                    </span>
                    <span className="font-mono text-xs">
                      {request.httpMethod} {request.servicePath}
                      {request.id ? `/${request.id}` : ''}
                    </span>
                  </span>
                  <span
                    className="text-xs text-muted-foreground font-mono"
                    aria-hidden
                  >
                    {echoOpen ? '−' : '+'}
                  </span>
                </button>
                {echoOpen && (
                  <div id="request-echo-body" className="p-3 space-y-3">
                    {/* Final URL */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          URL
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(request.url, 'url')}
                          className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Copy URL"
                        >
                          {copied === 'url' ? 'copied' : 'copy'}
                        </button>
                      </div>
                      <pre className="bg-card p-2 rounded text-xs overflow-auto font-mono custom-scrollbar border border-border break-all whitespace-pre-wrap">
                        {request.url}
                      </pre>
                    </div>

                    {/* Headers */}
                    {Object.keys(request.headers || {}).length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Headers
                        </span>
                        <pre className="mt-1 bg-card p-2 rounded text-xs overflow-auto font-mono custom-scrollbar border border-border">
                          {Object.entries(request.headers ?? {})
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([k, v]) => `${k}: ${v}`)
                            .join('\n')}
                        </pre>
                      </div>
                    )}

                    {/* Body — only when one was sent */}
                    {request.data !== undefined &&
                      request.data !== null &&
                      !(typeof request.data === 'object' && Object.keys(request.data).length === 0) &&
                      !['GET', 'DELETE'].includes(request.httpMethod) && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Body
                          </span>
                          <pre className="mt-1 bg-card p-2 rounded text-xs overflow-auto font-mono custom-scrollbar border border-border">
                            {formatJson(request.data)}
                          </pre>
                        </div>
                      )}
                  </div>
                )}
              </section>
            )}

            {response.headers && Object.keys(response.headers).length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                  Response headers
                </h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto font-mono custom-scrollbar">
                  {formatJson(response.headers)}
                </pre>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                Response body
              </h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto font-mono custom-scrollbar">
                {formatJson(response.data)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
