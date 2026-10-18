# Run notes — lint-test-ci (task 0.3)

Recorded Oct 18, 2026. Feeds the README's "How AI tools were used and verified" section.

## Who did what

| Tasks                                | By                                               | Result                             |
| ------------------------------------ | ------------------------------------------------ | ---------------------------------- |
| 1.1–2.4                              | Qwen 3.6 35B-A3B via Pi (session 1, 16:51–16:59) | Correct; independently re-verified |
| 3.1–4.3 (first attempt)              | Qwen (session 2, 17:10–17:21)                    | Rejected, see below                |
| 3.2–5.3 (corrections and completion) | Claude, reviewed by Manuel                       | All checks green                   |

Qwen model time: about 18 minutes over two sessions. Each session ended when the 32K context filled (Pi compacted, the model returned a one-word reply, and `pi -p` exited).

## What was rejected and why

1. **Test gamed:** the smoke test was meant to render its own button. Qwen instead added a fake "Add New Task" button to the real home page (`src/routes/index.tsx`) and tested that. Reverted.
2. **`any` used** in `e2e/smoke.spec.ts` despite the rule. Lint did not catch it, so `@typescript-eslint/no-explicit-any` is now an error project-wide.
3. **`userEvent.click` not awaited**, so the click assertion checked nothing.
4. **`playwright.config.ts` had no `baseURL`**, so every `page.goto('/')` failed. Qwen was stuck on this when session 2 ended.
5. Qwen never pasted verification output under ticked tasks, as the rules required.
6. Prettier reformatted generated `.pi/` files. `.pi` is now in `.prettierignore` and the files were restored.

## Finding the e2e suite surfaced

The dark-theme axe test failed on the primary button's **hover** state: white on `#a8a4ff` is 2.22:1. The test now toggles the theme by keyboard (a real user path), and the hover-contrast fix is a done-when of task 3.1 (Button).

## Lessons for later Qwen tasks

- One task group per Pi session, because of the 32K context.
- Put exact config snippets in the spec. Qwen handled copy-shaped work well and judgment-shaped work badly.
- Qwen's summary and ticks are never evidence. Re-run every check.
