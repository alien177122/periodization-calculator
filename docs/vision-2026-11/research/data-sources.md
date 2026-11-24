# data-sources.md — Базы данных и источники по тренировкам и спортивной медицине

**Исследование от 2026-11-07, для внутреннего планирования**

Продукт «Журнал Сплит» (цель: **стать сильнее и здоровее**) нуждается в трёх типах внешних данных: (1) справочник упражнений и база пользователей, (2) научная база для раздела «Теория» и рекомендаций, (3) нормативные/эталонные данные (нормы силы, статистика пауэрлифтинга). Ниже — что доступно, что легально, как встроить. Общий принцип: **не скрейпить то, что дают официально** — почти всё ниже имеет API или downloadable dataset.

---

## 1. GitHub-источники (данные и код)

### 1.1 Справочник упражнений

| Источник                               | Что даёт                                                                                                                       | Лицензия                                                                                        | Встроение                                                                                                                        | Оценка                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **yuhonas/free-exercise-db**           | 800+ упражнений, JSON + JSON Schema, изображения, поисковый фронтенд                                                           | **The Unlicense (public domain)** — коммерческое использование свободно, атрибуция не требуется | vendor-файл `exercises.json` в бандл или сервер; изображения можно лить с raw.githubusercontent или положить локально            | ★ лучший старт: legally-чисто, структурно                  |
| **wger** (wger-project/wger)           | живой проект: REST API `/api/v2/`, база упражнений с мышцами/оборудованием/вариациями, видео, переводы; self-hostable (Docker) | код **AGPL-3.0+**, данные упражнений **CC-BY-SA 3.0** (share-alike обязателен)                  | либо API `wger.de/api/v2/exercise/` (публично, без auth), либо self-host и mirror; атрибуция + share-alike на производные данные | ★ самый живой API; AGPL влияет только на код, если форкаем |
| **ExerciseDB / exercisedb-api**        | 11000+ упражнений, видео/gif, инструкции; публичный API                                                                        | код **AGPL-3.0**; есть коммерческий хостинг (ascendapi.com) с лимитами                          | демо-эндпоинты «not recommended for production»; для прода — коммерческий тариф или зеркалирование данных с оглядкой на лицензию | M; осторожно с лицензией на медиа                          |
| **OpenPowerlifting (gitlab opl-data)** | архив соревновательных результатов мира: CSV по всем федерациям, история изменений, чекер дубликатов                           | **данные — public domain (CC0-стиль waiver)**; код — AGPLv3+                                    | download CSV → наша таблица нормативов/перцентиля по весовым категориям                                                          | ★ уникальные данные для «где я по сравнению с ровесниками» |

