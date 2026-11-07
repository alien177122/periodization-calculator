# Verified Databases — база знаний с проверкой для «Журнала Сплит»

> Исследование от 2026-11-07. Цель: найти проверенные источники данных о том, что реально
> влияет на здоровье (активность, сила, кардио, сон, питание) и паттерны «самопроверяемой базы».
> Критерии оценки: источник данных, метод верификации, лицензия, свежесть, машиночитаемость.
> Оценка встраивания: **S** = часы–дни, **M** = недели, **L** = месяцы/инфраструктура.

---

## 1. Готовые датасеты effect sizes (спортивная наука, GitHub/OSF/Zenodo)

Это единственный класс источников, дающий **числа** (effect sizes, dose-response), а не тексты.
Идеальны как «ядро истины» для калькулятора нагрузок.

### 1.1 softloud/living-meta-analysis-of-resistance-training

- **Содержит:** «All studies.csv» — данные исследований силового тренинга + R-пайплайн (`targets`) living meta-analysis.
- **Верификация:** открыто публикуемый пайплайн извлечения (Data Extraction Guide), воспроизводимый код.
- **Лицензия:** MIT.
- **Машиночитаемость:** CSV — отличная.
- **Свежесть:** обновляется как living-проект, но коммитов мало (риск стагнации).
- **Встраивание:** S — взять CSV как seed-таблицу тезисов с числами.
- **Ссылка:** https://github.com/softloud/living-meta-analysis-of-resistance-training

### 1.2 Pelland — Resistance Training Dose-Response (OSF 6z3xu)

- **Содержит:** мета-регрессии недельного объёма/частоты → гипертрофия и сила. Это прямой источник для правил «объём за сессию/неделю» в калькуляторе.
- **Верификация:** peer-reviewed препринт-материалы, PICOS-критерии прилагаются.
- **Лицензия:** не указана на OSF (проверить перед включением в репозиторий).
- **Машиночитаемость:** `.RData` (data.hyp.RData, data.str.RData) — читается R/pandas (`pyreadr`), не CSV «из коробки».
- **Свежесть:** обновлено окт 2024 / авг 2025.
- **Встраивание:** S–M — конвертировать .RData → JSON-таблицы эффектов.
- **Ссылка:** https://osf.io/6z3xu/overview

### 1.3 dgalgom/Physical-activity-and-Type-2-Diabetes-

- **Содержит:** по-армовые данные (N, средние, SD, change, SE, METs-min/нед) мета-анализа Diabetes Care 2024 «Optimal Dose and Type of PA for Glycemic Control».
- **Верификация:** публикация в Diabetes Care + воспроизводимый код.
- **Лицензия:** не указана явно.
- **Машиночитаемость:** CSV — отличная; готовые поля `weekly_dose`, `lower_is_better`.
- **Свежесть:** 2024.
- **Встраивание:** S — образец структуры «доза → эффект», удобной для нашей БЗ.
- **Ссылка:** https://github.com/dgalgom/Physical-activity-and-Type-2-Diabetes-

### 1.4 Refalo et al. — Sex Differences in Hypertrophy (Zenodo)

- **Содержит:** data.xlsx + Quarto-код мета-анализа (PeerJ 2025).
- **Лицензия:** **CC BY 4.0** — можно включать в репозиторий с атрибуцией.
- **Машиночитаемость:** xlsx — хорошая.
- **Встраивание:** S.
- **Ссылка:** https://zenodo.org/records/14611284

### 1.5 jamessteeleii/ROM_regional_hypertrophy

- **Содержит:** мета-анализ диапазона движений и региональной гипертрофии, R+`targets`.
- **Лицензия:** CC BY-NC-SA 4.0 (некоммерческое использование, share-alike).
- **Встраивание:** S (с оговоркой по лицензии).
- **Ссылка:** https://github.com/jamessteeleii/ROM_regional_hypertrophy

### 1.6 Прочие того же класса

| Источник                     | Что                                                | Лицензия    | Ссылка                                                                                                                    |
| ---------------------------- | -------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| PACMAn                       | острая нагрузка → когнитивные эффекты, Hedges g, R | не указана  | https://github.com/jggarrett23/PACMAn                                                                                     |
| Diong 2022                   | эксцентрический тренинг → гибкость, xlsx + Stata   | не указана  | https://github.com/joannadiong/Diong_et_al_2022_MSP                                                                       |
| Weinstein, GMU Dataverse     | острая нагрузка → настроение, xlsx + R             | **CC0 1.0** | https://dataverse.orc.gmu.edu/dataset.xhtml?persistentId=doi%3A10.13021%2FORC2020%2FKA1SLZ                                |
| mcleoj2 NMA RT prescriptions | network MA предписаний силового тренинга, R        | не указана  | https://github.com/mcleoj2/network-meta-analysis-of-resistance-training-prescriptions-for-muscle-strength-and-hypertrophy |

