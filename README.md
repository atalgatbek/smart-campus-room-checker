# Smart Campus Room Availability Checker

Practice #12 (Software Engineering): the same small feature built twice.

| | Code-based | Low-code |
| --- | --- | --- |
| Tool | Bolt.new (React + TypeScript + Vite) | Appsmith (cloud, free plan) |
| Live demo | https://smart-campus-room-av-yihv.bolt.host | https://app.appsmith.com/app/smart-campus-low-code/page1-6b05c4cd405210eb614bbf5b |
| Source | `src/` | `lowcode/appsmith-export.json` (import in Appsmith), logic in `lowcode/Rules.js` |

## Shared contract
Inputs: start time (HH:MM), duration in minutes, blocked flag, fictional bookings (one booking 10:00-11:00), fixed current time 09:00.
Outputs: availability boolean, reason code, visible message.

- AC1: start time must be in the future.
- AC2: duration must be greater than 0 and at most 120 minutes.
- AC3: overlapping bookings are unavailable (touching endpoints are allowed).
- AC4: a blocked room is unavailable.
- AC5: one clear decision; existing bookings are never changed.
- AC6: invalid input gets an understandable message.

The 8 shared test cases (T1-T8) are automated in `src/lib/contract.test.ts` and were run by hand in the Appsmith app.

## Code-based version
    npm install
    npm test            # 75 tests, incl. 8 contract cases and 11 review regression tests
    npm run typecheck && npm run lint && npm run build

Structure: validation `src/lib/checkRequest.ts`, rules `src/lib/canBook.ts`, UI `src/App.tsx`. Rules for AI agents: `AGENTS.md`.

## Low-code version
Appsmith app "Smart Campus Low-code": 2 inputs, 1 switch, 3 text widgets and one JS object (`Rules`) for the availability rule.
To restore it: Appsmith -> Create new -> Import -> `lowcode/appsmith-export.json`.

## Assignment #06
Agentic code review, fixes, security assessment and the 13-case comparison: report and evidence in assignment06/.
Security headers for the published site: public/_headers.

No real personal data, no login, no database, no secrets.
