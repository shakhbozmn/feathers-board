'use client';

import { ResponseViewer } from '@/components/response-viewer';
import { ServicesSidebar } from '@/components/services-sidebar';
import { Button } from '@/components/ui/button';
import { ApiRequest, ServiceInfo } from '@feathers-playground/types';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { RequestBuilder } from '../components/request-builder';

type MobileTab = 'request' | 'response';

export default function PlaygroundPage() {
  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(
    null
  );
  const [response, setResponse] = useState<any>(null);
  const [lastRequest, setLastRequest] = useState<
    (ApiRequest & { url: string; httpMethod: string }) | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('request');

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleSelectService = (service: ServiceInfo) => {
    setSelectedService(service);
    setSidebarOpen(false);
    setMobileTab('request');
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // Esc closes the mobile drawer (sighted and keyboard parity).
  // Focus management: when opened, move focus to the close button inside
  // the drawer. When closed, restore focus to the menu trigger.
  useEffect(() => {
    if (sidebarOpen) {
      // Move focus to the close button on the next tick so the drawer's
      // open-state styles have applied.
      const id = window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
    // Restore focus to the menu trigger on close (only if it still exists).
    menuButtonRef.current?.focus();
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return (
    <div className="h-[100dvh] flex bg-background text-foreground">
      {/* Mobile backdrop */}
      <div
        aria-hidden
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-foreground/40 md:hidden transition-opacity duration-200 ${
          sidebarOpen
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar: drawer on mobile, persistent panel on md+.
          On mobile when open, behaves as a modal dialog — role/aria-modal/
          inert on the rest of the page keep keyboard focus inside.
          The mobile drawer carries the one DESIGN-permitted ambient shadow
          (drawer-ambient) — see DESIGN.md shadow vocabulary. */}
      <aside
        aria-label="Services"
        role={sidebarOpen ? 'dialog' : undefined}
        aria-modal={sidebarOpen ? true : undefined}
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border flex flex-col transform transition-transform duration-200 ease-out md:relative md:translate-x-0 md:z-auto md:shadow-none ${
          sidebarOpen
            ? 'translate-x-0 shadow-[0_4px_24px_oklch(0_0_0_/_0.08)]'
            : '-translate-x-full shadow-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-base font-semibold">Services</h2>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Close services"
            onClick={closeSidebar}
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

      {/* Main column. `inert` while the mobile drawer is open removes every
          focusable descendant from the tab order — the simplest portable
          focus-trap without a third-party library. */}
      <main
        className="flex-1 flex flex-col min-w-0"
        // @ts-expect-error — `inert` is a valid HTML attribute; React's
        // typings lag a few versions behind.
        inert={sidebarOpen ? '' : undefined}
      >
        {/* Header */}
        <header className="border-b border-border bg-card px-4 md:px-6 py-3 flex items-center gap-3 shrink-0">
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            aria-label="Open services"
            aria-expanded={sidebarOpen}
            aria-haspopup="dialog"
            onClick={openSidebar}
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
                    ? 'border-primary-strong bg-secondary text-foreground'
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
            <RequestBuilder
              service={selectedService}
              onResponse={setResponse}
              onRequest={setLastRequest}
              loading={loading}
              onLoadingChange={(v) => {
                setLoading(v);
                if (v) setMobileTab('response');
              }}
            />
          </section>

          <section
            id="panel-response"
            role="tabpanel"
            aria-label="Response viewer"
            className={`md:w-1/2 md:min-w-[480px] md:max-w-[60%] ${
              mobileTab === 'response' ? '' : 'hidden md:block'
            }`}
          >
            <ResponseViewer
              response={response}
              request={lastRequest}
              loading={loading}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
