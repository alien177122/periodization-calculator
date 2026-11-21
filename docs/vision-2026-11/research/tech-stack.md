# tech-stack.md — Технологии для следующего этапа «Журнала Сплит»

**Исследование от 2026-11-07, для внутреннего планирования**

Продукт: веб-приложение силовой периодизации (React 19 + TS + Vite 7, Express 5 + SQLite, PWA + Capacitor). Главная цель продукта — **стать сильнее и здоровее**. Это не маркетинговая строка, а критерий отбора технологий: каждая технология ниже оценивается по одному вопросу — «как она усиливает контур _тренировка → журнал → обратная связь → коррекция_ и оздоровительную часть (кардио, восстановление, смертность-маркеры)?»

---

## 1. Почему офлайн-first — это не «красиво», а необходимо для цели

Зал — среда с плохим Wi-Fi, iPhone в кармане, PWA может умереть на середине тренировки. Если запись подхода теряется, теряется e1RM, теряется волновая коррекция — рушится вся ценность журнала. Сегодня у нас сервер-authoritative (Express+SQLite, JWT): сеть недоступна → приложение бесполезно. Значит, стратегическая цель — **журнал всегда пишет локально, синхронизация фоновая**. Второй мотив — «здоровье» тоже должно собираться офлайн: сон, пульс покоя, HRV, интервалы кардио с замером восстановления (см. metrics-ideas.md) — всё это датчики, которые пишут непрерывно, а сеть появляется эпизодически.

### Что предлагают решения (сравнение)

| Решение                                                            | Модель                                                                 | Конфликты                                 | Можно ли вставить бизнес-логику в запись             | Зрелость                                                                                                                          | Сложность для нас                          |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **cr-sqlite** (vlcn-io)                                            | CRDT-расширение SQLite, multi-master, «git для данных»                 | автоматический LWW по колонкам            | **нет** — сервер не может отклонить запись           | beta; релиз v0.16.3 заморожен в янв. 2024, но main жив (коммиты до авг. 2026), в проде у Fly (corrosion, ~1000 узлов, 300k ops/s) | M                                          |
| **PowerSync**                                                      | Postgres/Mongo → клиентский SQLite; запись идёт **через наш бэкенд**   | разрешает наш сервер                      | **да** — сервер-authoritative, валидация/авторизация | production (GA)                                                                                                                   | M                                          |
| **ElectricSQL (Shapes)**                                           | Postgres WAL → SQLite, запись напрямую в Postgres                      | CRDT LWW                                  | нет (мимо бэкенда)                                   | production, но привязка к Postgres, high memory на сервере                                                                        | M–L                                        |
| **Turso Sync / embedded replicas**                                 | libSQL локально + облако, `push()`/`pull()`                            | «last push wins», детекция без разрешения | частично                                             | embedded replicas — GA; offline sync — beta, «data loss possible»                                                                 | S–M                                        |
| **Свой минималистичный sync** (таблица `changes` + LWW на сервере) | клиент SQLite (sql.js/WA-SQLite/OPFS) пишет локально, выгружает дельты | LWW по updated_at                         | **да**, полный контроль                              | n/a — свой код                                                                                                                    | S–M (проверенный путь для нашего масштаба) |

