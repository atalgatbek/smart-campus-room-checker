# Assignment #06 — Talgatbek Abilkhaiyr (24B032048)

Software Engineering, Wednesday 15:00-18:00. Chosen application: Smart Campus room availability checker.

- Report: [Assignment06_Report_Talgatbek_Abilkhaiyr.pdf](Assignment06_Report_Talgatbek_Abilkhaiyr.pdf)
- Code-based version (Bolt.new): https://smart-campus-room-av-yihv.bolt.host — source in `src/`
- Low-code version (Appsmith): https://app.appsmith.com/app/smart-campus-low-code/page1-6b05c4cd405210eb614bbf5b — export in `lowcode/`

| Result | Code-based | Low-code |
| --- | --- | --- |
| Common test cases (13) | 13 / 13 Pass | 12 / 13 Pass (T13 fails) |
| Automated tests | 75 passed (64 before the review) | none (no test runner) |
| Review findings fixed | F1+F5, F4, F7 + security headers + `npm audit fix` | — |
| Release decision | Ready with conditions | Not ready as the main version |

## Evidence (`evidence/`)

| File | What it shows |
| --- | --- |
| A01 | Baseline: 64 tests on version 12 |
| A02, A07 | `npm audit` before (24) and after (19) |
| A03, A04 | Bolt agent review in Plan mode (Finding 1, summary) and the full review log |
| A05, A09 | Live site before and after the 24:00 fix |
| A06 | 5 verification tests that confirm the findings |
| A08 | Tests, typecheck, lint, build after the fixes (75 tests) |
| B01, B04 | Results of the 13 common cases on both apps |
| B02, B03 | Code-based T4 and T2 at 360 px |
| B04, B05 | Low-code T11 and the failed T13 |
| C01 | DAST checks (own apps only) and response headers |
| C02 | SAST source scan |