Источники: [free-exercise-db LICENSE](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md), [репо free-exercise-db](https://github.com/yuhonas/free-exercise-db/), [wger GitHub](https://github.com/wger-project/wger), [wger API docs](https://wger.readthedocs.io/en/latest/api/api.html), [wger API root](https://wger.de/api/v2/), [OpenPowerlifting GitLab](https://gitlab.com/openpowerlifting/opl-data), [OpenPowerlifting Data Service](https://openpowerlifting.gitlab.io/opl-csv/), [exercisedb-api](https://github.com/ExerciseDB/exercisedb-api).

**Ловушка лицензий:** CC-BY-SA на данные wger означает, что если мы смешаем их данные с нашей курируемой базой и отдадим наружу как «нашу базу упражнений», производный датасет обязан быть CC-BY-SA с атрибуцией. Чистый путь: держать wger-данные отдельным слоем «внешнего справочника», а собственную курируемую базу — отдельно.

### 1.2 Интеграции с трекерами

- **Hevy API v1** (`api.hevyapp.com/v1/`, header `api-key`): workouts, routines, exercise-templates, folders; пагинация `page/pageSize` (10/100), rate limits **не опубликованы** — экспоненциальный бэкофф на 429, пауза 200–500 мс между запросами. Ключ — Hevy Pro. Это канал онбординга «перенеси историю», а не источник данных приложения. ([docs](https://api.hevyapp.com/docs/), [rate-limits профиль](https://apis.io/rate-limits/hevy/hevy-rate-limits/), [опыт hevy-cli](https://github.com/marinsalinas/hevy-cli))
- **OpenWeight** — открытый JSON-стандарт силовых данных + CLI-конвертеры Strong/Hevy CSV → JSON: наш серверный парсер может просто принимать OpenWeight как canonical-формат импорта. ([github](https://github.com/radupana/openweight))
- **Apple Health XML** (`export.xml`) — парсеры `@cvyl/apple-health-parser` (потоковый, TS) и rust `helix_connect::parse_apple_health` как референс; формат описан в [HealthKitV2 экспорт-спецификации](https://support.mydatahelps.org/apple-healthkitv2-workouts-export-format). Для мобильной обёртки — `@capacitor/health-fitness` (HealthKit+Health Connect) и `capacitor-health-connect`.

---

## 2. НЕ-GitHub: научные API — как программно тянуть мета-анализы

Раздел «Теория» и коэффициенты калькулятора (объём, RIR/RPE, частота) должны опираться на проверяемые источники. Задача: **автоматически находить свежие мета-анализы по ключевым темам** («resistance training volume meta-analysis», «repetitions in reserve hypertrophy», «training frequency strength») и обновлять «Теорию» по ним.

### 2.1 Сравнение API

| API                            | Покрытие                                                             | Ключ                                  | Лимиты                   | Абстракты                                                    | Лицензия данных                              | Сильная сторона                                                                               |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------- | ------------------------ | ------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Europe PMC REST**            | 33+ млн публикаций (PubMed + Agricola + препринты), 10 млн full-text | не нужен                              | щедрые, pageSize до 1000 | да (`resultType=core`), MeSH-термины, text-mined annotations | открытый сервис EBI                          | единственный с **полным текстом OA** и search-синтаксисом `PUB_YEAR`, `SRC:MED`               |
| **PubMed E-utilities**         | PubMed                                                               | не нужен (пакетные с ключом)          | 3 req/s без ключа        | abstract через efetch XML                                    | NLM — свободно                               | канонический источник, но без full-text                                                       |
| **OpenAlex**                   | ~250 млн works                                                       | не нужен (polite pool: email в query) | ~10 req/s, 100k/день     | ~60% работ                                                   | **CC0** — можно всё, включая bulk-скачивание | лучшее покрытие (98.6% в тесте J Clin Epidemiol 2025 против PubMed 93%), снапшоты целиком     |
| **Semantic Scholar Graph API** | 200M+                                                                | опционально (free key: 1 RPS)         | 100 req/5 мин без ключа  | 95%                                                          | ODC-BY, некоммерческие нюансы                | citation intent (background/method/result), influential citations, рекомендации похожих работ |

Источники: [Europe PMC REST](https://europepmc.org/RestfulWebService), [pyEuropePMC (обёртка с PRISMA-логами)](https://jonasheinickebio.github.io/pyEuropePMC/), [OpenAlex docs](https://docs.openalex.org/), [Semantic Scholar API](https://www.semanticscholar.org/product/api), [сравнение покрытия БД, J Clin Epidemiol 2025](<https://www.jclinepi.com/article/S0895-4356(25)00122-2/fulltext>), [API comparison matrix](https://scilex.readthedocs.io/en/latest/reference/api-comparison.html).

### 2.2 Дерево решений: «откуда тянуть науку»

- **Цель: автоматический «дайджест свежих мета-анализов по 10 темам» раз в неделю** → План A: Europe PMC `search?query=("meta-analysis"[Title]) AND (resistance training volume...) AND PUB_YEAR:[2024 TO 2026]&resultType=core` + `sort=CITED desc`; абстракт приходит сразу. S.
- **Цель: граф «работа → цитаты → противоречия» для раздела Теории** → План B: OpenAlex для каркаса (CC0, без лимитных страхов) + Semantic Scholar для citation-intent по спорным узлам. M.
- **Цель: bulk-датасет для локального поиска в оффлайне** → План C: OpenAlex снапшоты (лицензия позволяет) + полнотекст OA из Europe PMC FTP. L, отложить.
- **Цель: препринты раньше журналов** → **SportRxiv** — открытый subject-репозиторий (OJS/OPS) по спорту, упражнениям и здоровью; можно следить через RSS/OAI-PMH. ([sportrxiv.org](https://sportrxiv.org/index.php/server/index))

**Легальность:** абстракты PubMed/Europe PMC — свободное распространение NLM/EBI; OpenAlex — CC0; Semantic Scholar — ODC-BY (аттрибуция + указание источника). Проблемных зон для нашего использования нет; «не копируем полные тексты коммерческих журналов».

### 2.3 Курируемые не-API источники (для контента «Теории»)

| Источник                              | Что даёт                                                                                                                                                                                                                                       | Как встроить                                                                                | Статус                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Stronger by Science — Master List** | поддерживаемый список систематических обзоров и мета-анализов по силе/гипертрофии/питанию с одной строкой «take-home»                                                                                                                          | ручная курируемая база: 1 раз в квартал сверяем список, обновляем карточки Теории с ссылкой | ★ бесплатный, авторитетный (Greg Nuckols)            |
| **MASS Research Review**              | ежемесячный peer-reviewed разбор исследований, архив 1000+ статей                                                                                                                                                                              | платная подписка; выписки вручную со ссылкой на первоисточник (не репостим их текст)        | платно; использовать как сканер тем, не как источник |
| **Examine.com**                       | грейдированные сводки по добавкам/нутриции (уровень доказательности)                                                                                                                                                                           | карточки добавок в «Теории» с ссылками на первоисточники Examine                            | freemium                                             |
| **Sports Medicine (журнал)**          | журнал, где публикуются большинство мета-анализов по тренировке (provenance: Momma 2022, Robinson 2024 — всё это Sports Medicine/Sports Med-Open)                                                                                              | отслеживать через Europe PMC фильтр `SRC:"Sports Medicine"`                                 | через API                                            |
| **ACSM Position Stands**              | актуальный Position Stand по resistance training (2023-2025 umbrella review, 137 обзоров, 30k+ участников): сила ≥80% 1RM, полная амплитуда, 2–3 сета, ≥2 раза/нед; гипертрофия ≥10 сетов/нед; до отказа/periodization — «не влияют стабильно» | источник эталонных формулировок для «Теории» и дефолтов калькулятора                        | открытый доступ                                      |
| **NSCA Position Statements**          | официальные позиции NSCA (JSCR), бесплатно                                                                                                                                                                                                     | как ACSM, но фокус силовые                                                                  | открытый доступ                                      |

Источники: [SBS Master List](https://www.strongerbyscience.com/master-list/), [MASS](https://massresearchreview.com/), [Examine](https://examine.com/), [ACSM Position Stand RT (overview of reviews)](https://www.ovid.com/jnls/acsm-msse/fulltext/10.1249/mss.0000000000003897~american-college-of-sports-medicine-position-stand), [ACSM: список позиционных документов](https://acsm.org/education-resources/pronouncements-scientific-communications/position-stands/), [NSCA position statements](https://www.nsca.com/about-us/position-statements/), [ACSM 2009 Progression Models](https://doi.org/10.1249/mss.0b013e3181915670).

---

## 3. Прочие открытые датасеты (для нормативов и «здоровья»)

- **OpenPowerlifting CSV** (см. 1.1) — перцентли по Squat/Bench/Dead/Dots для пола/возраста/весовой категории; данные CC0. Приложение может показать «ваш Squat — 62-й перцентиль в категории 83 кг 30–39» — уникальная фича без единого скрейпа.
- **Национальные опросники физической активности** (NHANES и аналоги) — для «здоровых» норм; пока не нашли удобный зеркалируемый дамп — оставить как TODO следующего раунда.
- **Собственная курируемая база норм грипа/висов** — см. metrics-ideas.md §2; публичных канонических датасетов грипа с возрастными нормами в открытом доступе немного — собирать из первоисточников (PURE reference values, статьи о grip norms) вручную.

---

## 4. Сводное «что встроить первым»

1. **S:** `free-exercise-db` как базовый справочник (public domain) + OpenWeight-импорт (Hevy/Strong CSV) — онбординг с историей.
2. **S:** wger API как второй слой справочника (CC-BY-SA, отдельный слой, атрибуция).
3. **S:** Europe PMC-скрипт дайджеста мета-анализов (cron на сервере, 10 запросов в неделю).
4. **M:** OpenPowerlifting-перцентли в «нормативах» приложения.
5. **M:** Semantic Scholar citation-intent для спорных пунктов Теории.
6. **L (отложено):** bulk OpenAlex-снапшот + локальный поиск.

---

## Источники

- https://github.com/yuhonas/free-exercise-db (LICENSE.md — The Unlicense)
- https://github.com/wger-project/wger · https://wger.readthedocs.io/en/latest/api/api.html · https://wger.de/api/v2/
- https://github.com/ExerciseDB/exercisedb-api · https://ascendapi.com
- https://gitlab.com/openpowerlifting/opl-data · https://openpowerlifting.gitlab.io/opl-csv/
- https://api.hevyapp.com/docs/ · https://apis.io/rate-limits/hevy/hevy-rate-limits/ · https://github.com/marinsalinas/hevy-cli
- https://github.com/radupana/openweight
- https://support.mydatahelps.org/apple-healthkitv2-workouts-export-format · https://github.com/cvyl/apple-health-parser · https://capacitorjs.com/docs/apis/health-fitness · https://github.com/ubie-oss/capacitor-health-connect
- https://europepmc.org/RestfulWebService · https://jonasheinickebio.github.io/pyEuropePMC/
- https://docs.openalex.org/ · https://www.semanticscholar.org/product/api · https://scilex.readthedocs.io/en/latest/reference/api-comparison.html
- https://www.jclinepi.com/article/S0895-4356(25)00122-2/fulltext
- https://sportrxiv.org/index.php/server/index
- https://www.strongerbyscience.com/master-list/ · https://massresearchreview.com/ · https://examine.com/
- https://www.ovid.com/jnls/acsm-msse/fulltext/10.1249/mss.0000000000003897~american-college-of-sports-medicine-position-stand · https://acsm.org/education-resources/pronouncements-scientific-communications/position-stands/ · https://doi.org/10.1249/mss.0b013e3181915670
- https://www.nsca.com/about-us/position-statements/
