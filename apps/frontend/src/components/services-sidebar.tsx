'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useServices } from '@/hooks/use-services';
import { cn } from '@/lib/utils';
import { ServiceInfo } from '@feathers-playground/types';
import { useCallback, useRef, useState } from 'react';

interface ServicesSidebarProps {
  selectedService: ServiceInfo | null;
  onServiceSelect: (service: ServiceInfo) => void;
}

export function ServicesSidebar({
  selectedService,
  onServiceSelect,
}: ServicesSidebarProps) {
  const { data: services, isLoading, error } = useServices();

  // Roving-tabindex state for the services listbox. Only one option is in
  // the page tab order at a time; ArrowUp/Down/Left/Right/Home/End move
  // focus between options and Enter/Space activates the focused option.
  const [focusedIndex, setFocusedIndex] = useState<number>(() => {
    if (!selectedService) return 0;
    return -1; // initialised below after services load
  });
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusOption = useCallback((idx: number) => {
    const button = optionRefs.current[idx];
    if (button) button.focus();
  }, []);

  const handleListboxKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!services || services.length === 0) return;
      const last = services.length - 1;
      let next = focusedIndex < 0 ? 0 : focusedIndex;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          next = focusedIndex >= last ? 0 : focusedIndex + 1;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          next = focusedIndex <= 0 ? last : focusedIndex - 1;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = last;
          break;
        default:
          return;
      }
      e.preventDefault();
      setFocusedIndex(next);
      focusOption(next);
    },
    [services, focusedIndex, focusOption]
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-muted rounded w-3/4"></div>
          <div className="h-10 bg-muted rounded w-1/2"></div>
          <div className="h-10 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    const message =
      (error as { message?: string })?.message ?? 'Could not reach the API.';
    return (
      <div className="p-4">
        <div
          role="alert"
          className="rounded-md border border-destructive p-3 text-sm"
        >
          <p className="font-medium text-destructive">
            Couldn’t load services
          </p>
          <p className="text-muted-foreground mt-1">{message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Check that the backend is running and that{' '}
            <code className="font-mono">NEXT_PUBLIC_API_URL</code> points to
            it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs text-muted-foreground">
          {services?.length || 0} service
          {services?.length === 1 ? '' : 's'} available
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2"
        role="listbox"
        aria-label="Feathers services"
        aria-activedescendant={
          focusedIndex >= 0 && services && services[focusedIndex]
            ? `service-option-${services[focusedIndex].name}`
            : undefined
        }
        onKeyDown={handleListboxKeyDown}
      >
        {services?.map((service: ServiceInfo, idx: number) => {
          const selected = selectedService?.name === service.name;
          const isFocused = focusedIndex === idx;
          const methodsSummary = `${service.methods.length} method${
            service.methods.length === 1 ? '' : 's'
          }`;
          const a11yLabel = `${service.name} at ${service.path}, ${methodsSummary}${
            service.description ? ' — ' + service.description : ''
          }`;

          return (
            <Button
              key={service.name}
              id={`service-option-${service.name}`}
              ref={el => {
                optionRefs.current[idx] = el;
              }}
              variant="ghost"
              role="option"
              aria-selected={selected}
              aria-label={a11yLabel}
              tabIndex={isFocused ? 0 : -1}
              title={service.description || service.path}
              className={cn(
                'group relative w-full justify-start min-h-[44px] h-auto p-3 text-left',
                selected && 'bg-secondary text-foreground hover:bg-secondary'
              )}
              onClick={() => {
                setFocusedIndex(idx);
                onServiceSelect(service);
              }}
              onFocus={() => setFocusedIndex(idx)}
            >
              {/* Default compact row: name + path. Two lines. */}
              <span className="w-full min-w-0">
                <span className="block font-medium truncate">
                  {service.name}
                </span>
                <span className="block text-xs font-mono opacity-80 truncate">
                  {service.path}
                </span>
              </span>

              {/* Detail row: method chips + description.
                  - Visible by default when selected (the row is engaged).
                  - Otherwise hidden until hover or keyboard focus inside the row.
                  - Screen readers get the full picture via aria-label above. */}
              <span
                className={cn(
                  'w-full min-w-0 mt-0',
                  selected || isFocused
                    ? 'block'
                    : 'hidden group-hover:block group-focus-within:block'
                )}
              >
                {service.methods.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1">
                    {service.methods.map((method: string) => (
                      <span
                        key={method}
                        className="px-1.5 py-0.5 text-xs rounded font-mono bg-muted text-muted-foreground"
                      >
                        {method.toUpperCase()}
                      </span>
                    ))}
                  </span>
                )}
                {service.description && (
                  <span className="mt-2 block text-xs opacity-80 line-clamp-2">
                    {service.description}
                  </span>
                )}
              </span>
            </Button>
          );
        })}

        {(!services || services.length === 0) && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No services found</p>
          </div>
        )}
      </div>
    </div>
  );
}
