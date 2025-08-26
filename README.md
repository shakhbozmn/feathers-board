# Feathers Playground 🪶✨

A **Interactive API playground and testing environment for FeathersJS v5 applications**. This tool allows developers to:

- Visualize Feathers services & schemas
- Test API requests directly from the browser
- Use in **embedded mode** (inside their Feathers app) or **standalone mode**

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

### Option 1: Add to Existing Feathers App (Recommended)

```bash
npm install feathers-playground
```

```typescript
import { playground } from 'feathers-playground';

// Add to your Feathers app
app.configure(
  playground({
    path: '/playground',
    title: 'My API Playground',
  })
);
```

Visit `http://localhost:3030/playground` to access the playground.

### Option 2: Development Setup (Contributors)

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

The backend will be available at `http://localhost:3030` and the frontend at `http://localhost:3000`.

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

### Standalone Mode

For testing external APIs or when you can't modify the Feathers app:

```bash
git clone https://github.com/shakhbozmn/feathers-board.git
cd feathers-playground
pnpm install && pnpm build

# Point to your API
export NEXT_PUBLIC_API_URL=http://your-api-url:3030
pnpm --filter @feathers-playground/frontend dev
```

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

- [ ] Auto-generate forms from JSON schemas
- [ ] Export/import request collections (Postman-like)
- [ ] Dark/light mode toggle
- [ ] Plugin system for auth strategies
- [ ] WebSocket support for real-time testing
- [ ] Request history and favorites
- [ ] API documentation generation

## 🐛 Issues & Support

Please report issues on the [GitHub Issues](https://github.com/shakhbozmn/feathers-board/issues) page.
