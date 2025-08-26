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

    // Serve playground UI - Next.js static files
    if (config.path) {
      const playgroundPath = path.join(__dirname, '..', 'playground');

      if (!fs.existsSync(playgroundPath)) {
        throw new Error(
          `Feathers Playground: Static files not found at ${playgroundPath}. ` +
            'Ensure the playground is built and included in the package.'
        );
      }

      try {
        const webApp = app as any;

        // Try to detect if this is Express or Koa and configure accordingly
        if (webApp.use && typeof webApp.use === 'function') {
          let staticMiddleware = null;

          // Try Express first
          try {
            if (typeof require !== 'undefined') {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const express = require('@feathersjs/express');
              if (express.serveStatic) {
                staticMiddleware = express.serveStatic(playgroundPath, {
                  index: 'index.html',
                  fallthrough: false,
                });
              }
            }
          } catch (expressError) {
            // Express not available, try Koa
          }

          // If Express static serving failed, try Koa
          if (!staticMiddleware) {
            try {
              if (typeof require !== 'undefined') {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const koaStatic = require('koa-static');
                staticMiddleware = koaStatic(playgroundPath);
              }
            } catch (koaError) {
              // Neither Express nor Koa static serving available
            }
          }

          // If we have static middleware, use it
          if (staticMiddleware) {
            webApp.use(config.path, staticMiddleware);
            console.log(`🎮 Feathers Playground available at ${config.path}`);
          } else {
            // Fallback: Use a simple custom middleware for static file serving
            const staticHandler = (req: any, res: any, next: any) => {
              const requestPath = req.path || req.url || '/';
              const relativePath = requestPath.replace(config.path, '') || '/';
              let filePath =
                relativePath === '/' ? '/index.html' : relativePath;

              const fullPath = path.join(playgroundPath, filePath);

              // Security check
              if (!fullPath.startsWith(playgroundPath)) {
                if (next) next();
                return;
              }

              // Serve file if it exists
              if (fs.existsSync(fullPath)) {
                const ext = path.extname(fullPath).toLowerCase();
                const contentTypes: Record<string, string> = {
                  '.html': 'text/html',
                  '.js': 'application/javascript',
                  '.css': 'text/css',
                  '.json': 'application/json',
                  '.png': 'image/png',
                  '.jpg': 'image/jpeg',
                  '.jpeg': 'image/jpeg',
                  '.gif': 'image/gif',
                  '.svg': 'image/svg+xml',
                  '.woff': 'font/woff',
                  '.woff2': 'font/woff2',
                };

                const contentType =
                  contentTypes[ext] || 'application/octet-stream';
                const isBinary = [
                  '.png',
                  '.jpg',
                  '.jpeg',
                  '.gif',
                  '.woff',
                  '.woff2',
                ].includes(ext);

                if (res.setHeader) {
                  res.setHeader('Content-Type', contentType);
                }

                if (res.send) {
                  // Express-style response
                  const content = isBinary
                    ? fs.readFileSync(fullPath)
                    : fs.readFileSync(fullPath, 'utf8');
                  res.send(content);
                } else if (res.body !== undefined) {
                  // Koa-style response
                  res.body = isBinary
                    ? fs.readFileSync(fullPath)
                    : fs.readFileSync(fullPath, 'utf8');
                }
              } else if (filePath !== '/index.html') {
                // For SPA, serve index.html for non-existent routes
                const indexPath = path.join(playgroundPath, 'index.html');
                if (fs.existsSync(indexPath)) {
                  if (res.setHeader) {
                    res.setHeader('Content-Type', 'text/html');
                  }
                  const indexContent = fs.readFileSync(indexPath, 'utf8');
                  if (res.send) {
                    res.send(indexContent);
                  } else if (res.body !== undefined) {
                    res.body = indexContent;
                  }
                } else if (next) {
                  next();
                }
              } else if (next) {
                next();
              }
            };

            webApp.use(config.path, staticHandler);
            console.log(
              `🎮 Feathers Playground available at ${config.path} (using fallback static serving)`
            );
          }
        } else {
          console.warn(
            '🎮 Feathers Playground: Cannot serve static files - web framework not detected'
          );
        }
      } catch (error) {
        console.error('Error setting up playground static files:', error);
        console.log(
          '🎮 Feathers Playground: API endpoints available, but static UI serving failed'
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
