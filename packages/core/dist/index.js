"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.playground = playground;
exports.extractSchema = extractSchema;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function playground(options = {}) {
    const config = {
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
    return (app) => {
        const webApp = app;
        // Koa apps expose `.callback()`; everything else is treated as Express.
        const isKoa = typeof webApp.callback === 'function';
        // CORS for the playground's own endpoints (`/services` + the UI path).
        // Scoped on purpose: we never touch CORS on the consumer's other routes.
        if (config.cors) {
            registerPlaygroundCors(webApp, isKoa, config.path);
        }
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
                throw new Error(`Feathers Playground: Static files not found at ${playgroundPath}. ` +
                    'Ensure the playground is built and included in the package.');
            }
            try {
                if (isKoa) {
                    registerKoaStatic(webApp, config.path, playgroundPath);
                }
                else {
                    registerExpressStatic(webApp, config.path, playgroundPath);
                }
                console.log(`🎮 Feathers Playground available at ${config.path}`);
            }
            catch (error) {
                console.error('Error setting up playground static files:', error);
                console.log('🎮 Feathers Playground: API endpoints available, but static UI serving failed');
            }
        }
    };
}
const CONTENT_TYPES = {
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
function resolveStaticFile(playgroundPath, relative) {
    let rel = relative || '/';
    if (rel === '/' || rel === '')
        rel = '/index.html';
    const fullPath = path.join(playgroundPath, rel);
    if (!fullPath.startsWith(playgroundPath))
        return null; // path traversal guard
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return fullPath;
    }
    const indexPath = path.join(playgroundPath, 'index.html');
    return fs.existsSync(indexPath) ? indexPath : null;
}
// Express: `app.use(path, middleware)` is supported natively.
function registerExpressStatic(webApp, mountPath, playgroundPath) {
    let serveStatic;
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        serveStatic = require('@feathersjs/express').serveStatic;
    }
    catch {
        serveStatic = null;
    }
    if (serveStatic) {
        webApp.use(mountPath, serveStatic(playgroundPath, { index: 'index.html', fallthrough: false }));
        return;
    }
    // Fallback: hand-rolled Express middleware (no extra deps required).
    webApp.use(mountPath, (req, res, next) => {
        const requestPath = req.path || req.url || '/';
        const fullPath = resolveStaticFile(playgroundPath, requestPath);
        if (!fullPath)
            return next ? next() : undefined;
        res.setHeader('Content-Type', CONTENT_TYPES[path.extname(fullPath).toLowerCase()] ||
            'application/octet-stream');
        fs.createReadStream(fullPath).pipe(res);
    });
}
// Koa: `app.use(path, obj)` registers a Feathers *service* (that is what caused
// the original "Invalid service object" crash). Static files must be a single
// argument Koa middleware. Prefer koa-mount + koa-static, else hand-roll one.
function registerKoaStatic(webApp, mountPath, playgroundPath) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serve = require('koa-static');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mount = require('koa-mount');
        webApp.use(mount(mountPath, serve(playgroundPath, { index: 'index.html' })));
        return;
    }
    catch {
        // koa-static / koa-mount not installed - fall through to hand-rolled.
    }
    webApp.use(async (ctx, next) => {
        if (ctx.path !== mountPath && !ctx.path.startsWith(mountPath + '/')) {
            return next();
        }
        const relative = ctx.path.slice(mountPath.length) || '/';
        const fullPath = resolveStaticFile(playgroundPath, relative);
        if (!fullPath)
            return next();
        ctx.type =
            CONTENT_TYPES[path.extname(fullPath).toLowerCase()] ||
                'application/octet-stream';
        ctx.body = fs.createReadStream(fullPath);
    });
}
// Real response-header CORS, scoped to playground endpoints only.
function registerPlaygroundCors(webApp, isKoa, mountPath) {
    const inScope = (p) => p === '/services' || p.startsWith('/services/') || p.startsWith(mountPath);
    const methods = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    const headers = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    if (isKoa) {
        webApp.use(async (ctx, next) => {
            if (inScope(ctx.path)) {
                ctx.set('Access-Control-Allow-Origin', '*');
                ctx.set('Access-Control-Allow-Methods', methods);
                ctx.set('Access-Control-Allow-Headers', headers);
                if (ctx.method === 'OPTIONS') {
                    ctx.status = 204;
                    return;
                }
            }
            await next();
        });
    }
    else {
        webApp.use((req, res, next) => {
            const p = req.path || req.url || '';
            if (inScope(p)) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', methods);
                res.setHeader('Access-Control-Allow-Headers', headers);
                if (req.method === 'OPTIONS') {
                    res.statusCode = 204;
                    return res.end();
                }
            }
            next();
        });
    }
}
function getServiceInfo(app, exposeSchemas) {
    const services = [];
    // Get all registered services
    for (const [path, service] of Object.entries(app.services)) {
        if (path === '/services')
            continue; // Skip our own service discovery endpoint
        const methods = [];
        const typedService = service;
        // Check which methods are available
        if (typeof typedService.find === 'function')
            methods.push('find');
        if (typeof typedService.get === 'function')
            methods.push('get');
        if (typeof typedService.create === 'function')
            methods.push('create');
        if (typeof typedService.patch === 'function')
            methods.push('patch');
        if (typeof typedService.remove === 'function')
            methods.push('remove');
        const serviceInfo = {
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
function extractSchema(validator) {
    // This would be implemented to extract JSON schema from various validation libraries
    // For now, return a basic schema structure
    if (validator && typeof validator === 'object') {
        return validator;
    }
    return null;
}
exports.default = playground;
