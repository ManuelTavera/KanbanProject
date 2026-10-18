# Design

## Context

See proposal.md - Why. Current state: TanStack Start on Vite 8, TypeScript strict, Tailwind v4, ESLint 9 with `@tanstack/eslint-config` 0.4.0, Prettier 3.8 (`semi: false`, `singleQuote: true`, `trailingComma: "all"`). Routes: `/` (placeholder) and `/style-guide`. Development happens on two Windows machines (PC and laptop), both on Node 24 and npm 11.3.0. Vercel deploys `main` and builds a preview per pull request.

## Goals / Non-Goals

**Goals:**
- One command per check, identical locally and in CI.
- CI fails on any lint, format, type, unit, build or e2e failure.
- Same lockfile and line endings on every machine.

**Non-Goals:**
- Coverage thresholds (task 1.6).
- Real feature tests (each later task brings its own).
- Multi-browser e2e. Chromium only.

## Decisions

1. **Separate `vitest.config.ts`** instead of reusing `vite.config.ts`. The app config loads the TanStack Start, Nitro and devtools plugins, which unit tests do not need and which can break in jsdom. Vitest config uses only `@vitejs/plugin-react`, `resolve.tsconfigPaths: true`, `environment: 'jsdom'`, `setupFiles: ['src/test/setup.ts']`, `include: ['src/**/*.test.{ts,tsx}']`. No globals: tests import `describe/it/expect` from `vitest`, so `tsconfig.json` needs no changes.
2. **jest-dom matchers** via `import '@testing-library/jest-dom/vitest'` in `src/test/setup.ts`, plus `afterEach(cleanup)` from `@testing-library/react`.
3. **Playwright runs against the production build**, not the dev server: `webServer.command = 'npm run build && npm run preview -- --port 4173 --strictPort'`, `url = 'http://localhost:4173'`, `reuseExistingServer: !process.env.CI`, timeout 120 s. This tests what Vercel ships. Tests live in `e2e/`. Chromium project only. `reporter: process.env.CI ? 'github' : 'list'`.
4. **axe** via `@axe-core/playwright` with tags `wcag2a, wcag2aa, wcag21a, wcag21aa`, all rules enabled, including `color-contrast`. The smoke tests assert zero violations on `/` and on `/style-guide` in both themes (dark is reached by clicking the page's "Switch to dark" button). Secondary text uses the `muted` token, which was darkened from the Figma grey to pass AA.
5. **Toolchain pinning:** `package.json` gets `"engines": { "node": "24.x", "npm": "11.x" }`; `.npmrc` gets `engine-strict=true` so a wrong npm fails install instead of silently rewriting the lockfile; `.nvmrc` contains `24`. CI reads `.nvmrc`. Remove the unused `pnpm` block from `package.json`.
6. **Line endings:** `.gitattributes` with `* text=auto eol=lf`, then `git add --renormalize .`.
7. **ESLint 10:** bump `eslint` to `^10.13.0`. Add ignores for `.output/**`, `.tanstack/**`, `dist/**`, `playwright-report/**`, `test-results/**`, `src/routeTree.gen.ts`. Keep the existing rule overrides.
8. **CI:** `.github/workflows/ci.yml`, triggers `pull_request` and `push` to `main`, one job on `ubuntu-latest`: checkout, `actions/setup-node` with `node-version-file: .nvmrc` and `cache: npm`, `npm ci`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npx playwright install --with-deps chromium`, `npm run test:e2e` (builds via webServer). Upload `playwright-report/` as an artifact on failure. `concurrency` cancels superseded runs per branch.

## Risks / Trade-offs

- [ESLint 10 flags existing code] → fix the code; do not disable rules to get green. Only `src/routeTree.gen.ts` is ignored.
- [`engine-strict` breaks Vercel if its Node 24 image ships a different npm major] → the pull request's Vercel preview build is the test. If it fails, remove `.npmrc` and keep `engines` only.
- [Prettier reformats many files on first `format`] → run it once in its own commit so the diff stays reviewable.
- [Renormalizing line endings touches many files] → own commit, no other changes in it.
- [Playwright browser download is slow in CI] → install Chromium only.
