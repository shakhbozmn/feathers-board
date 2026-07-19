'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatJson } from '@/lib/utils';

interface ResponseViewerProps {
  response: any;
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
  danger: 'bg-destructive/10 text-destructive',
};

export function ResponseViewer({ response, loading }: ResponseViewerProps) {
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

  return (
    <div className="h-full p-4">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Response</CardTitle>
          <span
            className={`px-2 py-1 text-xs rounded font-mono font-medium ${toneClasses[tone]}`}
          >
            {response.status} {response.statusText}
          </span>
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

            {response.headers && Object.keys(response.headers).length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                  Headers
                </h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto font-mono custom-scrollbar">
                  {formatJson(response.headers)}
                </pre>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                Body
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
