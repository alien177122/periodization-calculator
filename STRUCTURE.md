# Monorepo Structure (web-only, v0.003)

Краткая карта продукта: Vite 7 + React 19 + Express 5 + `@training/shared`. Native-оболочки лежат в `_archive-non-web/`.

## Web core (корень — primary track)

| Путь                     | Назначение                                                                |
| ------------------------ | ------------------------------------------------------------------------- |
| `src/`                   | Vite + React 19 web UI (screens, components, hooks, styles)               |
| `server/`                | Express 5 + SQLite REST API                                               |
| `packages/shared/`       | `@training/shared` — hooks, utils, program v3, API client                 |
| `tests/`                 | Node test runner suite для shared/server logic                            |
| `scripts/`               | Root dev/infra scripts (PWA icons, public tunnel, files, seed)            |
| `public/`                | Static assets, PWA manifest, compressed wallpaper WebM/posters            |
| `memory-bank/`           | Maintainer agent context (reference mirrored in `docs/design-standards/`) |
| `docs/design-standards/` | Public UI design references for contributors                              |
| `.github/workflows/`     | CI: typecheck, test, lint, build                                          |
| `.cursor/`               | Cursor rules + skills                                                     |

## Native / desktop shells (archived)

Перенесены 2026-08-27 в [`_archive-non-web/`](_archive-non-web/README.md) (не удалены):

| Путь в архиве                          | Назначение       |
| -------------------------------------- | ---------------- | ---- |
| `_archive-non-web/desktop/`            | Electron         |
| `_archive-non-web/ios/`, `android/`    | Capacitor native |
| `\_archive-non-web/apps/mobile         | macos`           | Expo |
| `_archive-non-web/capacitor.config.ts` | Capacitor config |
| `_archive-non-web/fastlane/`           | Fastlane         |

## Meta (не продуктовый код)

| Путь                             | Назначение                                      |
| -------------------------------- | ----------------------------------------------- |
| `_meta/cursor-memory-bank-main/` | Upstream Memory Bank v0.8 template (справочник) |
| `_meta/archive/`                 | Archived root clutter                           |
| `docker/agentmemory/`            | Optional agentmemory engine compose             |

## Workspaces (npm)

```json
"workspaces": ["packages/*"]
```

Root scripts: `npm run dev`, `npm run server`, `npm run build`, `npm run typecheck`, `npm test`, `npm run lint`, `npm run docker:up` (optional prod).

## Не трогать без задачи

`.claude/`, `.codex/`, `.agents/`, `docker-data/`, `logs/`, `workspace-files/`, `gym.db`
