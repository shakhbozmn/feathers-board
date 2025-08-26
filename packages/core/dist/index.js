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
        // Serve playground UI
        if (config.path) {
            const playgroundPath = path.join(__dirname, '..', 'playground');
            const expressApp = app;
            // Try to serve static Next.js files if this is an Express app and files exist
            if (expressApp.use &&
                typeof expressApp.use === 'function' &&
                fs.existsSync(playgroundPath)) {
                try {
                    const express = require('@feathersjs/express');
                    if (express.serveStatic) {
                        expressApp.use(config.path, express.serveStatic(playgroundPath, {
                            index: 'index.html',
                            fallthrough: false,
                        }));
                        console.log(`🎮 Feathers Playground (Next.js UI) available at ${config.path}`);
                        return;
                    }
                }
                catch {
                    // Fall through to HTML serving
                }
            }
            // Fallback to HTML serving with improved instructions
            app.use(config.path, {
                async find() {
                    return { html: servePlaygroundUIContent(config) };
                },
            });
            console.log(`🎮 Feathers Playground (HTML fallback) available at ${config.path}`);
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
function servePlaygroundUIContent(config) {
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
function extractSchema(validator) {
    // This would be implemented to extract JSON schema from various validation libraries
    // For now, return a basic schema structure
    if (validator && typeof validator === 'object') {
        return validator;
    }
    return null;
}
exports.default = playground;
