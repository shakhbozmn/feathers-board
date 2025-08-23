# Usage Guide - Feathers Playground

This guide shows how to use the published Feathers Playground packages in your projects.

## 📦 NPM Packages

The Feathers Playground is published as two NPM packages:

- **`feathers-playground`** - Core integration package for embedding in Feathers apps
- **`@feathers-playground/types`** - TypeScript types (optional, for type safety)

## 🚀 Installation & Usage

### Option 1: Embedded Mode (Recommended)

Add the playground directly to your existing Feathers v5 application:

#### 1. Install the package

```bash
npm install feathers-playground
# or
yarn add feathers-playground
# or
pnpm add feathers-playground
```

#### 2. Add to your Feathers app

```typescript
// src/app.ts
import { feathers } from '@feathersjs/feathers';
import express, { rest, json, urlencoded, cors } from '@feathersjs/express';
import { playground } from 'feathers-playground';

const app = express(feathers());

// Your existing Feathers configuration
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.configure(rest());

// Configure your services
// app.use('/users', new UsersService());
// app.use('/messages', new MessagesService());

// Add the playground (should be after services are configured)
app.configure(playground({
  path: '/playground',           // Mount path (default: '/playground')
  exposeSchemas: true,          // Include JSON schemas (default: true)
  title: 'My API Playground',   // Custom title
  description: 'Test my API',   // Custom description
  cors: true                    // Enable CORS (default: true)
}));

const PORT = process.env.PORT || 3030;
app.listen(PORT).then(() => {
  console.log(`🪶 Feathers app listening on http://localhost:${PORT}`);
  console.log(`🎮 Playground available at http://localhost:${PORT}/playground`);
});
```

#### 3. Access the playground

Visit `http://localhost:3030/playground` to access the embedded playground UI.

### Option 2: Standalone Mode

Run the playground as a separate application that connects to your Feathers API:

#### 1. Clone and setup

```bash
git clone https://github.com/feathersjs-ecosystem/feathers-playground.git
cd feathers-playground
pnpm install
pnpm build
```

#### 2. Configure API URL

```bash
# Point to your Feathers API
export NEXT_PUBLIC_API_URL=http://localhost:3030
# or create .env.local file in apps/frontend/
echo "NEXT_PUBLIC_API_URL=http://localhost:3030" > apps/frontend/.env.local
```

#### 3. Start the playground

```bash
pnpm --filter @feathers-playground/frontend dev
```

Visit `http://localhost:3000` to access the standalone playground.

## 🔧 Configuration Options

```typescript
interface PlaygroundConfig {
  path?: string;           // Mount path (default: '/playground')
  exposeSchemas?: boolean; // Include schemas in discovery (default: true)
  title?: string;          // Playground title
  description?: string;    // Playground description
  cors?: boolean;          // Enable CORS (default: true)
  authentication?: {       // Auth configuration
    enabled: boolean;
    strategies?: string[];
  };
}
```

## 📋 Service Discovery Requirements

For the playground to work, your services need to be discoverable. The playground automatically detects:

- **Service methods**: `find`, `get`, `create`, `patch`, `remove`
- **Service paths**: The URL path where the service is mounted
- **JSON schemas**: If you attach schemas to your services

### Adding JSON Schemas (Optional)

To get better documentation and validation, add JSON schemas to your services:

```typescript
// users.service.ts
import { ServiceMethods } from '@feathersjs/feathers';

export class UsersService implements ServiceMethods<User> {
  // Your service implementation...
}

// Add schema for playground discovery
const service = new UsersService();
(service as any).schema = {
  type: 'object',
  properties: {
    id: { type: 'number', description: 'Unique identifier' },
    email: { type: 'string', format: 'email', description: 'User email' },
    name: { type: 'string', description: 'User full name' },
    createdAt: { type: 'string', format: 'date-time' }
  },
  required: ['email', 'name']
};
(service as any).description = 'User management service';

app.use('/users', service);
```

