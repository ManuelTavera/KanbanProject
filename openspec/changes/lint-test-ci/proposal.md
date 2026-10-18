# Proposal

## Why

Task 0.3 of the Kanban plan. Every later task, and every Qwen-written task in particular, is only "done" when automated checks pass. Today the repo has no tests, no CI, an ESLint version mismatch, a lockfile that fails `npm ci`, and Windows line endings that make files look modified between machines.

## What Changes

- Pin the toolchain: Node 24 and npm 11 via `engines`, `.nvmrc` and `engine-strict`; regenerate `package-lock.json` with npm 11.3.0 so `npm ci` passes.
- Add `.gitattributes` so every text file is stored with LF line endings; renormalize the repo.
- Upgrade ESLint 9 to ESLint 10 (keeps `@tanstack/eslint-config` 0.4.0, which supports both).
- Add scripts: `typecheck`, `lint`, `format`, `format:check`, `test`, `test:watch`, `test:e2e`.
- Add Vitest + React Testing Library (jsdom) with one smoke test.
- Add Playwright + axe with one smoke test that loads the built app.
- Add a GitHub Actions workflow that runs all checks on every pull request and on pushes to `main`.

## Capabilities

### New Capabilities

None. This change is tooling only; no user-visible behavior changes. `skip_specs: true` is set in `.openspec.yaml`.

### Modified Capabilities

None.

## Impact

- Files: `package.json`, `package-lock.json`, `.nvmrc`, `.npmrc`, `.gitattributes`, `.gitignore`, `.prettierignore`, `eslint.config.js`, new `vitest.config.ts`, `playwright.config.ts`, `src/test/`, `e2e/`, `.github/workflows/ci.yml`.
- Dev dependencies only. No runtime dependency changes, no app code changes beyond lint fixes.
- After merge, `main` can be protected so pull requests merge only when CI is green.
