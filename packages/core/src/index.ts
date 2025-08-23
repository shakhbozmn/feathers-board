import { PlaygroundConfig, ServiceInfo, ServiceMethod } from '@feathers-playground/types';
import { Application } from '@feathersjs/feathers';
import { NextFunction, Request, Response } from 'express';

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
    // Service discovery endpoint
    app.use('/services', (req: Request, res: Response) => {
      const services = getServiceInfo(app, config.exposeSchemas);
      res.json(services);
    });

    // Serve playground UI (embedded mode)
    if (config.path) {
      app.use(config.path, servePlaygroundUI(config));
    }

    // Add CORS headers if enabled
    if (config.cors) {
      app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    }
  };
}

function getServiceInfo(app: Application, exposeSchemas: boolean): ServiceInfo[] {
  const services: ServiceInfo[] = [];
  
  // Get all registered services
  for (const [path, service] of Object.entries(app.services)) {
    if (path === '/services') continue; // Skip our own service discovery endpoint
    
    const methods: ServiceMethod[] = [];
    
    // Check which methods are available
    if (typeof service.find === 'function') methods.push('find');
    if (typeof service.get === 'function') methods.push('get');
    if (typeof service.create === 'function') methods.push('create');
    if (typeof service.patch === 'function') methods.push('patch');
    if (typeof service.remove === 'function') methods.push('remove');

    const serviceInfo: ServiceInfo = {
      name: path.replace('/', ''),
      path,
      methods,
    };

    // Add schema if available and enabled
    if (exposeSchemas && service.schema) {
      serviceInfo.schema = service.schema;
    }

    // Add description if available
    if (service.description) {
      serviceInfo.description = service.description;
    }

    services.push(serviceInfo);
  }

  return services;
}

function servePlaygroundUI(config: Required<PlaygroundOptions>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // In embedded mode, we would serve the built frontend files
    // For now, we'll serve a simple HTML page that redirects to the standalone app
    const html = `
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

    res.send(html);
  };
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