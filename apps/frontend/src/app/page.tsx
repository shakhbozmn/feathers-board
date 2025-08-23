'use client';

import { RequestBuilder } from '@/components/request-builder';
import { ResponseViewer } from '@/components/response-viewer';
import { SchemaViewer } from '@/components/schema-viewer';
import { ServicesSidebar } from '@/components/services-sidebar';
import { ServiceInfo } from '@feathers-playground/types';
import { useState } from 'react';

export default function PlaygroundPage() {
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card">
        <ServicesSidebar
          selectedService={selectedService}
          onServiceSelect={setSelectedService}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🪶✨</div>
              <div>
                <h1 className="text-xl font-semibold">Feathers Playground</h1>
                <p className="text-sm text-muted-foreground">
                  API Testing Playground for Feathers Services
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-muted-foreground">
                {selectedService ? `${selectedService.name} service` : 'Select a service'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Request Builder & Schema */}
          <div className="flex-1 flex flex-col">
            {/* Request Builder */}
            <div className="flex-1 border-r border-border">
              <RequestBuilder
                service={selectedService}
                onResponse={setResponse}
                loading={loading}
                onLoadingChange={setLoading}
              />
            </div>

            {/* Schema Viewer */}
            {selectedService?.schema && (
              <div className="h-80 border-r border-border border-t">
                <SchemaViewer schema={selectedService.schema} />
              </div>
            )}
          </div>

          {/* Right Panel - Response Viewer */}
          <div className="w-1/2">
            <ResponseViewer response={response} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}