import {
  PlaygroundConfig,
  ServiceInfo,
  ServiceMethod,
} from '@feathers-playground/types';
import { Application } from '@feathersjs/feathers';

export interface PlaygroundOptions extends PlaygroundConfig {
  path?: string;
  exposeSchemas?: boolean;
  title?: string;
  description?: string;
  version?: string;
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

    // Serve playground UI (embedded mode) - using Feathers service pattern
    if (config.path) {
      app.use(config.path, {
        async find() {
          return { html: servePlaygroundUIContent(config) };
        },
      });
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
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        h1 {
            margin-bottom: 0.5rem;
        }
        p {
            margin-bottom: 2rem;
            opacity: 0.9;
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
        }
        .button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🪶✨</div>
        <h1>${config.title}</h1>
        <p>${config.description}</p>
        <p>To use the full playground interface, please run the standalone frontend application.</p>
        <a href="/services" class="button">View Services API</a>
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
