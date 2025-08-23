'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatJson } from '@/lib/utils';
import { JSONSchema } from '@feathers-playground/types';

interface SchemaViewerProps {
  schema: JSONSchema;
}

export function SchemaViewer({ schema }: SchemaViewerProps) {
  return (
    <div className="h-full p-4">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Schema</CardTitle>
        </CardHeader>
        <CardContent className="h-full overflow-auto">
          <pre className="bg-muted p-3 rounded text-sm overflow-auto custom-scrollbar">
            {formatJson(schema)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}