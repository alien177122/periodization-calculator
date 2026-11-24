# Отчёт по восстановлению репозитория — 2026-11-07

Документ фиксирует состояние на начало работы, выполненный план и то,
что осталось за владельцем.

## 1. Что было не так

Анализ проводился на живом коде, все утверждения проверены командами.

| # | Проблема | Доказательство |
|---|----------|---------------|
| 1 | **286 незакоммиченных изменений** в `Web_Calculator` (97 M, 96 D, 93 `??`), из них 88 содержательных файлов (claim-ledger'ы, планы canon, отчёты рерайта) существовали только на диске | `git status --porcelain` |
| 2 | **Rust-ветка отставала на 10 коммитов**: без security-серии, без CI, без 13 дней продуктовой работы | `git log --left-right` |
| 3 | **Swith/ (5068 строк Swift), ios/, icons/ — вне git**: корень workspace не был репозиторием | `ls -la` |
| 4 | **9 коммитов не запушены** — вся security-серия лежала только на этом диске | `git rev-list --count origin/main..HEAD` |
| 5 | **Мёртвый remote `gdrive`** указывал на домашний каталог другого пользователя | `git ls-remote gdrive` → fatal |
| 6 | **husky-хук был неисполняемым с 30 июня** — pre-commit гейт (`npm test` + `npm run typecheck`) молча не срабатывал ни на одном коммите | `ls -l .husky/_/` → `-rw-r--r--` |
| 7 | **Мусор в дереве** (`brag-output-*` 19 МБ, `.hyperframes/` 2.1 МБ, релизные tarball 283 МБ) не был в `.gitignore` и маскировал реальные изменения | `git check-ignore` |
| 8 | 41 локальная ветка, 28 не слитых, включая апрельские security-фиксы | `git branch` |

Дополнительно найдено и исправлено:

- **`server/db.sqlite`** — в индексе отсутствовал (фикс из security-аудита применён, но не закоммичен).
- **Четыре апрельских security-фикса** из неслитых веток — проверено, что все эквиваленты присутствуют в текущем коде: лимит пароля 72 (`server/passwordPolicy.js:43`), защита от timing-атаки (`server/app.js:263` `LOGIN_DUMMY_HASH`), обязательный `JWT_SECRET` в production (`server/config.js:63`), валидация данных пользователя (`server/schema.js:584` `normalizeUserData`).

## 2. Что сделано

### Фаза 0 — страховка

`~/Desktop/Calculator/backups/safety-2026-11-07/`:

| Файл | Размер | Содержимое |
|------|--------|------------|
| `repo.bundle` | 152 МБ | вся история всех веток (`git bundle verify` — ok) |
| `web_calculator_worktree.tgz` | 159 МБ | 7772 файла рабочего дерева |
| `worktree.patch` | 1.3 МБ | диф всех незакоммиченных изменений |
| `status.txt` | 13 КБ | снимок состояния до работ |

### Фаза 1–2 — гигиена репозитория

- `.gitignore` дополнен: agent-воркспейсы, `canon/`, локальные QA-артефакты, релизные tarball, кэши Python.
- Снято с отслеживания **944 файла** (agent-воркспейсы, canon, архив, оффлайн-скриншоты) — по решению владельца `ee3474ab`, которое эта ветка теперь продолжает. Файлы остались на диске.
- Ценное из `canon/memory-bank` перенесено в `docs/memory-bank/` (ESSENTIALS, diagram-tools, 5 планов), чтобы не потерять при очистке.

### Фаза 3 — 12 доменных коммитов

| Коммит | Содержание |
|--------|-----------|
| `chore(repo)` | untrack agent-воркспейсов и canon (950 файлов) |
| `chore(hooks)` | восстановлен бит исполнения husky-хука |
| `fix(server)` | security-аудит 2026-11-07: trust proxy, dev-bind, лимит имени, утечка OCR, non-root Docker, `OLLAMA_URL` |
| `feat(split)` | профили тренировок, база веса, прогноз нагрузки на 8 недель |
| `feat(split)` | конструктор: выбор упражнений, история, тулбар |
| `feat(journal)` | офлайн-очередь, оптимистичные сохранения, статус связи |
| `feat(theory)` | диаграммы лекций, 13 claim-ledger'ов, валидатор источников |
| `refactor(ui)` | удаление видео-обоев (AppWallpaperVideo, wallpaper-videos, overlay gate, 9 файлов) |
| `feat(selfstudy)` | модуль самообучения, 14 статей |
| `chore(build)` | зависимости, CI, dev-оснастка |
| `chore(release)` | favicon, PWA-манифест, заметки релизов |
| `docs` | контекст проекта, аудиты, исследовательская база EuropePMC |

### Фаза 4 — синхронизация с origin

- `Merge origin/main` → взяты `ee3474ab` (untrack) и `849f95cd` (переписанные README). Конфликт README разрешён в пользу канонической версии владельца, локальная подсказка про Node 22 перенесена в «Быстрый старт».
- `Merge origin/cursor/appsheet-wave0-9228` → ветка с таким именем уже была в origin на коммите `d055a3b9` (это база Rust-ветки). Force-push не применялся: обе линии сохранены в графе, три конфликта (useSplitConstructor, SplitConstructorTab, split-constructor.css) разрешены в пользу развитой версии текущей ветки.
- **Push выполнен**: `cursor/appsheet-wave0-9228` → `e2da1922`, `cursor/rust-core-calc-1fb7` → `b168017d`. Ветка `main` в origin не трогалась.

### Фаза 5 — Rust-ветка

`Merge cursor/appsheet-wave0-9228 into cursor/rust-core-calc-1fb7`: rust-ветка получила всю основную линию (security, CI, 12 доменных коммитов). Конфликты разрешены **объединением**, обе стороны сохранены:

- `package.json` — `dev:learn`/`dev:previews` + `vite-plugin-wasm`, `typescript-eslint ^8.72.1`
- `packages/shared/package.json` — `@training/core` (Rust) + `zod ^4.6.7` (security-обновление)
- `vite.config.ts` — `wasm()` + `tunnelHmrPortPlugin`/`omitHeavyPublicSources`/`iphoneHarness`
- `eslint.config.js` — ignore `**/DerivedData` сохранён, ignores для `core-rs`/`core/wasm` остались
- `CHANGELOG.md` — секции Added (Rust-ядро) и Security/Changed (основная линия)
- `package-lock.json` — перегенерирован под `zod 4` и `vite-plugin-wasm`

### Фаза 6 — репозиторий нативных целей

Корень workspace стал git-репозиторием: 73 файла, 24 Swift-файла — `Swith/`, `ios/`, `icons/`, `ios-shots/`, `PLAN-2026-10-14.md`, `THEORY-EDIT-2026-10-14.md`, `README.md` с картой workspace. Веб-репозиторий и `backups/` исключены, артефакты сборки Xcode/SwiftPM не коммитятся.

### Фаза 7 — чистка

- Мёртвый remote `gdrive` удалён. URL для восстановления:
  ```
  git remote add gdrive "/Users/steve_gordiyenko/Library/CloudStorage/GoogleDrive-alien177122@gmail.com/Другие компьютеры/Мое устройство Ноутбук/Backups/React_Project_Журнал_Сплит/repo.git"
  ```
- Удалено 10 слитых устаревших веток. `main`, `backup/pre-appsheet-2026-10-25`, `cursor/appsheet-wave0-origin`, `rust-core-full-backup` и все 28 неслитых сохранены.

## 3. Проверка после работ

| Worktree | typecheck | lint | тесты | build | cargo |
|----------|-----------|------|-------|-------|-------|
| `cursor/appsheet-wave0-9228` | чисто | 0 ошибок | 283/283 | ok (1.75 с) | — |
| `cursor/rust-core-calc-1fb7` | чисто | 0 ошибок | 289/289 | ok (1.89 с) | 14/14 |

Рабочее дерево обоих worktree чистое.

## 4. Осталось за владельцем

1. **CI на GitHub.** `.github/workflows/ci.yml` создан локально, но OAuth-токен `gh` (`gho_*`) без скоупа `workflow` — GitHub отклоняет любой пуш, меняющий workflow-файл. Поэтому ci.yml убран из индекса (на диске и в истории он есть). Возврат:
   ```sh
   gh auth refresh -s workflow
   git add -f .github/workflows/ci.yml && git commit -m "ci: restore workflow" && git push
   ```
2. **`gym.db` в истории git** — требует `git filter-repo --path gym.db --invert-paths`, force-push и ротации всех `JWT_SECRET`/паролей. Не выполнялось: необратимо и затрагивает все ветки и зеркала.
3. **Ветка `main`** — локально не задеплоена; рабочие ветки — `cursor/*`. Стоит решить, делается ли PR в `main` или `main` обновляется напрямую.
4. **28 неслитых веток** — среди них апрельские security-фиксы, все эквиваленты уже в текущем коде; кандидаты на удаление.
5. **Rust-миграция** — 280 строк и 6 модулей-заглушек; `progression.rs` = 9 строк.

## 5. Откат

- История: `git reflog`, откат merge — `git reset --hard <commit>`.
- Файлы до начала работ: `backups/safety-2026-11-07/web_calculator_worktree.tgz`.
- Исходное состояние ветки `cursor/appsheet-wave0-9228`: `ab461118`.
- Состояние Rust-ветки до merge: `a9b29158`.
