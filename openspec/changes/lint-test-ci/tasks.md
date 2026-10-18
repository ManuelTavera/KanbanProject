# Tasks

Rules for this change:

- Do not run any `git` command. The human commits.
- A task is done only when its verification command exits 0. Paste the last lines of that output under the task when you tick it.
- Never disable a lint rule, skip a test, or use `any` to get a check green.
- Use `npm.cmd` / `npx.cmd` if PowerShell blocks `npm` scripts.

## 1. Toolchain and line endings

- [x] 1.1 Create `.nvmrc` containing `24`, and `.npmrc` containing `engine-strict=true`. In `package.json` add `"engines": { "node": "24.x", "npm": "11.x" }` and delete the `pnpm` block. Verify: `node -p "require('./package.json').engines.npm"` prints `11.x`.
- [x] 1.2 Create `.gitattributes` containing exactly `* text=auto eol=lf`. Verify: the file exists with that one line.
- [x] 1.3 Append `playwright-report`, `test-results` and `coverage` to `.gitignore`; append `src/routeTree.gen.ts`, `.output`, `.tanstack`, `playwright-report`, `test-results` to `.prettierignore`. Verify: both files contain the new lines.

## 2. Lint and format

- [x] 2.1 Upgrade ESLint: `npm install -D eslint@^10.13.0`. Verify: `npx eslint --version` prints v10.
- [x] 2.2 In `eslint.config.js`, extend the existing `ignores` entry with `.output/**`, `.tanstack/**`, `dist/**`, `playwright-report/**`, `test-results/**`, `src/routeTree.gen.ts`. Keep all existing rule overrides. Verify: `npx eslint .` runs without a config error.
- [x] 2.3 Set scripts in `package.json`: `"typecheck": "tsc --noEmit"`, `"lint": "eslint ."`, `"format": "prettier --write ."`, `"format:check": "prettier --check ."`. Remove the old `check` script and change the old `format` script to the one above. Verify: `npm run typecheck` exits 0.
- [x] 2.4 Run `npm run format` once. Then fix every error from `npm run lint` in the existing source without changing behavior. Verify: `npm run lint` and `npm run format:check` both exit 0, and `npm run build` still exits 0.

## 3. Unit tests

- [x] 3.1 Install `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`. Verify: install exits 0.
- [x] 3.2 Create `vitest.config.ts` exactly as described in design.md decision 1, and `src/test/setup.ts` as in decision 2. Add scripts `"test": "vitest run"` and `"test:watch": "vitest"`. Verify: `npm run typecheck` exits 0.
- [x] 3.3 Create `src/test/smoke.test.tsx`: render `<button type="button">Add New Task</button>`, click it with `userEvent`, and assert with `toBeInTheDocument()` that the button is found by `getByRole('button', { name: 'Add New Task' })`. Verify: `npm test` exits 0 and reports 1 passed test.
- [x] 3.4 Prove the gate works: temporarily change the expected name to `'Wrong'`, confirm `npm test` exits non-zero, then restore it. Verify: `npm test` exits 0 again. Note the failing output under this task.

## 4. End-to-end and accessibility

- [x] 4.1 Install `npm install -D @playwright/test @axe-core/playwright`, then `npx playwright install chromium`. Verify: `npx playwright --version` prints a version.
- [x] 4.2 Create `playwright.config.ts` as in design.md decision 3. Add script `"test:e2e": "playwright test"`. Verify: `npm run typecheck` exits 0.
- [x] 4.3 Create `e2e/smoke.spec.ts` with four tests: (a) `/` responds and the page has a non-empty `<title>`; (b) `/` has zero axe violations using `AxeBuilder` with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`; (c) `/style-guide` has zero axe violations with the same tags; (d) on `/style-guide`, click the button named "Switch to dark", assert `<html>` has class `dark`, then assert zero axe violations. Do not disable any axe rule. Verify: `npm run test:e2e` exits 0 with 4 passed tests.

## 5. CI

- [x] 5.1 Create `.github/workflows/ci.yml` exactly as in design.md decision 8, with `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`. Verify: `npx --yes yaml-lint .github/workflows/ci.yml` or an equivalent YAML parse exits 0.
- [x] 5.2 Regenerate the lockfile with npm 11: delete `node_modules` and `package-lock.json`, run `npm install`, then delete `node_modules` again and run `npm ci`. Verify: `npm ci` exits 0.
- [x] 5.3 Full local run in CI order: `npm run typecheck && npm run lint && npm run format:check && npm test && npm run test:e2e`. Verify: the whole chain exits 0.

Verification output and who did each task: see `run-notes.md`.

## Workflow follow-up

- Human: commit in this order so each diff stays readable: (1) `.gitattributes` + `git add --renormalize .`, (2) Prettier reformat only, (3) everything else.
- Human: open the pull request and confirm both the CI job and the Vercel preview build pass. If Vercel fails on the engine check, remove `.npmrc` and keep `engines`.
- Human: after merge, protect `main` (Settings → Branches): require the CI check and pull requests before merging.
- Archive the change with `openspec archive lint-test-ci` after merge.
