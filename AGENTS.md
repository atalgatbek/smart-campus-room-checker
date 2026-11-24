# AGENTS.md

Project notes for AI agents. Bolt does not load this file automatically: the human pastes
"Read AGENTS.md first and follow it" at the start of every agent session.

## Project
Smart Campus room availability checker (Room 204, Main Building).
User story: as a student, I want to check a room's availability so I can choose a valid booking time.
One room, fictional bookings, fixed current time 09:00 (540 min). Existing booking 10:00-11:00.
The page only answers Available / Unavailable. It never creates or saves a booking.
An "Explain availability" button shows a short explanation from a mock AI adapter (no real model).

## Structure
- `src/lib/canBook.ts` - booking rules (pure function, times in minutes) and `REASON_CODES`
- `src/lib/checkRequest.ts` - form input to rules: start time + duration in minutes, required-field and duration messages
- `src/lib/time.ts` - HH:MM <-> minutes
- `src/lib/fixtures.ts` - fixed `NOW` and existing bookings
- `src/lib/explainValidation.ts` - explanation request/response schema checks and fallback text
- `src/lib/mockExplain.ts` - mock AI adapter (modes normal / slow / error, 3 s timeout, cancellable)
- `src/App.tsx` - UI (React + Tailwind)
- `src/lib/*.test.ts` - regression tests for the rules (`contract.test.ts` = the 8 shared Practice #12 cases); `tests/*.test.ts` - repository checks

## Acceptance criteria (do not change behavior)
- AC1: the start time must be in the future (strictly after 09:00; 09:00 itself is rejected) and the slot must end by 24:00.
- AC2: the duration is a whole number of minutes, greater than 0 and at most 120 (120 is allowed, 121 is not).
- AC3: overlapping bookings are unavailable; touching endpoints are allowed (11:00 + 60 after 10:00-11:00 is OK).
- AC4: a blocked room is always Unavailable.
- AC5: one clear decision (Available / Unavailable) and booking data is never changed.
- AC6: invalid input gets an understandable message; the layout works at 360px width.
- AC7: the explanation never decides availability; the result card is the only source of truth.
- AC8: an explanation is shown only for the inputs on screen; changing inputs cancels a pending one.
- AC9: on timeout, invalid output or error the page shows the fallback text, never a crash.

## Constraints
- No backend, no login, no database, no Supabase / Bolt Database, no saving bookings.
- No real AI model or API calls. No API keys, credentials, or `.env` values in source or docs.
- Keep the UI, texts and messages exactly the same.
  Exception: accessibility and contrast fixes that keep all texts identical, after approval.
- Keep the fixed time 09:00, do not use the real clock.

## Safe commands (the agent may run these without asking)
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm audit --omit=dev`
- Reading files, `ls`, `cat`, `node -p` for version checks

## Ask the human first
- `npm install <package>` or any change to `package.json` / `package-lock.json` (only `vitest` 2.x was approved)
- Editing `AGENTS.md`, `eslint.config.js`, `vite.config.ts` or any `tsconfig*.json`
- `npm run dev` (the human starts the preview)

## Forbidden actions
- Publishing or deploying (the Bolt "Publish" button, any hosting). Only the human publishes.
- Destructive commands: `rm -rf`, `git reset --hard`, `git push --force`, `git clean -fd`,
  deleting test files, deleting or rewriting Bolt version history.
- Adding a database, auth, real model calls or network requests.
- Reading, printing or committing secrets; putting real personal data in fixtures or tests.
- Deleting or weakening existing test assertions.

## Engineering rules
- Prefer pure functions and the smallest change that fixes the problem.
- Use at most 2 design patterns and only with a concrete reason. No Repository, Singleton, Factory or class hierarchies without a real need.
- Do not mutate booking fixtures.
- Do not leave unused dependencies in `package.json`.

## Verification and review gate
- Before a change: run `npm test` and note the count. After: run all four checks
  (`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`) and paste the real output.
- Add a test that fails before the fix and passes after it for every bug you fix.
- Check the page on desktop and at 360px. If no browser is available, report these as not verified.
- Show the diff and wait for human approval before applying changes.
- If a command was not run, report it as not run, never as passed.
- In the answer: list changed files, the reason for each change, the test output, tests not run and remaining risks.
- Keep this file in sync: `tests/agentsDoc.test.ts` fails if a `src/lib` module or a forbidden command is missing here.
