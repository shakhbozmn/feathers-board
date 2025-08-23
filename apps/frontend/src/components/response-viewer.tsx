'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatJson } from '@/lib/utils';

interface ResponseViewerProps {
  response: any;
  loading: boolean;
}

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
              <div className="text-center">
                <div className="text-4xl mb-4">📡</div>
                <p>Make a request to see the response</p>
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
          <CardTitle className="flex items-center justify-between">
            Response
            <span className={`px-2 py-1 text-xs rounded ${
              response.status >= 200 && response.status < 300
                ? 'bg-green-100 text-green-800'
                : response.status >= 400
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {response.status} {response.statusText}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full overflow-auto">
          <div className="space-y-4">
            {/* Response Headers */}
            {response.headers && Object.keys(response.headers).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Headers</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                  {formatJson(response.headers)}
                </pre>
              </div>
            )}

            {/* Response Body */}
            <div>
              <h4 className="font-medium mb-2">Body</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto custom-scrollbar">
                {formatJson(response.data)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}