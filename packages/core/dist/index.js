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
            const expressApp = app;
            // Ensure this is an Express app and playground files exist
            if (expressApp.use &&
                typeof expressApp.use === 'function' &&
                fs.existsSync(playgroundPath)) {
                try {
                    // Check if serveStatic is available directly from the app
                    if (typeof require !== 'undefined') {
                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        const express = require('@feathersjs/express');
                        if (express.serveStatic) {
                            expressApp.use(config.path, express.serveStatic(playgroundPath, {
                                index: 'index.html',
                                fallthrough: false,
                            }));
                            console.log(`🎮 Feathers Playground available at ${config.path}`);
                            return;
                        }
                    }
                }
                catch (error) {
                    console.error('Error setting up playground static files:', error);
                    throw new Error('Failed to configure Feathers Playground. Ensure @feathersjs/express is available.');
                }
            }
            else {
                throw new Error(`Feathers Playground: Static files not found at ${playgroundPath}. ` +
                    'Ensure the playground is built and included in the package.');
            }
        }
        // Add CORS headers if enabled using hooks
        if (config.cors) {
            app.hooks({
                before: {
                    all: [
                        (context) => {
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
