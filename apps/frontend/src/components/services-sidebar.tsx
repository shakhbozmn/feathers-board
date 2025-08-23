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
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Failed to load services. Make sure the backend is running.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Services</h2>
        <p className="text-sm text-muted-foreground">
          {services?.length || 0} service(s) available
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        {services?.map((service) => (
          <Button
            key={service.name}
            variant={selectedService?.name === service.name ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start h-auto p-3 text-left',
              selectedService?.name === service.name && 'bg-primary text-primary-foreground'
            )}
            onClick={() => onServiceSelect(service)}
          >
            <div className="flex flex-col items-start space-y-1">
              <div className="font-medium">{service.name}</div>
              <div className="text-xs opacity-70">{service.path}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {service.methods.map((method) => (
                  <span
                    key={method}
                    className={cn(
                      'px-1.5 py-0.5 text-xs rounded font-mono',
                      selectedService?.name === service.name
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {method.toUpperCase()}
                  </span>
                ))}
              </div>
              {service.description && (
                <div className="text-xs opacity-60 mt-1">
                  {service.description}
                </div>
              )}
            </div>
          </Button>
        ))}

        {(!services || services.length === 0) && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No services found</p>
          </div>
        )}
      </div>
    </div>
  );
}