## 🎯 Real-World Examples

### Example 1: Basic Blog API

```typescript
// app.ts
import { feathers } from '@feathersjs/feathers';
import express, { rest, json, cors } from '@feathersjs/express';
import { playground } from 'feathers-playground';

const app = express(feathers());

app.use(cors());
app.use(json());
app.configure(rest());

// Blog services
app.use('/posts', new PostsService());
app.use('/comments', new CommentsService());
app.use('/users', new UsersService());

// Add playground
app.configure(playground({
  path: '/api-playground',
  title: 'Blog API Playground',
  description: 'Test the blog API endpoints'
}));

app.listen(3030);
```

### Example 2: E-commerce API with Authentication

```typescript
// app.ts
import { feathers } from '@feathersjs/feathers';
import express, { rest, json, cors } from '@feathersjs/express';
import { authentication } from '@feathersjs/authentication';
import { playground } from 'feathers-playground';

const app = express(feathers());

app.use(cors());
app.use(json());
app.configure(rest());
app.configure(authentication(/* auth config */));

// E-commerce services
app.use('/products', new ProductsService());
app.use('/orders', new OrdersService());
app.use('/customers', new CustomersService());

// Add playground with auth info
app.configure(playground({
  path: '/dev-playground',
  title: 'E-commerce API',
  description: 'Internal API testing playground',
  authentication: {
    enabled: true,
    strategies: ['jwt', 'local']
  }
}));

app.listen(3030);
```

### Example 3: Microservice with Custom Schemas

```typescript
// app.ts
import { feathers } from '@feathersjs/feathers';
import express, { rest, json, cors } from '@feathersjs/express';
import { playground } from 'feathers-playground';

const app = express(feathers());

app.use(cors());
app.use(json());
app.configure(rest());

// Service with detailed schema
const notificationsService = new NotificationsService();
(notificationsService as any).schema = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'Notification ID' },
    userId: { type: 'string', description: 'Target user ID' },
    type: { 
      type: 'string', 
      enum: ['email', 'sms', 'push'],
      description: 'Notification type'
    },
    message: { type: 'string', description: 'Notification content' },
    status: {
      type: 'string',
      enum: ['pending', 'sent', 'failed'],
      description: 'Delivery status'
    },
    createdAt: { type: 'string', format: 'date-time' },
    sentAt: { type: 'string', format: 'date-time' }
  },
  required: ['userId', 'type', 'message']
};
(notificationsService as any).description = 'Send and track notifications';

app.use('/notifications', notificationsService);

app.configure(playground({
  path: '/playground',
  title: 'Notifications Service',
  exposeSchemas: true
}));

app.listen(3030);
```

## 🔍 Testing Your API

Once the playground is set up, you can:

1. **Browse Services**: See all available services in the sidebar
2. **View Schemas**: Understand the data structure for each service
3. **Build Requests**: Use the form to construct API calls
4. **Test Methods**: Try `find`, `get`, `create`, `patch`, `remove` operations
5. **Inspect Responses**: View formatted JSON responses with status codes

### Example API Calls

The playground helps you test calls like:

```bash
# Find all users with pagination
GET /users?$limit=10&$skip=0

# Get specific user
GET /users/123

# Create new user
POST /users
{
  "name": "John Doe",
  "email": "john@example.com"
}

# Update user
PATCH /users/123
{
  "name": "John Smith"
}

# Delete user
DELETE /users/123
```

## 🚀 Deployment

### Production Considerations

For production deployments:

```typescript
// Only enable playground in development
if (process.env.NODE_ENV === 'development') {
  app.configure(playground({
    path: '/playground',
    title: 'Development API Playground'
  }));
}
```

### Docker Example

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Only expose playground in development
ENV NODE_ENV=production
EXPOSE 3030
CMD ["npm", "start"]
```

## 🤝 Contributing

Found a bug or want to contribute? Check out the [Contributing Guide](./CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.