**Вывод:** нет единого «exercise-science-data» репозитория с нормальной лицензией —
база собирается из отдельных мета-анализов. Паттерн: у каждого мета-анализа есть
OSF/GitHub/Zenodo с извлечёнными данными; их надо находить per-topic (например,
«{тема} meta-analysis OSF data»). Это и есть трудоёмкая часть (M), сами файлы мелкие.

### 1.7 Курированные списки литературы (awesome-\*)

- **jeff3388/awesome-periodization-science** — периодизация: модели, доказательность, отбор по peer-review. Лицензия **CC BY 4.0**. https://github.com/jeff3388/awesome-periodization-science
- **jeff3388/awesome-triathlon-science** — выносливость, fueling, гидратация (CC BY 4.0). https://github.com/jeff3388/awesome-triathlon-science
- **jeff3388/awesome-injury-prevention-science** — профилактика травм, нагрузка (CC BY 4.0). https://github.com/jeff3388/awesome-injury-prevention-science
- Ценность для нас: **seed-список тезисов** с уже фильтрованной литературой; цитаты ведут на PMID → автоматическая сверка через PubMed. Встраивание: S.

---

## 2. Официальные guidelines и машиночитаемость

### 2.1 WHO — Guidelines on physical activity and sedentary behaviour (2020)

