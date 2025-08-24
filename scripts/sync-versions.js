const fs = require('fs');
const path = require('path');

/**
 * Synchronizes versions across all packages in the workspace
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

        if (packageJson.version !== targetVersion) {
            packageJson.version = targetVersion;
            fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(
                `✅ Updated ${packagePath}: ${packageJson.version} → ${targetVersion}`
            );
            updatedCount++;
        } else {
            console.log(`✓ ${packagePath} already at version ${targetVersion}`);
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
