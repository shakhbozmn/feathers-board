# Version Management

This project uses a centralized version management system to ensure consistency across all packages in the monorepo.

## How It Works

- **Source of Truth**: The `version` field in the root [`package.json`](package.json) is the authoritative version for the entire project.
- **Automatic Synchronization**: All packages (`apps/*` and `packages/*`) are automatically synchronized to match the root version.
- **Release-Driven CI/CD**: Publishing only occurs when a new GitHub release is created.

## Version Synchronization

### Manual Sync
To manually synchronize all package versions:

```bash
pnpm sync-versions
```

This script:
1. Reads the version from root [`package.json`](package.json)
2. Updates all package.json files in [`apps/`](apps/) and [`packages/`](packages/) directories
3. Reports which packages were updated

### Automated Sync
The [`sync-versions`](scripts/sync-versions.js) script runs automatically during CI/CD when:
- A new GitHub release is published
- The publish workflow extracts the version from the release tag (e.g., `v1.2.3` → `1.2.3`)

## Release Process

### 1. Update Version
Update the version in the root [`package.json`](package.json):

```bash
npm version patch  # or minor/major
```

### 2. Sync All Packages
Run the sync script to ensure all packages match:

```bash
pnpm sync-versions
```

### 3. Create GitHub Release
Create a new release on GitHub with a tag matching the version (e.g., `v1.2.3`).

### 4. Automatic Publishing
The CI/CD workflow will automatically:
- Extract the version from the release tag
- Sync all package versions
- Build and test the project
- Publish packages to NPM

## CI/CD Workflow

The publish workflow ([`.github/workflows/publish.yml`](.github/workflows/publish.yml)) is triggered only by GitHub releases:

```yaml
on:
  release:
    types: [published]
```

### Workflow Steps
1. **Extract Version**: Parse version from GitHub release tag
2. **Update Root**: Update root package.json with the release version
3. **Sync Packages**: Run `pnpm sync-versions` to update all packages
4. **Build & Test**: Ensure everything builds and tests pass
5. **Publish**: Publish packages to NPM with consistent versions

## Package Structure

All packages maintain version consistency:

- [`packages/core/package.json`](packages/core/package.json) → `feathers-playground`
- [`packages/types/package.json`](packages/types/package.json) → `@feathers-playground/types`
- [`apps/frontend/package.json`](apps/frontend/package.json) → Frontend application
- [`apps/backend/package.json`](apps/backend/package.json) → Backend application

## Benefits

- **Consistency**: All packages always have the same version
- **Automation**: No manual version updates across multiple files
- **Release Safety**: Only triggers on actual GitHub releases
- **Traceability**: Clear version history through GitHub releases
- **Simplicity**: Single source of truth for version management