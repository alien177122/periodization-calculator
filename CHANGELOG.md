# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.3] — 2026-10-22

### Removed

- Debug ingest (`#region agent log` / `127.0.0.1:7373`) from `server/app.js` and `server/file-workspace.js`
- Unused `CalculatorTabV3` and `initNativeShell` stubs

### Fixed

- Lint: overlay-gate `setState` in effect → `useSyncExternalStore`; `useSplitConstructor` missing `savedSplits` dep
- Guest wallpaper: WebM + AVIF/WebP posters, no `preload="auto"`, load after gesture or Wi-Fi (not first paint); `dist/` budget ≤ 5 MB

### Security

- `npm audit fix` for `proxy-addr`, `ip-address`, `qs`, `express-rate-limit`, `body-parser` (Express 5 stayed on 5.2.x)

### Added

- GitHub Actions CI: typecheck, test, lint, build (Node 22)

### Changed

- Docs (`README`, `ARCHITECTURE`, `STRUCTURE`, `AGENTS.md`) aligned with Vite 7 + React 19 + Express 5 + `@training/shared` web-only product

## [0.0.2] — 2026-08-04

### Fixed

- Сплит: `completedWeeks` / `completedDays` больше не теряются при `loadUser` (stepper после логина)
- Program 2.0 unlock канон: ровно **12** упражнений (`EX_COUNT`); split-extras вне unlock
- TabNav flush к низу на iPhone (safe-area), выравнивание кнопок журнала на 390px
- Light hero / glass на вкладках — сверка 390px; auth triptych breathing layout

### Added

- Expo `apps/mobile` full port Waves 0–5: auth, 5 tabs, SecureStore JWT, guest offline
- Uncle Bob quality gates: Gherkin one-RM, mutation pilot, `npm run quality`
- Capacitor iOS/Android shells, Fastlane scaffold
- LAN/Venus release workflow: `scripts/release-pack-lan.sh`

### Changed

- No-pill UI preference: chips/RM badges → rounded rectangles (split-like)
- Store roadmap: Expo+EAS primary; Capacitor fallback; Telegram deferred

## [0.0.1] — 2026-08-03

### Added

- Open source packaging: MIT `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`
- `docs/open-source-plan.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`
- `docs/design-standards/` — UI reference docs for contributors
- GitHub issue and pull request templates
- Первый Venus snapshot `React_Project_2026-08-03_v0.001`

### Changed

- `gym.db` removed from version control (local SQLite only; never commit databases)
- README: open source section, contributing and security links

### Security

- Documented vulnerability reporting in `SECURITY.md`
