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

    // Serve playground UI
    if (config.path) {
      const playgroundPath = path.join(__dirname, '..', 'playground');
      const expressApp = app as any;

      // Try to serve static Next.js files if this is an Express app and files exist
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
              console.log(
                `🎮 Feathers Playground (Next.js UI) available at ${config.path}`
              );
              return;
            }
          }
        } catch {
          console.log(
            'Could not load @feathersjs/express for static serving, falling back to HTML serving'
          );
        }
      }

      // Fallback to HTML serving as Express middleware (not Feathers service)
      if (expressApp.get && typeof expressApp.get === 'function') {
        // This is an Express app, use Express middleware
        expressApp.get(config.path, (req: any, res: any) => {
          res.type('html').send(servePlaygroundUIContent(config));
        });
        console.log(
          `🎮 Feathers Playground (HTML fallback) available at ${config.path}`
        );
      } else {
        // Fallback for non-Express apps - register as Feathers service
        app.use(config.path, {
          async find() {
            return { html: servePlaygroundUIContent(config) };
          },
        });
        console.log(
          `🎮 Feathers Playground (Feathers service fallback) available at ${config.path}`
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

function servePlaygroundUIContent(config: Required<PlaygroundOptions>): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
            max-width: 600px;
            width: 100%;
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        h1 {
            margin-bottom: 0.5rem;
        }
        p {
            margin-bottom: 1rem;
            opacity: 0.9;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
            margin: 0.5rem;
        }
        .button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .code {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            margin: 1rem 0;
            text-align: left;
            font-size: 0.9rem;
        }
        .upgrade-section {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🪶✨</div>
        <h1>${config.title}</h1>
        <p>${config.description}</p>
        
        <a href="/services" class="button">View Services API</a>
        
        <div class="upgrade-section">
            <h3>🚀 Upgrade to Full UI</h3>
            <p>For a rich, interactive playground experience, serve the Next.js static files at this route.</p>
            
            <div class="code">
// Add this to your app configuration:<br>
import path from 'path';<br><br>
const playgroundPath = path.resolve(__dirname, '../node_modules/feathers-playground/playground');<br>
app.use('${config.path}', serveStatic(playgroundPath, {<br>
&nbsp;&nbsp;index: 'index.html',<br>
&nbsp;&nbsp;fallthrough: false<br>
}));
            </div>
            
            <p><small>This will replace this page with a full-featured API testing interface built with Next.js.</small></p>
        </div>
    </div>
</body>
</html>
  `;
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
