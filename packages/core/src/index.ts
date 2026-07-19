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
    const webApp = app as any;
    // Koa apps expose `.callback()`; everything else is treated as Express.
    const isKoa = typeof webApp.callback === 'function';

    // Response headers scoped to the playground's own routes only. Sets a
    // relaxed CSP for the UI path (the Next.js export uses inline bootstrap
    // scripts that a strict host CSP like helmet's `script-src 'self'` blocks,
    // causing a white screen) and optional CORS for `/services` + the UI path.
    // Registered after the consumer's helmet/CSP so it overrides for our routes
    // while never touching the rest of their app.
    registerPlaygroundHeaders(webApp, isKoa, config.path, config.cors);

    // Service discovery endpoint - a valid Feathers service (exposes `find`).
    app.use('/services', {
      async find() {
        return getServiceInfo(app, config.exposeSchemas);
      },
    });

    // Serve playground UI - Next.js static export bundled in the package.
    if (config.path) {
      const playgroundPath = path.join(__dirname, '..', 'playground');

      if (!fs.existsSync(playgroundPath)) {
        throw new Error(
          `Feathers Playground: Static files not found at ${playgroundPath}. ` +
            'Ensure the playground is built and included in the package.'
        );
      }

      try {
        if (isKoa) {
          registerKoaStatic(webApp, config.path, playgroundPath);
        } else {
          registerExpressStatic(webApp, config.path, playgroundPath);
        }
        console.log(`🎮 Feathers Playground available at ${config.path}`);
      } catch (error) {
        console.error('Error setting up playground static files:', error);
        console.log(
          '🎮 Feathers Playground: API endpoints available, but static UI serving failed'
        );
      }
    }
  };
}

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Resolve a request path (already stripped of the mount prefix) to a file on
// disk, falling back to index.html for SPA client routes. Returns null when the
// request escapes the playground directory.
function resolveStaticFile(playgroundPath: string, relative: string): string | null {
  let rel = relative || '/';
  if (rel === '/' || rel === '') rel = '/index.html';
  const fullPath = path.join(playgroundPath, rel);
  if (!fullPath.startsWith(playgroundPath)) return null; // path traversal guard
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return fullPath;
  }
  const indexPath = path.join(playgroundPath, 'index.html');
  return fs.existsSync(indexPath) ? indexPath : null;
}

// Express: `app.use(path, middleware)` is supported natively.
function registerExpressStatic(
  webApp: any,
  mountPath: string,
  playgroundPath: string
): void {
  let serveStatic: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    serveStatic = require('@feathersjs/express').serveStatic;
  } catch {
    serveStatic = null;
  }

  if (serveStatic) {
    webApp.use(
      mountPath,
      serveStatic(playgroundPath, { index: 'index.html', fallthrough: false })
    );
    return;
  }

  // Fallback: hand-rolled Express middleware (no extra deps required).
  webApp.use(mountPath, (req: any, res: any, next: any) => {
    const requestPath = req.path || req.url || '/';
    const fullPath = resolveStaticFile(playgroundPath, requestPath);
    if (!fullPath) return next ? next() : undefined;
    res.setHeader(
      'Content-Type',
      CONTENT_TYPES[path.extname(fullPath).toLowerCase()] ||
        'application/octet-stream'
    );
    fs.createReadStream(fullPath).pipe(res);
  });
}

// Koa: `app.use(path, obj)` registers a Feathers *service* (that is what caused
// the original "Invalid service object" crash). Static files must be a single
// argument Koa middleware. Prefer koa-mount + koa-static, else hand-roll one.
function registerKoaStatic(
  webApp: any,
  mountPath: string,
  playgroundPath: string
): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serve = require('koa-static');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mount = require('koa-mount');
    webApp.use(mount(mountPath, serve(playgroundPath, { index: 'index.html' })));
    return;
  } catch {
    // koa-static / koa-mount not installed - fall through to hand-rolled.
  }

  webApp.use(async (ctx: any, next: any) => {
    if (ctx.path !== mountPath && !ctx.path.startsWith(mountPath + '/')) {
      return next();
    }
    const relative = ctx.path.slice(mountPath.length) || '/';
    const fullPath = resolveStaticFile(playgroundPath, relative);
    if (!fullPath) return next();
    ctx.type =
      CONTENT_TYPES[path.extname(fullPath).toLowerCase()] ||
      'application/octet-stream';
    ctx.body = fs.createReadStream(fullPath);
  });
}

// Response headers for the playground's own routes: a relaxed CSP for the UI
// (so the Next.js static export's inline scripts run under a strict host CSP)
// and optional CORS. Scoped by path so the consumer's other routes are
// untouched.
function registerPlaygroundHeaders(
  webApp: any,
  isKoa: boolean,
  mountPath: string,
  cors: boolean
): void {
  const inCorsScope = (p: string) =>
    p === '/services' || p.startsWith('/services/') || p.startsWith(mountPath);
  const inUiScope = (p: string) => !!mountPath && p.startsWith(mountPath);
  const methods = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
  const allowHeaders =
    'Origin, X-Requested-With, Content-Type, Accept, Authorization';
  // Relaxed policy for the dev-tool UI only. `unsafe-inline`/`unsafe-eval`
  // cover Next.js bootstrap + runtime; `connect-src *` lets it call any API.
  const csp =
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' *";

  if (isKoa) {
    webApp.use(async (ctx: any, next: any) => {
      if (inUiScope(ctx.path)) {
        ctx.set('Content-Security-Policy', csp);
      }
      if (cors && inCorsScope(ctx.path)) {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', methods);
        ctx.set('Access-Control-Allow-Headers', allowHeaders);
        if (ctx.method === 'OPTIONS') {
          ctx.status = 204;
          return;
        }
      }
      await next();
    });
  } else {
    webApp.use((req: any, res: any, next: any) => {
      const p = req.path || req.url || '';
      if (inUiScope(p)) {
        res.setHeader('Content-Security-Policy', csp);
      }
      if (cors && inCorsScope(p)) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', methods);
        res.setHeader('Access-Control-Allow-Headers', allowHeaders);
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }
      }
      next();
    });
  }
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