- **Содержит:** эталонные рекомендации (150–300 мин умеренной / 75–150 мин интенсивной + силовые 2×/нед и т.д.).
- **Верификация:** GRADE-профили в Web Annex (https://www.who.int/publications/i/item/9789240015111).
- **Машиночитаемость:** сам гайдлайн — **PDF, не машиночитаем**. Таблицы рекомендаций придётся оцифровать вручную один раз (S) и хранить как JSON с источником.
- **Статистика по физической активности:** WHO GHO OData API — `https://ghoapi.azureedge.net/api/...` (JSON, OData). Это распространённость, а не тезисы.
- **Лицензия:** CC BY-NC-SA 3.0 IGO (публикации); для GHO — атрибуция, сверить условия.
- **Встраивание:** S — ручная оцифровка ~15–30 рекомендаций.
- **Ссылки:** https://www.who.int/data/gho/info/gho-odata-api

### 2.2 USPSTF — Prevention TaskForce API

- **Содержит:** грейды A/B/C/D/I по скринингу/профилактике (включая counseling по активности).
- **Машиночитаемость:** **REST JSON**, фильтры по возрасту/полу/грейду; рекомендуют кешировать весь датасет локально; ETag/Last-Modified для обновлений (~раз в неделю).
- **Лицензия/условия:** бесплатный ключ по запросу (uspstfpda@ahrq.gov); текст воспроизводить **verbatim**, с указанием источника.
- **Встраивание:** M (получение ключа + ingestion) — единственная «guideline-база» с настоящим API.
- **Ссылки:** https://www.uspreventiveservicestaskforce.org/apps/api.jsp , инструкция: https://www.uspreventiveservicestaskforce.org/files/preventiontaskforce_data_api_wi.pdf

### 2.3 Cochrane Library / CENTRAL

- **Содержит:** золотой стандарт систематических обзоров; CENTRAL — реестр РКИ (2M+ записей).
- **Машиночитаемость:** abstracts/PLS бесплатны на сайте; **булк-выгрузки нет**, API подписной.
- **Лицензия:** CC BY / CC BY-NC-ND в зависимости от статьи; **явно требуется авторизация для любого AI-использования контента Cochrane** (условия data-download).
- **Встраивание:** L (юридически сложный путь). Практическая альтернатива — брать Cochrane abstracts точечно по ссылке и опираться на PMC OA-копии, если есть.
- **Ссылки:** https://www.cochranelibrary.com/about/data-download

### 2.4 PhysioNet (данные, не тезисы)

- **Содержит:** сигналы/носка-датасеты: **MMASH** (активность+сон, 24 ч, ODbL), **sleep-accel** (акселерометр vs PSG, ODbL), DREAMT (restricted).
- **Машиночитаемость:** отличная (CSV/EDF, прямые URL без авторизации для open access).
- **Ценность:** калибровка наших трекер-метрик (сон, HR), не для текстовых тезисов.
- **Встраивание:** M.
- **Ссылки:** https://physionet.org/content/mmash/1.0.0/ , https://physionet.org/content/sleep-accel/1.0.0/

### 2.5 Питание: USDA FoodData Central

- **Содержит:** состав продуктов (5 датасетов, сотни тысяч позиций).
- **Лицензия:** **CC0 / public domain**.
- **Машиночитаемость:** REST API JSON (бесплатный ключ, 1000 req/h/IP) + полный bulk CSV/JSON.
- **Встраивание:** S — если в БЗ появятся нутритивные тезисы о составе.
- **Ссылки:** https://fdc.nal.usda.gov/api-guide/ , https://fdc.nal.usda.gov/download-datasets/

### 2.6 Эпидемиология: IHME GBD Results Tool

- **Содержит:** attributable deaths/DALYs от «low physical activity» и др. рисков, 204 страны, 1990–2023.
- **Машиночитаемость:** CSV через GBD Results Tool (нужна учётка). OWID не может перепродавать эти CSV (лицензия IHME нераспространяемая) — качать только с healthdata.org.
- **Лицензия:** бесплатно для некоммерческого использования (IHME User Agreement).
- **Встраивание:** S–M — если нужен контекст «почему это важно» (мотивационные цифры в UI).
- **Ссылки:** https://www.healthdata.org/data-tools-practices/interactive-visuals/gbd-results

---

## 3. Коммерческие/полу-открытые издания (чему учиться, что не копировать)

### 3.1 Examine.com

- **Ценность:** эталон **структуры грейдирования**: intervention × condition × outcome × grade, эффективные дозы. Это UX/схема-референс для нашей БЗ.
- **Лицензия:** контент © Examine; **скрейпинг запрещён**; free-аккаунт — только личное использование; ExPro — коммерческое по договору; **Connect API** (interactions) — $0.05/check, выводы нельзя использовать для обучения моделей или создания конкурирующей базы, кеш ≤24 ч.
- **Встраивание:** только ручное перечитывание для вдохновения схемой; автоматизация запрещена ToS.
- **Ссылки:** https://examine.com/terms/ , https://examine.com/api-requests/ , https://connect.examine.com/terms

### 3.2 Stronger by Science / MASS

- **Studies Archive** (бесплатно): ежемесячный journal-sweep — Google Sheet со ссылками на отобранные исследования силового/нутритивного направления. Готовый «фильтр качества» ~десятки ссылок/мес. https://www.strongerbyscience.com/studies-archive/
- **MASS Research Review** — платный (~$30/мес), ~1000 статей в архиве, внутреннее peer-review 4 авторов. Прав пере-публикации нет.
- **Встраивание:** S — раз в месяц забирать Studies Archive как входной поток «кандидатов» для БЗ (ссылки → PMID → автосверка). Лиц. ограничения не мешают: мы не копируем тексты, только ведём на PubMed.

### 3.3 SportRxiv

- Препринты спорт-науки (STORK/Ottawa). Лицензия по умолчанию **CC BY 4.0** (автор выбирает). Скрейпинг/булк-скачивание запрещены; одиночное чтение/цитирование свободно. Препринты — кандидаты «низкого доверия» (без peer review), статус помечать в БЗ.
- **Ссылка:** https://sportrxiv.org/index.php/server/terms-of-service

### 3.4 IJERPH/MDPI — осторожно

- Формально OA, но качество вариативно; для БЗ тезисы из MDPI-журналов помечать пониженным весом источника. Проверка через PubMed/OpenAlex обязательна.

---

## 4. API-инфраструктура для авто-верификации тезисов

| API                                      | Объём                                                          | Машиночитаемость                                                                                   | Лицензия/лимиты                                                                                                    | Роль в пайплайне                                                  |
| ---------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| **PubMed E-utilities**                   | 38M+ записей MEDLINE                                           | XML/JSON (`retmode=json`), PMID-центрично                                                          | бесплатно; 3 req/s, с ключом 10 req/s                                                                              | первичный поиск абстрактов по тезису                              |
| **PMC BioC API / OAI-PMH / Cloud (AWS)** | OA-подсет PMC, CC0/CC BY и др.                                 | JSON/XML fulltext                                                                                  | автоматический доступ **только** через эти сервисы (FTP/старый OA API закрыты авг 2026)                            | полные тексты для глубоких проверок                               |
| **Europe PMC REST**                      | 33M публикаций, 6.5M OA fulltext, аннотации, цитирования       | JSON/XML, fullTextXML по PMCID                                                                     | бесплатно; булк — через одобренные протоколы (FTP OA ~3.2M)                                                        | **основной**: search + fulltext + citations + preprints одним API |
| **OpenAlex**                             | ~324M works, авторы/источники/цитаты                           | JSON; абстракты — `abstract_inverted_index` (восстанавливаются перестановкой, теряется пунктуация) | метаданные CC0; API бесплатно с ключом ($1/день бюджет: 10k list-запросов или 1k search-запросов/день)             | метаданные, цитатный граф, фильтры «SR + topic»                   |
| **Semantic Scholar (S2AG)**              | 214M работ, SPECTER2-эмбеддинги, snippets из полных текстов OA | JSON                                                                                               | бесплатно; с ключом гарантированные 1 req/s (без ключа — общая пул 1000 rps, нестабильно); bulk-датасеты бесплатно | цитатный поиск + snippet-search как «доказательный» слой          |
| **Epistemonikos**                        | агрегатор SR + «матрицы доказательств»                         | JSON, но                                                                                           | веб бесплатно; **API платный** ($49.50/мес = 1000 req/day); ре-дистрибуция данных запрещена без договора           | не встраиваем; референс по логике «один тезис → матрица SR»       |

Ссылки: https://europepmc.org/RestfulWebService , https://europepmc.org/AnnotationsApi ,
https://help.openalex.org/api/llm-quick-reference/ , https://api.openalex.org ,
https://www.semanticscholar.org/product/api , https://pmc.ncbi.nlm.nih.gov/tools/textmining/ ,
https://pmc.ncbi.nlm.nih.gov/tools/openftlist/ , https://api.epistemonikos.org/

Ключевые факты:

- PMC OA Web Service **закрыт с 08.2026**; легальные пути автоматической выгрузки PMC: Cloud Service (S3), OAI-PMH, E-Utilities, BioC. FTP-архивы удалены.
- OpenAlex абстракты: `abstract_inverted_index` → сортировка (word, pos) → join; пунтуация теряется — для LLM-верификации приемлемо.
- Europe PMC Annotations API — готовые text-mining аннотации (болезни, методы) по OA-статьям: можно «дёшево» фильтровать релевантность без LLM.

---

## 5. Open-source пайплайны верификации утверждений (claim verification)

Паттерн «тезис → поиск в PubMed → статус уверенности» уже реализован; можно взять каркас.

| Проект                                            | Что делает                                                                                                                                                                  | Лицензия        | Зрелость                                                                                     | Ссылка                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **CER** (PRAISELab-PicusLab)                      | BM25-ретрив из PubMed → LLM-обоснование → класс true/false/NEI                                                                                                              | open (уточнить) | научный прототип, есть датасеты HealthFC/BioASQ-7b/SciFact                                   | https://github.com/PRAISELab-PicusLab/CER-Fact-Checking |
| **med-fact-check**                                | LangGraph мультиагент: декомпозиция тезиса → BM25+MedCPT→cross-encoder реранк (Europe PMC fulltext, UniProt, PubMed SR) → NLI вердикты → агрегация с трассируемыми цитатами | open            | прототип; честный бенчмарк: ~80% BioASQ, ~60% SciFact, ~40% HealthFC                         | https://github.com/davidedm26/med-fact-check            |
| **scifact-verifier**                              | BM25 + SPECTER2(FAISS) + RRF + локальный LLM (Ollama) → вердикт с цитатами                                                                                                  | open            | прототип; хороший минимальный каркас                                                         | https://github.com/lachtarnour/scifact-verifier         |
| **PaperQA2 / ContraCrow** (FutureHouse)           | агentic RAG с in-text цитатами; режим **contradiction detection** по литературе                                                                                             | **Apache 2.0**  | production-grade код, но PDF-корпус надо подавать самим                                      | https://github.com/Future-House/paper-qa                |
| **OpenScholar** (AI2)                             | RAG над 45M OA-паперов, self-feedback loop; точность цитат уровня человека                                                                                                  | **Apache 2.0**  | тяжёлая инфраструктура (45M эмбеддингов) — как референс архитектуры, не для запуска локально | https://github.com/AkariAsai/OpenScholar                |
| **SciFact** (HF `allenai/scifact`) + **HealthFC** | эталонные датасеты с метками SUPPORT/REFUTE/NEI                                                                                                                             | open            | для **тестирования нашего пайплайна** на знакомом домене                                     | https://huggingface.co/datasets/allenai/scifact         |

**Практический вывод:** точность чисто-автоматической верификации на свободных текстах —
40–80% в зависимости от датасета. Отсюда архитектурное правило: авто-вердикт — это
**приоритизация ручной проверки**, а не замена её. Пороговые статусы:
`verified(auto) / verified(manual) / contradicted / insufficient / stale`.

---

## 6. Архитектура self-updating базы знаний

### Слои

1. **KB-файл** (наш репозиторий): `knowledge-base/*.json` — тезисы с полями:
   `{id, claim_ru, claim_en, topic, effect_summary, evidence_grade(A/B/C/D), refs:[pmid|doi], source_type(meta|RCT|guideline|preprint), status(verified_auto|verified_manual|contradicted|insufficient|stale), last_checked, version}`
2. **Сбор кандидатов**: PubMed `esearch` (SR-фильтр: `pubmed[filter] AND systematic[sb]`) по теме; ежемесячный sweep из SBS Studies Archive; awesome-списки.
3. **Извлечение тезисов**: LLM-экстракция из abstracts (PMC fullTextXML при OA) в нормализованный JSON; человек утверждает тезис перед включением.
4. **Авто-верификация**: Europe PMC search + OpenAlex citations → retriver (BM25/эмбеддинги) → NLI/LLM-вердикт support/refute/NEI (каркас по образцу CER/med-fact-check).
5. **Статусы доверия**: грейд источника (SR > RCT > preprint > blog) × вердикт × свежесть → итоговый tier в UI.
6. **Точечная ручная сверка**: очередь только для `contradicted/insufficient/важных` тезисов.
7. **Версионирование**: БЗ = файл с semver + date + changelog; все изменения через PR с прогоном тестов (в духе `npm run quality`).

### Поэтапный план

- **S (2–4 дня):** ручная БЗ 50–150 тезисов (JSON) + `verify.js`-скрипт: для каждого PMID тянем abstract из E-utilities/Europe PMC, LLM отвечает «тезис всё ещё поддерживается?» → обновляет `last_checked`/`status`. Плюс еженедельный cron (`npm run kb:check`).
- **M (2–4 недели):** конвейер кандидатов (PubMed SR-алерты + SBS Studies Archive), LLM-экстракция тезисов в draft-зоны, авто-вердикты на OpenAlex/EuropePMC, отчёт «что изменилось за месяц», юнит-тесты на схему БЗ.
- **L (2–3 месяца):** локальный RAG-индекс PMC OA (BioC/S3-выгрузка), SPECTER2/RRF ретрив, PaperQA2-style contradiction detection, дашборд доверия, CI-гейт «тезис без верификации не попадает в сборку».

### Юридические красные линии

- Не скрейпить Examine/Cochrane/MASS/SportRxiv булком.
- PMC/Europe PMC булк — только одобренные протоколы; уважать CC BY-NC (некоммерческое) для отдельных статей.
- USPSTF текст — verbatim + атрибуция.
- Открытая зона: OpenAlex (CC0), Europe PMC REST (поштучно), E-utilities, USDA FDC (CC0), Zenodo-датасеты (CC BY), awesome-списки (CC BY 4.0).

---

## 7. Топ-5 по ценности (сводка)

1. **Europe PMC REST + OA-фултексты** — единственный источник, дающий поиск+полный текст+цитаты+аннотации одним бесплатным API; ядро авто-верификации.
2. **OpenAlex** — CC0-метаданные, цитатный граф, дешёвые фильтры по SR; абстракты через inverted index.
3. **Датасеты эффектов** (Pelland OSF 6z3xu + softloud living MA + Refalo Zenodo CC BY + dgalgon T2D) — реальные числа для правил калькулятора, машиночитаемы (CSV/.RData).
4. **E-utilities + PMC BioC/OAI-PMH** — «золотой стандарт» проверки PMID-тезисов (после закрытия OA FTP — только эти каналы).
5. **CER / med-fact-check / scifact-verifier** — готовые open-каркасы claim-verification; брать схему (retrieve → justify → classify) и подставлять спорт-домен.

Бонус: **USPSTF API** (машиночитаемые гайдлайны), **USDA FDC** (CC0 питание), **SBS Studies Archive** (бесплатный ежемесячный human-curated поток кандидатов), **jeff3388 awesome-\*** (CC BY 4.0 seed-списки).
