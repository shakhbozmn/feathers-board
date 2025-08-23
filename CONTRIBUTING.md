# Contributing to Feathers Playground

Thank you for your interest in contributing to Feathers Playground! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/feathers-playground.git
   cd feathers-playground
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build packages**
   ```bash
   pnpm build
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

This will start both the backend (port 3030) and frontend (port 3000) in development mode.

## 📁 Project Structure

```
feathers-playground/
├── apps/
│   ├── backend/          # Feathers v5 API server
│   └── frontend/         # Next.js playground UI
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── core/             # Playground integration logic
├── .github/workflows/    # CI/CD workflows
└── docs/                 # Documentation
```

## 🛠 Development Workflow

### Monorepo Commands

```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build

# Run development mode for all apps
pnpm dev

# Run tests for all packages
pnpm test

# Lint all packages
pnpm lint

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

### Package-specific Commands

```bash
# Work with specific packages
pnpm --filter @feathers-playground/backend dev
pnpm --filter @feathers-playground/frontend build
pnpm --filter @feathers-playground/types test
```

### Adding Dependencies

```bash
# Add to root (dev dependencies)
pnpm add -D <package> -w

# Add to specific package
pnpm --filter @feathers-playground/frontend add <package>

# Add workspace dependency
pnpm --filter @feathers-playground/frontend add @feathers-playground/types
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Place test files next to the code they test with `.test.ts` or `.spec.ts` extension
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern: Arrange, Act, Assert

Example:
```typescript
describe('ApiClient', () => {
  it('should fetch services successfully', async () => {
    // Arrange
    const client = new ApiClient('http://localhost:3030');
    
    // Act
    const services = await client.getServices();
    
    // Assert
    expect(services).toBeInstanceOf(Array);
  });
});
```

## 📝 Code Style

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React Components

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use TypeScript interfaces for props

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions/Variables**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`ServiceInfo`)

### Formatting

We use Prettier for code formatting. Run `pnpm format` to format all files.

## 🔧 Adding New Features

### Backend (Feathers Services)

1. Create service files in `apps/backend/src/services/`
2. Define schemas using Zod in `*.schema.ts`
3. Implement service class in `*.class.ts`
4. Configure service in `*.ts`
5. Add to services index file

### Frontend (React Components)

1. Create components in `apps/frontend/src/components/`
2. Use TypeScript and proper prop interfaces
3. Follow existing patterns for styling (Tailwind + shadcn/ui)
4. Add to component exports if reusable

### Shared Types

1. Add types to `packages/types/src/index.ts`
2. Export from the main index file
3. Use Zod schemas for validation when applicable

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to reproduce**: Detailed steps to reproduce the bug
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, Node.js version, browser (if applicable)
- **Screenshots**: If applicable

## ✨ Feature Requests

When requesting features, please include:

- **Use case**: Why is this feature needed?
- **Description**: Detailed description of the feature
- **Examples**: Examples of how it would work
- **Alternatives**: Alternative solutions you've considered

## 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **PR Requirements**
   - Clear title and description
   - Link to related issues
   - All tests passing
   - Code review approval

## 🔍 Code Review Guidelines

### For Authors
- Keep PRs focused and reasonably sized
- Write clear commit messages
- Add tests for new functionality
- Update documentation as needed

### For Reviewers
- Be constructive and respectful
- Focus on code quality, not personal preferences
- Suggest improvements with explanations
- Approve when ready, request changes when needed

## 🏗 Architecture Decisions

### Adding New Packages

When adding new packages to the monorepo:

1. Create package directory in `packages/`
2. Add `package.json` with proper naming (`@feathers-playground/package-name`)
3. Add to workspace in root `package.json`
4. Add TypeScript configuration extending root config
5. Add to Turborepo pipeline in `turbo.json`

### API Design

- Follow RESTful conventions
- Use consistent error handling
- Provide clear TypeScript types
- Document with JSDoc comments

### UI/UX Guidelines

- Follow existing design patterns
- Use shadcn/ui components when possible
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test on different screen sizes

## 📚 Resources

- [Feathers Documentation](https://docs.feathersjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Community

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Follow the code of conduct

## 📞 Getting Help

If you need help:

1. Check existing documentation
2. Search existing issues
3. Ask in discussions
4. Create a new issue with the `question` label

Thank you for contributing to Feathers Playground! 🎉