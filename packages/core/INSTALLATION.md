# Installation Guide

## Quick Start

### For Feathers with Express

```bash
# Install feathers-playground with Express dependencies
npm install feathers-playground @feathersjs/feathers @feathersjs/express

# Or with yarn
yarn add feathers-playground @feathersjs/feathers @feathersjs/express

# Or with pnpm
pnpm add feathers-playground @feathersjs/feathers @feathersjs/express
```

### For Feathers with Koa

```bash
# Install feathers-playground with Koa dependencies
npm install feathers-playground @feathersjs/feathers @feathersjs/koa koa-static

# Or with yarn
yarn add feathers-playground @feathersjs/feathers @feathersjs/koa koa-static

# Or with pnpm
pnpm add feathers-playground @feathersjs/feathers @feathersjs/koa koa-static
```

## Why Peer Dependencies?

This package requires `@feathersjs/feathers` and `@feathersjs/express` as peer dependencies to:

1. **Avoid version conflicts** - Use the same Feathers version as your app
2. **Reduce bundle size** - Don't duplicate dependencies you already have
3. **Ensure compatibility** - Work with your existing Feathers setup

## Troubleshooting

### Error: "Failed to configure Feathers Playground" or static serving issues

This can occur for several reasons:

1. **Missing web framework dependencies**:
   - For Express: `npm install @feathersjs/express`
   - For Koa: `npm install @feathersjs/koa koa-static`

2. **Framework not detected**: The playground will still provide API endpoints but may not serve the UI

3. **Fallback mode**: If neither Express nor Koa static serving is available, the playground uses a basic fallback that should work with most setups

### Error: "Static files not found"

This usually means the package wasn't properly built during installation. Try:

```bash
npm install feathers-playground --force
```

## Usage

After installation, add to your Feathers app:

```typescript
import { playground } from 'feathers-playground';

app.configure(
  playground({
    path: '/playground',
    title: 'My API Playground',
  })
);
```

Visit `http://localhost:3030/playground` to access the playground UI.
