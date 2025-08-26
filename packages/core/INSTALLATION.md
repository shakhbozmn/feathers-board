# Installation Guide

## Quick Start

To install `feathers-playground` in your Feathers v5 application:

```bash
# Install feathers-playground and its required peer dependencies
npm install feathers-playground @feathersjs/feathers @feathersjs/express

# Or with yarn
yarn add feathers-playground @feathersjs/feathers @feathersjs/express

# Or with pnpm
pnpm add feathers-playground @feathersjs/feathers @feathersjs/express
```

## Why Peer Dependencies?

This package requires `@feathersjs/feathers` and `@feathersjs/express` as peer dependencies to:

1. **Avoid version conflicts** - Use the same Feathers version as your app
2. **Reduce bundle size** - Don't duplicate dependencies you already have
3. **Ensure compatibility** - Work with your existing Feathers setup

## Troubleshooting

### Error: "Failed to configure Feathers Playground. Please ensure @feathersjs/express is installed"

This error occurs when `@feathersjs/express` is not installed. Install it with:

```bash
npm install @feathersjs/express
```

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