Источники: [cr-sqlite releases/issues](https://github.com/vlcn-io/cr-sqlite/releases), [issue «Is this project dead?»](https://github.com/vlcn-io/cr-sqlite/issues/444) (внутри — опыт Fly/jeromegn: 7.5 млн строк, p99 репликации ~1 с), [SQLite Sync Tooling — Agentic Developer Cookbook](https://agenticdevelopercookbook.com/guidelines/planning/data/sync-tooling), [PowerSync: ElectricSQL vs PowerSync](https://powersync.com/blog/electricsql-vs-powersync), [docs.powersync.com/architecture/client-architecture](https://docs.powersync.com/architecture/client-architecture), [Turso Offline Sync public beta](https://turso.tech/blog/turso-offline-sync-public-beta), [Turso Sync usage](https://docs.turso.tech/sync/usage), [Local-First Databases обзор](https://queryplane.com/blog/local-first-databases/).

### Дерево решений: «какой офлайн-план выбрать?»

- **Если цель — только «не терять тренировку без сети»** (записал локально, долил позже):
  - План A (рекомендуемый первый шаг, S): локальный кэш-очередь — PWA IndexedDB/sqlite-wasm копит записи, при появлении сети POST-батчами на существующий Express API. Ноль миграций, обратимо.
  - План B (M): клиентский SQLite в браузере (wa-sqlite/sql.js + OPFS) + ручная дельта-синхронизация по `updated_at`. Полный контроль конфликтов.
- **Если цель — «два устройства с одной базой и автоматический мерж»** (телефон + планшет):
  - План C (M–L): cr-sqlite на клиенте + сервер-ретранслятор `crsql_changes`. Риск: замороженные релизы, нужно собирать из исходников; LWW по колонкам скрывает конфликты, а не решает их — для журнала (append-only логи) это приемлемо: записи тренировок почти не конфликтуют.
- **Если цель — «полноценный сервер-authoritative sync в проде без своего протокола»**:
  - План D (M): PowerSync — но он тянет Postgres/Mongo как источник. Для нас это замена Express+SQLite на Postgres — большой шаг ради одной фичи.
- **Если цель — «всё это на Turso и не думать»**: embedded replicas GA, но offline-write sync — beta с прямым предупреждением о потере данных — **не для журнала пользователя** на текущем этапе.

**Вывод:** начать с плана A, эволюционировать к B; C — только если появится реальный мульти-девайс спрос. Это согласуется с правилом «оптимизируй после измерения».

---

## 2. Локальный ML на клиенте: анализ техники с камеры — можно уже сейчас

Здоровье — это не только сила, но и техника: жим лёжа с «прыгающими» лопатками и присед с коллящимися коленями — дорога к травме. Тренд последних двух лет: **поза-оценка ушла в браузер без сервера**, приватно и бесплатно.

### Варианты

| Инструмент                                                | Что даёт                                                                                                         | Размер/требования                       | Сложность | Ссылка                                                                                                                                                                                                                      |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MediaPipe Pose Landmarker** (`@mediapipe/tasks-vision`) | 33 landmark 2D + worldLandmarks 3D, режим VIDEO, живая камера, WebGL-delegate (WebGPU пока только для LLM-задач) | lite-модель ~3–9 МБ, работает в WebView | S–M       | [гайд Web](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js), [samples-worker](https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/workers/pose-landmarker.worker.ts) |
| **transformers.js + ViTPose (ONNX)**                      | 17 COCO-ключей, top-down (нужен bbox), q8-квантование, ~87 МБ, кэшируется                                        | WebAssembly, без WebGPU                 | M         | [onnx-community/vitpose-base-simple](https://huggingface.co/onnx-community/vitpose-base-simple?library=transformers.js), [обзор webai.show](https://webai.show/models/vitpose-pose/)                                        |
| **transformers.js + RTMO-l**                              | one-stage: сразу bbox+17 ключей, без детектора                                                                   | тяжелеет на медленных девайсах          | M         | [Xenova/RTMO-l](https://huggingface.co/Xenova/RTMO-l)                                                                                                                                                                       |
| **onnxruntime-web + YOLOv8n-pose**                        | лёгкая (~12.7 МБ) pose-модель, TFJS-вариант «быстро», ONNX «медленнее»                                           | vanilla JS демо-код готов               | S         | [akbartus/Yolov8-Pose-Detection-on-Browser](https://github.com/akbartus/yolov8-pose-detection-on-browser)                                                                                                                   |

### Дерево решений: «если делаем анализ техники»

- **Цель: живой счётчик глубины приседа / траектории грифа на видео после тренировки** → План A: MediaPipe в web worker на записанном видео (не реальное время), извлекаем траектории ключей (таз, колено, гриф), считаем углы и глубину, рисуем оверлей. S–M, офлайн, приватно.
- **Цель: реалтайм-подсказка во время подхода** → План B: MediaPipe VIDEO-mode + rAF-цикл + worker (детекция блокирует поток — нужен worker), ограничение: WebGL-delegate, WebGPU для vision ещё не включён ([issue #5826](https://github.com/google-ai-edge/mediapipe/issues/5826)). M.
- **Цель: «умный» анализ качества движения (асимметрии, дрейф)** → План C: ViTPose/RTMO + своя метрика на ключах; аккуратно — модели валидированы на COCO, не на штангах; стартуем с углов и траекторий, не с «оценок техники». L.

Ограничение честности: ни одна из моделей не «понимает» упражнение; мы меряем геометрию (глубина, колени-в-сторону, наклон таза) и показываем пользователю, не вынося вердикт «правильно/неправильно».

---

## 3. Графы и дашборды: что рисовать журналу

Метрики (e1RM, тоннаж, дельта за 4 недели, HRV, восстановление) требуют дешёвых, отзывчивых графиков на iPhone. Замеры (одинаковая столбиковая диаграмма, min+gzip, React не в счёте):

| Библиотека                     | Размер (gzip)                  | Стиль                        | Подходит                                   |
| ------------------------------ | ------------------------------ | ---------------------------- | ------------------------------------------ |
| **Chart.js + react-chartjs-2** | ~54 КБ                         | Canvas, config-объект        | дефолт: много точек, мало места            |
| **Recharts 3.x**               | ~116–172 КБ                    | SVG, React-компоненты        | быстрые прототипы, shadcn-стиль            |
| **ECharts 6**                  | ~193 КБ (core) / 400 КБ (full) | Canvas/SVG, огромный options | сложные дашборды, heatmap, large data      |
| **D3 (низкоуровнево)**         | ~90 КБ                         | полная свобода               | кастомные «профили мышц», радиальные спиды |
| **uPlot**                      | ~22 КБ                         | Canvas, минимальный          | долгие ряды HRV/пульса за год              |
| **TanStack Charts**            | ~43–50 КБ                      | React-фёрст                  | свежая альтернатива с типами               |

Источники: [React Chart Libraries Compared (замеры esbuild+gzip)](https://we.inc/guides/react-chart-libraries), [TanStack Charts comparison](https://tanstack.com/charts/latest/docs/comparison), [Strapi: Chart Libraries 2026](https://strapi.io/blog/chart-libraries).

**Дерево решений:** базовые линии/бары журнала → Chart.js (бюджет бандла, iPhone); «профиль тела»/radar и нестандартная графика → D3-модуль лениво (`import()`); тяжёлый годовой дашборд HRV → uPlot. Recharts не тащим: уже 116+ КБ за удобство компонентов.

---

## 4. Экспорт данных и health-интеграции: «здоровье» требует источников данных

Цель «здоровее» упирается в данные, которых у нас нет: сон, пульс покоя, HRV, шаги, вес тела. Каналы:

| Канал                                              | Что даёт                                                                                                                                                     | Как встроить                                                                                                                                                                                                 | Сложность |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| **Apple HealthKit XML-экспорт**                    | полный архив: сон, пульс, HRV, вес                                                                                                                           | пользователь выгружает `export.xml` из Health → парсим стримингово (`@cvyl/apple-health-parser`, потоковый xml-stream)                                                                                       | S         |
| **HealthKit / Health Connect нативно (Capacitor)** | живой доступ без выгрузки                                                                                                                                    | официальный `@capacitor/health-fitness` (HealthKit + Health Connect; нужны entitlements `NSHealthShareUsageDescription` и т.д.) или `capacitor-health-connect` (Android: readRecords/getChanges/permissions) | M         |
| **OpenWeight**                                     | открытый vendor-neutral JSON для силовых программ/тренировок, конвертеры из Strong/Hevy CSV                                                                  | `npx @openweight/cli convert hevy.csv` → импорт истории                                                                                                                                                      | S         |
| **Hevy API v1**                                    | миграция пользователей Hevy (workouts, routines); key через hevy.com/settings?developer (Pro), пагинация page/pageSize (10/100), rate limits не опубликованы | серверный инвайтер «перенеси историю из Hevy»                                                                                                                                                                | S–M       |
| **Strong CSV**                                     | де-факто формат обмена между трекерами (Hevy импортирует именно его)                                                                                         | парсер Strong-CSV на сервере                                                                                                                                                                                 | S         |

Источники: [@cvyl/apple-health-parser](https://github.com/cvyl/apple-health-parser), [@capacitor/health-fitness docs](https://capacitorjs.com/docs/apis/health-fitness), [ubie-oss/capacitor-health-connect](https://github.com/ubie-oss/capacitor-health-connect), [openweight](https://github.com/radupana/openweight), [Hevy: экспорт/импорт](https://help.hevyapp.com/hc/en-us/articles/43708290987415-Exporting-Your-Data-from-Hevy), [Hevy rate limits — не публикуются](https://apis.io/rate-limits/hevy/hevy-rate-limits/), [формат HealthKit workouts](https://support.mydatahelps.org/apple-healthkitv2-workouts-export-format).

**Важно:** HealthKit workouts не содержат подходов/повторений/весов — только сессии (тип, длительность, калории). Силовую историю можно тянуть только через Hevy/Strong CSV или OpenWeight — это и есть «золотая жила» онбординга: человек приносит годы истории за минуту.

---

## 5. Бэкенд-альтернатива: Hono + Drizzle (взамен Express 5 + сырой SQLite)

Что даёт: единый Web-Standard-роутер (работает на Node, Bun, Deno, Workers — будущий деплой гибче), миграции из TS-схемы (`drizzle-kit generate/migrate`), типы `tables.$inferSelect` без ручных интерфейсов, совместимость с `better-sqlite3` и `node:sqlite`. Миграция бесшовна: Hono ставится через `@hono/node-server`, роуты переписываются 1:1 — реальный кейс «absolutely seamless migration» с Express. Сложность: **S–M** (низкорисковая, можно по эндпоинту).

Дерево решений: **если** планируется офлайн-синк со сложной логикой записи → сначала Hono+Drizzle (типизированная схема = тесты синка типобезопасны), потом синк. **Если** деплой останется на своём VPS — можно не трогать; это не приоритет перед офлайн-модой.

Источники: [Drizzle + SQLite get-started](https://orm.drizzle.team/docs/get-started/node-sqlite-new), [Drizzle migrations](https://orm.drizzle.team/docs/sqlite/migrations), [Hono+Drizzle туториал](https://dev.to/aaronksaunders/getting-started-with-hono-js-and-drizzle-orm-2g6i), [Hono CRUD гайд Enrise](https://www.enrisetech.com/insights/first-hono-crud-api), [HN-обсуждение миграции Express→Hono](https://news.ycombinator.com/item?id=45801403).

---

## 6. Tauri 2 для десктопа (и не только)

Tauri 2.0 stable (окт. 2024) даёт **десктоп (macOS/Windows/Linux) + iOS/Android** из одного веб-кода, нативные плагины на Swift/Kotlin, HMR на мобильных; текущая стабильная ветка 2.9.x (осень 2025). Зачем нам: пользователь на ПК хочет большой дашборд и «Теорию» с полноразмерными графиками; десктоп-приложение — самый дешёвый способ дать это без нового фронтенда. Сложность: **S** для десктопа (Rust-тулчейн + `tauri init` поверх `npm run build`), **M** для мобильной замены Capacitor (плюс только встроенные апдейты и нативные плагины — но у нас Capacitor уже работает и iOS-обёртка живая; миграция сейчас не оправдана).

Дерево решений: **если** нужен десктоп → Tauri-обёртка того же билда (S); **если** появится потребность в нативных фичах, которых нет в Capacitor (здоровье-фоны, файловая система) → Tauri mobile плагины, но не раньше реального запроса.

Источники: [Tauri 2.0 Stable Release](https://v2.tauri.app/blog/tauri-20/), [changelog 2.9.x](https://v2.tauri.app/release/tauri/all-versions/), [CLI: ios/android команды](https://v2.tauri.app/reference/cli/), [prerequisites mobile](https://v2.tauri.app/start/prerequisites/).

---

## 7. Сводный приоритет (что внедрять, если цель — «сильнее и здоровее»)

1. **S — офлайн-запись тренировки (план A)** — без этого весь продукт хрупок в зале.
2. **S — импорт Hevy/Strong CSV → OpenWeight-модель** — мгновенная ценность для нового пользователя (годы истории).
3. **S — Apple Health XML-парсер + ручной импорт** — данные сна/пульса для метрик восстановления (см. metrics-ideas.md).
4. **M — кардио-модуль с пульсом** (см. training-systems.md §7) — опирается на п.3 и на HRV/пульс покоя.
5. **M — MediaPipe-анализ техники на записанном видео** — оверлеи поверх журнала.
6. **S–M — Hono+Drizzle** — когда начнём трогать API под синк.
7. **M–L — cr-sqlite / клиентский SQLite** — только при мульти-девайс спросе.
8. **S — Tauri-десктоп** — когда появится аудитория на ПК.

---

## Источники

- https://github.com/vlcn-io/cr-sqlite (releases, issues #444, #455)
- https://agenticdevelopercookbook.com/guidelines/planning/data/sync-tooling
- https://powersync.com/blog/electricsql-vs-powersync · https://docs.powersync.com/architecture/client-architecture
- https://turso.tech/blog/turso-offline-sync-public-beta · https://docs.turso.tech/sync/usage · https://docs.turso.tech/features/embedded-replicas/introduction
- https://queryplane.com/blog/local-first-databases/
- https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js
- https://github.com/google-ai-edge/mediapipe/issues/5826 · https://github.com/google-ai-edge/mediapipe-samples-web
- https://huggingface.co/onnx-community/vitpose-base-simple · https://webai.show/models/vitpose-pose/ · https://huggingface.co/Xenova/RTMO-l
- https://github.com/akbartus/yolov8-pose-detection-on-browser
- https://we.inc/guides/react-chart-libraries · https://tanstack.com/charts/latest/docs/comparison · https://strapi.io/blog/chart-libraries
- https://github.com/cvyl/apple-health-parser · https://capacitorjs.com/docs/apis/health-fitness · https://github.com/ubie-oss/capacitor-health-connect
- https://github.com/radupana/openweight · https://help.hevyapp.com/hc/en-us/articles/43708290987415 · https://apis.io/rate-limits/hevy/hevy-rate-limits/
- https://orm.drizzle.team/docs/get-started/node-sqlite-new · https://orm.drizzle.team/docs/sqlite/migrations · https://dev.to/aaronksaunders/getting-started-with-hono-js-and-drizzle-orm-2g6i · https://news.ycombinator.com/item?id=45801403
- https://v2.tauri.app/blog/tauri-20/ · https://v2.tauri.app/release/tauri/all-versions/
