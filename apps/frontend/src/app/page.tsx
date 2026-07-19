'use client';

import { ResponseViewer } from '@/components/response-viewer';
import { SchemaViewer } from '@/components/schema-viewer';
import { ServicesSidebar } from '@/components/services-sidebar';
import { Button } from '@/components/ui/button';
import { ServiceInfo } from '@feathers-playground/types';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RequestBuilder } from '../components/request-builder';

type MobileTab = 'request' | 'response';

export default function PlaygroundPage() {
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(
    null
  );
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('request');

  const handleSelectService = (service: ServiceInfo) => {
    setSelectedService(service);
    setSidebarOpen(false);
    setMobileTab('request');
  };

  // Esc closes the mobile drawer (sighted and keyboard parity).
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return (
    <div className="h-[100dvh] flex bg-background text-foreground">
      {/* Mobile backdrop */}
      <div
        aria-hidden
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-foreground/40 md:hidden transition-opacity duration-200 ${
          sidebarOpen
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar: drawer on mobile, persistent panel on md+ */}
      <aside
        aria-label="Services"
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border flex flex-col transform transition-transform duration-200 ease-out md:relative md:translate-x-0 md:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-base font-semibold">Services</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Close services"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <ServicesSidebar
            selectedService={selectedService}
            onServiceSelect={handleSelectService}
          />
        </div>
      </aside>

      {/* Main column */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-card px-4 md:px-6 py-3 flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            aria-label="Open services"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-xl font-semibold truncate text-balance">
              Feathers Playground
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate text-pretty">
              {selectedService
                ? `${selectedService.name} service`
                : 'Select a service to begin'}
            </p>
          </div>
          {selectedService && (
            <div
              className="hidden md:block text-xs text-muted-foreground font-mono shrink-0"
              aria-hidden
            >
              {selectedService.path}
            </div>
          )}
        </header>

        {/* Mobile-only tab strip */}
        <div
          role="tablist"
          aria-label="Request and response panels"
          className="md:hidden border-b border-border grid grid-cols-2 shrink-0"
        >
          {(['request', 'response'] as const).map((t) => {
            const active = mobileTab === t;
            return (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={`panel-${t}`}
                onClick={() => setMobileTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-primary-strong text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'request' ? 'Request' : 'Response'}
              </button>
            );
          })}
        </div>

        {/* Content: split on md+, single tab on mobile */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <section
            id="panel-request"
            role="tabpanel"
            aria-label="Request builder"
            className={`flex-1 flex flex-col min-h-0 border-r-0 md:border-r border-border overflow-y-auto md:overflow-hidden ${
              mobileTab === 'request' ? '' : 'hidden md:flex'
            }`}
          >
            <div className="flex-1 min-h-0">
              <RequestBuilder
                service={selectedService}
                onResponse={setResponse}
                loading={loading}
                onLoadingChange={(v) => {
                  setLoading(v);
                  if (v) setMobileTab('response');
                }}
              />
            </div>
            {selectedService?.schema && (
              <div className="h-64 md:h-80 border-t border-border shrink-0">
                <SchemaViewer schema={selectedService.schema} />
              </div>
            )}
          </section>

          <section
            id="panel-response"
            role="tabpanel"
            aria-label="Response viewer"
            className={`md:w-1/2 md:min-w-[480px] md:max-w-[60%] ${
              mobileTab === 'response' ? '' : 'hidden md:block'
            }`}
          >
            <ResponseViewer response={response} loading={loading} />
          </section>
        </div>
      </main>
    </div>
  );
}
