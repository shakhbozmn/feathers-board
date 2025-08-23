# Feathers Playground 🪶✨

A **Swagger UI + Postman–like playground for Feathers v5**.  
This tool allows developers to:
- Visualize Feathers services & schemas.
- Test API requests directly from the browser.
- Use in **embedded mode** (inside their Feathers app) or **standalone mode**.

---

## 🎯 Goals
1. **Service Discovery**
   - Backend exposes `/services` endpoint listing:
     - Service name
     - Path
     - Supported methods (find, get, create, patch, remove)
     - JSON schema (if available)

2. **Request Playground**
   - Sidebar: list all services
   - Schema viewer: shows JSON schema for selected service
   - Request builder: dynamic form (query/body, headers, auth token)
   - Response viewer: pretty JSON (highlighted)

3. **Modes**
   - **Embedded**: `app.configure(playground({ path: '/playground' }))` mounts UI inside Feathers app.
   - **Standalone**: run Next.js app separately, point it to any Feathers API URL.

---

## 📦 Tech Stack
- **Backend (apps/backend)**
  - Feathers v5
  - Express
  - TypeScript
  - Zod (optional validation)
- **Frontend (apps/frontend)**
  - Next.js (App Router, TypeScript)
  - TailwindCSS + shadcn/ui
  - React Query
  - react-json-view
- **Monorepo**
  - pnpm workspaces
  - Turborepo (preferred, Nx also ok)
  - Shared types in `packages/types`

---

## 🗂 Folder Structure

feathers-playground/
│
├── apps/
│ ├── backend/ # Feathers v5 app
│ │ ├── src/
│ │ │ ├── app.ts # Feathers setup
│ │ │ ├── services.ts # Service discovery endpoint
│ │ │ └── services/ # Example services (users, messages)
│ │ ├── test/ # Backend tests
│ │ └── package.json
│ │
│ └── frontend/ # Next.js playground UI
│ ├── app/ # App Router pages
│ │ ├── layout.tsx
│ │ ├── page.tsx # Dashboard
│ │ ├── [service]/ # Service detail pages
│ ├── components/ # UI components
│ ├── hooks/ # React hooks (useServices, useRequest)
│ ├── lib/ # API client, utils
│ └── package.json
│
├── packages/
│ ├── core/ # Playground integration logic
│ ├── types/ # Shared TypeScript types
│ └── package.json
│
├── .github/
│ ├── workflows/
│ │ ├── ci.yml # lint, test, build
│
├── README.md
├── CONTRIBUTING.md
├── LICENSE (MIT)
├── tsconfig.json
└── package.json

yaml
Copy
Edit

---

## 🔑 Features

### Backend
- Service discovery endpoint (`/services`):
  ```json
  [
    {
      "name": "users",
      "path": "/users",
      "methods": ["find", "get", "create", "patch", "remove"],
      "schema": { "properties": { "email": { "type": "string" } } }
    }
  ]
Example services: users, messages.

Configurable middleware.

Frontend
Sidebar → list services

Schema viewer → JSON schema

Request builder → inputs for query/body/headers

Response viewer → pretty JSON with syntax highlighting

Auth token input

🛠 Development Best Practices
TypeScript strict mode enabled everywhere.

ESLint + Prettier.

Clean architecture:

Separate services, hooks, and UI components.

Error boundaries in React.

API client with typed responses.

Unit tests (Vitest or Jest).

GitHub Actions CI: lint, test, build.

🚀 Usage Examples
Embedded Mode
ts
Copy
Edit
import { playground } from 'feathers-playground';

app.configure(playground({
  path: '/playground',
  exposeSchemas: true
}));
Standalone Mode
bash
Copy
Edit
cd apps/frontend
pnpm dev --api=http://localhost:3030
📚 Deliverables
Fully working monorepo with apps/backend, apps/frontend, packages/*.

Service discovery API.

Next.js UI with sidebar, schema viewer, request playground, response panel.

Docs:

README.md → installation & usage

CONTRIBUTING.md → dev workflow

Open source setup:

MIT License

GitHub Actions CI

Example screenshots (later)

🎁 Stretch Goals
Auto-generate forms from JSON schemas.

Export/import requests (Postman-like collections).

Dark/light mode toggle.

Plugin system for auth strategies.