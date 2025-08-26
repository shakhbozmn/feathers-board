import { ServiceInfo, ServiceMethod } from '@feathers-playground/types';
import { Application } from '@feathersjs/feathers';
import * as fs from 'fs';
import * as path from 'path';

export interface PlaygroundOptions {
  path?: string;
  exposeSchemas?: boolean;
  title?: string;
  description?: string;
  version?: string;
  apiUrl?: string;
  cors?: boolean;
  authentication?: {
    enabled: boolean;
    strategies?: string[];
  };
}

export function playground(options: PlaygroundOptions = {}) {
  const config: Required<PlaygroundOptions> = {
    path: '/playground',
    exposeSchemas: true,
    title: 'Feathers Playground',
    description: 'API Testing Playground',
    version: '1.0.0',
    apiUrl: '',
    cors: true,
    authentication: {
      enabled: false,
      strategies: [],
    },
    ...options,
  };

  return (app: Application) => {
    // Service discovery endpoint - using Feathers service pattern
    app.use('/services', {
      async find() {
        const services = getServiceInfo(app, config.exposeSchemas);
        return services;
      },
    });

    // Serve playground UI - Next.js static files only
    if (config.path) {
      const playgroundPath = path.join(__dirname, '..', 'playground');
      const expressApp = app as any;

      // Ensure this is an Express app and playground files exist
      if (
        expressApp.use &&
        typeof expressApp.use === 'function' &&
        fs.existsSync(playgroundPath)
      ) {
        try {
          // Check if serveStatic is available directly from the app
          if (typeof require !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const express = require('@feathersjs/express');
            if (express.serveStatic) {
              expressApp.use(
                config.path,
                express.serveStatic(playgroundPath, {
                  index: 'index.html',
                  fallthrough: false,
                })
              );
              console.log(`🎮 Feathers Playground available at ${config.path}`);
              return;
            }
          }
        } catch (error) {
          console.error('Error setting up playground static files:', error);
          throw new Error(
            'Failed to configure Feathers Playground. Ensure @feathersjs/express is available.'
          );
        }
      } else {
        throw new Error(
          `Feathers Playground: Static files not found at ${playgroundPath}. ` +
            'Ensure the playground is built and included in the package.'
        );
      }
    }

    // Add CORS headers if enabled using hooks
    if (config.cors) {
      app.hooks({
        before: {
          all: [
            (context: any) => {
              if (context.params.provider && context.params.headers) {
                context.params.headers['Access-Control-Allow-Origin'] = '*';
                context.params.headers['Access-Control-Allow-Methods'] =
                  'GET, POST, PUT, PATCH, DELETE, OPTIONS';
                context.params.headers['Access-Control-Allow-Headers'] =
                  'Origin, X-Requested-With, Content-Type, Accept, Authorization';
              }
              return context;
            },
          ],
        },
      });
    }
  };
}

function getServiceInfo(
  app: Application,
  exposeSchemas: boolean
): ServiceInfo[] {
  const services: ServiceInfo[] = [];

  // Get all registered services
  for (const [path, service] of Object.entries(app.services)) {
    if (path === '/services') continue; // Skip our own service discovery endpoint

    const methods: ServiceMethod[] = [];
    const typedService = service as any;

    // Check which methods are available
    if (typeof typedService.find === 'function') methods.push('find');
    if (typeof typedService.get === 'function') methods.push('get');
    if (typeof typedService.create === 'function') methods.push('create');
    if (typeof typedService.patch === 'function') methods.push('patch');
    if (typeof typedService.remove === 'function') methods.push('remove');

    const serviceInfo: ServiceInfo = {
      name: path.replace('/', ''),
      path,
      methods,
    };

    // Add schema if available and enabled
    if (exposeSchemas && typedService.schema) {
      serviceInfo.schema = typedService.schema;
    }

    // Add description if available
    if (typedService.description) {
      serviceInfo.description = typedService.description;
    }

    services.push(serviceInfo);
  }

  return services;
}

// Utility function to extract schema from Zod or other validation libraries
export function extractSchema(validator: any): any {
  // This would be implemented to extract JSON schema from various validation libraries
  // For now, return a basic schema structure
  if (validator && typeof validator === 'object') {
    return validator;
  }
  return null;
}

export default playground;
