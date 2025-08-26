# Feathers Playground 🪶✨

An **Interactive API playground and testing environment for FeathersJS v5 applications**. Built with Next.js and automatically integrated into your Feathers app with a single configuration line.

## ✨ What's New in v1.0.2

🎉 **Zero-Config Rich UI**: Installing `feathers-playground` now automatically serves a **full Next.js interface** at your `/playground` route - no separate processes needed!

- **Before**: Basic HTML page with limited functionality
- **Now**: Rich, interactive UI with service discovery, schema visualization, and request testing
- **Setup**: Just `npm install feathers-playground` and add one configuration line

## 🎯 Key Features

- 🚀 **One-line integration** - Add rich playground UI to any Feathers v5 app
- 🎨 **Beautiful Next.js Interface** - Modern UI built with TailwindCSS & shadcn/ui
- 🔍 **Auto Service Discovery** - Automatically detects all your services and methods
- 📋 **Schema Visualization** - Shows JSON schemas for better API understanding
- 🛠 **Interactive Request Builder** - Build and test API requests with forms
- 📊 **Response Viewer** - Pretty-print JSON responses with syntax highlighting
- 📱 **Responsive Design** - Works perfectly on desktop and mobile

## 🎯 Features

### Service Discovery

- Backend exposes `/services` endpoint listing:
  - Service name and path
  - Supported methods (find, get, create, patch, remove)
  - JSON schema (if available)

### Request Playground

- **Sidebar**: List all services with method indicators
- **Schema viewer**: Shows JSON schema for selected service
- **Request builder**: Dynamic form for query/body, headers, auth token
- **Response viewer**: Pretty JSON with syntax highlighting

### Modes

- **Embedded**: `app.configure(playground({ path: '/playground' }))` mounts UI inside Feathers app
- **Standalone**: Run Next.js app separately, point it to any Feathers API URL

## 📦 Tech Stack

- **Backend** (`apps/backend`)
  - Feathers v5 + Express + TypeScript
  - Zod validation
  - In-memory data stores (users, messages)

- **Frontend** (`apps/frontend`)
  - Next.js 15 (App Router) + TypeScript
  - TailwindCSS + shadcn/ui components
  - React Query for API state management
  - react-json-view for response display

- **Monorepo**
  - pnpm workspaces + Turborepo
  - Shared types in `packages/types`
  - Core integration logic in `packages/core`

## 📦 NPM Packages

Feathers Playground is available as NPM packages for easy integration:

- **`feathers-playground`** - Core integration package
- **`@feathers-playground/types`** - TypeScript types (optional)

## 🚀 Quick Start

### Add to Your Feathers App (2 steps!)

**1. Install the package**

```bash
npm install feathers-playground
```

**2. Add to your Feathers app**

```typescript
import { playground } from 'feathers-playground';

// Add this after your services are configured
app.configure(
  playground({
    path: '/playground',        // Where to mount the UI
    title: 'My API Playground', // Custom title
    description: 'Test my awesome API', // Custom description
    exposeSchemas: true,        // Include JSON schemas
  })
);
```

**3. That's it!** Visit `http://localhost:3030/playground` and enjoy the full Next.js playground interface.

### What You Get

- 🎨 **Rich UI**: Full Next.js interface with beautiful design
- 📋 **Service Browser**: All your services listed with available methods
- 🔍 **Schema Viewer**: JSON schema documentation for each service
- 🛠 **Request Builder**: Interactive forms to build API requests
- 📊 **Response Viewer**: Formatted JSON responses with error handling

### Development Setup (Contributors)

```bash
# Clone the repository
git clone https://github.com/shakhbozmn/feathers-board.git
cd feathers-playground

# Install dependencies
pnpm install

# Build packages
pnpm build

# Start development servers
pnpm dev
```

The backend will be available at `http://localhost:3030` with the playground at `http://localhost:3030/playground`.

## 🛠 Usage Examples

### Basic Integration

```typescript
import { feathers } from '@feathersjs/feathers';
import express, { rest, json, cors } from '@feathersjs/express';
import { playground } from 'feathers-playground';

const app = express(feathers());

app.use(cors());
app.use(json());
app.configure(rest());

// Your services
app.use('/users', new UsersService());
app.use('/posts', new PostsService());

// Add playground
app.configure(
  playground({
    path: '/api-playground',
    title: 'My Blog API',
    description: 'Test the blog API endpoints',
    exposeSchemas: true,
  })
);

app.listen(3030);
```

### Production Setup

```typescript
// Only enable in development
if (process.env.NODE_ENV === 'development') {
  app.configure(
    playground({
      path: '/playground',
      title: 'Development API Playground',
    })
  );
}
```

### Advanced: Standalone Mode

For development or testing external APIs:

```bash
git clone https://github.com/shakhbozmn/feathers-board.git
cd feathers-playground
pnpm install && pnpm build

# Point to your API
export NEXT_PUBLIC_API_URL=http://your-api-url:3030
pnpm --filter @feathers-playground/frontend dev
```

This runs the playground as a separate Next.js app on `http://localhost:3000`.

📖 **See [USAGE.md](./USAGE.md) for detailed examples and configuration options.**

## 📁 Project Structure

```
feathers-playground/
├── apps/
│   ├── backend/          # Feathers v5 API server
│   │   ├── src/
│   │   │   ├── app.ts    # Main application
│   │   │   ├── services/ # Example services
│   │   │   └── channels.ts
│   │   └── package.json
│   └── frontend/         # Next.js playground UI
│       ├── src/
│       │   ├── app/      # App Router pages
│       │   ├── components/ # UI components
│       │   ├── hooks/    # React hooks
│       │   └── lib/      # Utilities
│       └── package.json
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── core/             # Playground integration
├── .github/workflows/    # CI/CD
└── package.json
```

## 🔧 API Reference

### Service Discovery Endpoint

`GET /services` returns an array of service information:

```json
[
  {
    "name": "users",
    "path": "/users",
    "methods": ["find", "get", "create", "patch", "remove"],
    "schema": {
      "type": "object",
      "properties": {
        "email": { "type": "string", "format": "email" },
        "name": { "type": "string" }
      }
    },
    "description": "User management service"
  }
]
```

### Configuration Options

```typescript
interface PlaygroundConfig {
  path?: string; // Mount path (default: '/playground')
  exposeSchemas?: boolean; // Include schemas in discovery (default: true)
  title?: string; // Playground title
  description?: string; // Playground description
  cors?: boolean; // Enable CORS (default: true)
}
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @feathers-playground/backend test
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🎁 Roadmap

- [x] **Rich Next.js UI** - Full-featured playground interface
- [x] **One-line Integration** - Zero-config setup for Feathers apps
- [ ] Auto-generate forms from JSON schemas
- [ ] Export/import request collections (Postman-like)
- [ ] Dark/light mode toggle
- [ ] Plugin system for auth strategies
- [ ] WebSocket support for real-time testing
- [ ] Request history and favorites
- [ ] API documentation generation

## 🐛 Issues & Support

Please report issues on the [GitHub Issues](https://github.com/shakhbozmn/feathers-board/issues) page.
