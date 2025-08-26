import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Synchronizes versions across all packages in the workspace and resolves workspace dependencies
 * Uses the version from the root package.json as the source of truth
 */

const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
const rootPackageJson = JSON.parse(
  fs.readFileSync(rootPackageJsonPath, 'utf8')
);
const targetVersion = rootPackageJson.version;

console.log(`Synchronizing all packages to version: ${targetVersion}`);

// Define package paths relative to root
const packagePaths = [
  'apps/frontend/package.json',
  'apps/backend/package.json',
  'packages/core/package.json',
  'packages/types/package.json',
];

let updatedCount = 0;

packagePaths.forEach(packagePath => {
  const fullPath = path.join(__dirname, '..', packagePath);

  try {
    const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    let wasUpdated = false;

    // Update version if needed
    if (packageJson.version !== targetVersion) {
      packageJson.version = targetVersion;
      wasUpdated = true;
      console.log(
        `✅ Updated ${packagePath} version: ${packageJson.version} → ${targetVersion}`
      );
    }

    // Resolve workspace dependencies
    const dependencyTypes = [
      'dependencies',
      'devDependencies',
      'peerDependencies',
    ];

    dependencyTypes.forEach(depType => {
      if (packageJson[depType]) {
        Object.keys(packageJson[depType]).forEach(depName => {
          const depVersion = packageJson[depType][depName];

          // Check if it's a workspace dependency
          if (depVersion.startsWith('workspace:')) {
            // Resolve workspace dependencies to the target version
            packageJson[depType][depName] = `^${targetVersion}`;
            wasUpdated = true;
            console.log(
              `✅ Resolved workspace dependency in ${packagePath}: ${depName}@${depVersion} → ${depName}@^${targetVersion}`
            );
          }
        });
      }
    });

    if (wasUpdated) {
      fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
      updatedCount++;
    } else {
      console.log(`✓ ${packagePath} already synchronized`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${packagePath}:`, error.message);
    process.exit(1);
  }
});

if (updatedCount === 0) {
  console.log('\n🎉 All packages are already synchronized!');
} else {
  console.log(
    `\n🎉 Successfully synchronized ${updatedCount} package(s) to version ${targetVersion}`
  );
}
