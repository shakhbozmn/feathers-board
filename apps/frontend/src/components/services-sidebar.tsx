'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useServices } from '@/hooks/use-services';
import { cn } from '@/lib/utils';
import { ServiceInfo } from '@feathers-playground/types';

interface ServicesSidebarProps {
  selectedService: ServiceInfo | null;
  onServiceSelect: (service: ServiceInfo) => void;
}

export function ServicesSidebar({
  selectedService,
  onServiceSelect,
}: ServicesSidebarProps) {
  const { data: services, isLoading, error } = useServices();

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
      (error as { message?: string })?.message ??
      'Could not reach the API.';
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive text-base">
              Couldn’t load services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Check that the backend is running and that{' '}
              <code className="font-mono">NEXT_PUBLIC_API_URL</code> points to
              it.
            </p>
          </CardContent>
        </Card>
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
      >
        {services?.map((service: ServiceInfo) => {
          const selected = selectedService?.name === service.name;
          return (
            <Button
              key={service.name}
              variant={selected ? 'default' : 'ghost'}
              role="option"
              aria-selected={selected}
              className={cn(
                'w-full justify-start h-auto min-h-[44px] p-3 text-left',
                selected && 'bg-primary-strong text-primary-foreground hover:bg-primary-strong-hover'
              )}
              onClick={() => onServiceSelect(service)}
            >
              <div className="flex flex-col items-start space-y-1 w-full min-w-0">
                <div className="font-medium truncate w-full">{service.name}</div>
                <div className="text-xs opacity-80 font-mono truncate w-full">
                  {service.path}
                </div>
                {service.methods.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {service.methods.map((method: string) => (
                      <span
                        key={method}
                        className={cn(
                          'px-1.5 py-0.5 text-xs rounded font-mono',
                          selected
                            ? 'bg-primary-foreground/15 text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {method.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
                {service.description && (
                  <div className="text-xs opacity-75 mt-1 line-clamp-2 w-full">
                    {service.description}
                  </div>
                )}
              </div>
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
