# Practice #12 — Code-based vs Low-code (Smart Campus room checker)

Talgatbek Abilkhaiyr, 24B032048 · Software Engineering, Wednesday 15:00-18:00 · 24.11.2026

Full report: [Practice12_Report.pdf](Practice12_Report.pdf)

| | Code-based (Bolt.new) | Low-code (Appsmith) |
| --- | --- | --- |
| Live demo | https://smart-campus-room-av-yihv.bolt.host | https://app.appsmith.com/app/smart-campus-low-code/page1-6b05c4cd405210eb614bbf5b |
| Source / export | `src/` (React + TypeScript) | `lowcode/appsmith-export.json`, `lowcode/Rules.js` |
| Functional tests T1-T8 | 8 / 8 (automated in `src/lib/contract.test.ts` + live) | 8 / 8 (manual, deployed app) |
| All unit tests | 64 passed | no test runner in the platform |
| Build time | about 10 min | about 15 min (+13 min export) |
| Unresolved defects | 0 | 2 minor |

Recommendation: keep the code-based version as the main solution.

## Test logs

- [code_T1-T8_live.txt](code_T1-T8_live.txt) — code-based version, live site
- [lowcode_T1-T8_appsmith.txt](lowcode_T1-T8_appsmith.txt) — Appsmith deployed app
- [security_dast_checks.txt](security_dast_checks.txt) — safe manual runtime checks on my own apps

## Screenshots

| File | What it shows |
| --- | --- |
| [P01](screenshots/P01_baseline_checks_bolt.jpg) | Baseline: 52 tests, typecheck, lint, build pass |
| [P02](screenshots/P02_baseline_app_v11_live.jpg) | Baseline app, Bolt version 11 |
| [P03](screenshots/P03_code_npm_test_64_passed.jpg) | After the change: 64 tests pass |
| [P04](screenshots/P04_code_contract_T1-T8_and_checks.jpg) | Contract tests T1-T8 and checks |
| [P05](screenshots/P05_code_T2_overlap.jpg) | Code-based T2 overlap |
| [P06](screenshots/P06_code_T4_duration0.jpg) | Code-based T4 duration 0 |
| [P07](screenshots/P07_code_T1_360px.jpg) | Code-based at 360 px |
| [L01](screenshots/L01_appsmith_Rules_jsobject.jpg) | Appsmith `Rules` JS object |
| [L02](screenshots/L02_appsmith_editor.jpg) | Appsmith editor |
| [L03](screenshots/L03_appsmith_T2_overlap.jpg) | Appsmith T2 overlap |
| [L04](screenshots/L04_appsmith_T4_duration0.jpg) | Appsmith T4 duration 0 |
| [L05](screenshots/L05_appsmith_T1_360px.jpg) | Appsmith at 360 px |
| [G01](screenshots/G01_github_repo_public.jpg) | Public GitHub repository |
