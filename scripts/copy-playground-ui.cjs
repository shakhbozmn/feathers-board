#!/usr/bin/env node
/**
 * Copy the static Next.js export from `apps/frontend/out/` into
 * `packages/core/playground/`. The Feathers playground plugin serves that
 * directory verbatim at runtime at the configured path (default
 * `/playground`).
 *
 * Wired into `packages/core`'s `postbuild` so `turbo run build` or
 * `pnpm --filter feathers-playground build` always produces a current
 * static UI alongside the compiled plugin.
 *
 * Idempotent: the destination is wiped first so a previous export's stale
 * files (renamed routes, removed assets) don't linger.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const source = path.join(repoRoot, 'apps', 'frontend', 'out');
const dest = path.join(repoRoot, 'packages', 'core', 'playground');

function rimraf(p) {
  if (!fs.existsSync(p)) return;
  for (const entry of fs.readdirSync(p)) {
    const child = path.join(p, entry);
    const stat = fs.lstatSync(child);
    if (stat.isDirectory()) {
      rimraf(child);
    } else {
      fs.unlinkSync(child);
    }
  }
  fs.rmdirSync(p);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isSymbolicLink()) {
      const real = fs.realpathSync(s);
      const stat = fs.statSync(real);
      if (stat.isDirectory()) {
        copyDir(real, d);
      } else {
        fs.copyFileSync(real, d);
      }
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

if (!fs.existsSync(source)) {
  // The source is missing — typically because turbo started this task in
  // parallel with `frontend#build` and the static export hasn't been
  // produced yet. Self-heal: build the frontend now and continue. Exits
  // non-zero only if the build itself fails, so genuine CI errors still
  // surface while the "ran out of order" case stops being a hard failure.
  console.warn(
    `[copy-playground-ui] Source not found: ${source}\n` +
      `Building frontend first to unblock…`
  );
  const { spawnSync } = require('child_process');
  const result = spawnSync(
    'pnpm',
    ['--filter', '@feathers-playground/frontend', 'build'],
    { cwd: repoRoot, stdio: 'inherit' }
  );
  if (result.status !== 0) {
    console.error('[copy-playground-ui] Frontend build failed.');
    process.exit(result.status ?? 1);
  }
  if (!fs.existsSync(source)) {
    console.error(
      `[copy-playground-ui] Frontend build did not produce ${source}.`
    );
    process.exit(1);
  }
}

console.log(`[copy-playground-ui] ${path.relative(repoRoot, source)} → ${path.relative(repoRoot, dest)}`);
rimraf(dest);
copyDir(source, dest);
console.log('[copy-playground-ui] done.');
