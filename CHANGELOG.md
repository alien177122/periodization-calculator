# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Single TS 1RM source: `server/calc.js` re-exports `packages/shared/src/utils/calc.ts` (R04-2.1)
- Rust calc crate `packages/core-rs` (Epley/Brzycki) and wasm package `@training/core` with TS fallback for PWA/offline

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
