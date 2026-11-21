# Europe PMC digest — мета-анализы и ключевые исследования по темам «Журнал Сплит»

Источник: Europe PMC REST API (без ключей), 2015–2026. Фильтры: мета-анализы / систематические обзоры / обзоры либо высокоцитируемые работы (сортировка по цитированиям, ключевое слово в заголовке). 39 запросов, паузы 1.6 с.

- Машиночитаемые данные: `meta-analysis-digest.jsonl` (запись = один запрос: `topic`, `query`, `mode`, `url`, `hitCount`, `results[]`).
- Сырые ответы API: `raw/*.json`.
- Точные цифры из abstract с цитатами: `key-numbers.md`.
- Скрипты: `scripts/fetch_europepmc.py`, `scripts/supplement.py`, `scripts/supplement2.py`, `scripts/build_digest_md.py`.

Формат выжимок: «Что нашли» — только то, что реально написано в abstract (без домыслов). Если abstract отсутствует, это указано явно.

---

## 1. Объём силовой тренировки / dose-response (`resistance-training-volume`)

| #   | Работа                                                                                                | Год  | Журнал                  | Цит. | Ссылка                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------- | ---- | ----------------------- | ---- | -------------------------------------------------------------------------------------- |
| 1   | Dose-Response Relationships of Resistance Training in Healthy Old Adults                              | 2015 | Sports Medicine         | 455  | [DOI:10.1007/s40279-015-0385-9](https://doi.org/10.1007/s40279-015-0385-9)             |
| 2   | Dose-response relationship between weekly resistance training volume and increases in muscle mass     | 2017 | J Sports Sciences       | 410  | [DOI:10.1080/02640414.2016.1210197](https://doi.org/10.1080/02640414.2016.1210197)     |
| 3   | Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength in Trained Men                | 2019 | Med Sci Sports Exerc    | 181  | [DOI:10.1249/mss.0000000000001764](https://doi.org/10.1249/mss.0000000000001764)       |
| 4   | Neither load nor systemic hormones determine hypertrophy or strength gains in resistance-trained men  | 2016 | J Appl Physiol          | 280  | [DOI:10.1152/japplphysiol.00154.2016](https://doi.org/10.1152/japplphysiol.00154.2016) |
| 5   | Skeletal Muscle Remodeling in Response to Eccentric vs. Concentric Loading: Meta-Analysis             | 2017 | Front Physiol           | 273  | [DOI:10.3389/fphys.2017.00447](https://doi.org/10.3389/fphys.2017.00447)               |
| 6   | Total Number of Sets as a Training Volume Quantification Method: Systematic Review                    | 2021 | J Strength Cond Res     | 45   | [DOI:10.1519/jsc.0000000000002776](https://doi.org/10.1519/jsc.0000000000002776)       |
| 7   | Muscle hypertrophy and strength gains after RT with different volume-matched loads: systematic review | 2022 | Appl Physiol Nutr Metab | 62   | [DOI:10.1139/apnm-2021-0515](https://doi.org/10.1139/apnm-2021-0515)                   |
| 8   | Manipulating the Resistance Training Volume in Middle-Aged and Older Adults: SR+MA                    | 2023 | Sports Medicine         | 35   | [DOI:10.1007/s40279-022-01769-x](https://doi.org/10.1007/s40279-022-01769-x)           |
| 9   | Effects of Periodization on Strength and Hypertrophy in Volume-Equated Programs: SR+MA                | 2022 | Sports Medicine         | 30   | [DOI:10.1007/s40279-021-01636-1](https://doi.org/10.1007/s40279-021-01636-1)           |

1. **Dose-response в пожилых (SR+MA, 25 RCT)** — RT существенно улучшает силу (SMD 1.57), слабее морфологию (SMD 0.42); мета-регрессия дала dose-response зависимости для объёма, интенсивности, отдыха.
2. **Ralston 2017 (мета-регрессия, 34 группы из 15 исследований)** — значимый эффект объёма на мышечную массу (P=0.002): каждый дополнительный сет в неделю = ES +0.023 (+0.37% прироста); higher vs lower volume ES-разница 0.241 (3.9%); градуированная dose-response связь объёма и гипертрофии.
3. **Schoenfeld 2019 (RCT, 34 тренированных мужчины, 8 нед, 1/3/5 сетов)** — сила и выносливость выросли одинаково во всех группах; гипертрофия имела dose-response связь с объёмом (значимые преимущества высокообъёмных условий в нескольких локусах).
4. **Morton 2016 (RCT, 49 тренированных)** — высокие (75-90% 1RM) и низкие (30-50% 1RM, 20-25 повторов) нагрузки при сопоставимом объёме дали сходную гипертрофию и силу; постсессионные системные гормоны не связаны с адаптацией.
5. **Эксцентрика vs концентрика (мета-анализ)** — данные о преимуществе эксцентрической RT в гипертрофии противоречивы, вопрос остаётся открытым (по abstract).
6. **Baz-Valle 2021 (SR, 14 RCT у тренированных)** — «суммарное число сетов до отказа или почти до отказа» — адекватный метод квантификации объёма при диапазоне 6–20+ повторов при прочих равных.
7. **Lopez 2022 (SR+MA, volume-load-эквивалентные протоколы)** — при равном volume load наибольший прирост 1RM дают высокие нагрузки (HL>LL, HL>ML); гипертрофия не различается между величинами нагрузки.
8. **Borriello 2023 (SR+MA, 15 исследований, 430 участников ≥50 лет)** — несколько сетов на упражнение лучше одного для силы ног (SMD 0.29) и качества мышц (SMD 0.40); для силы рук, размера мышц и функциональности различий нет.
9. **Periodization при уравненном объёме (MA, 35 исследований)** — см. тему «Периодизация»: периодизация влияет на 1RM, но не на гипертрофию.

---

## 2. Proximity to failure / RIR (`proximity-to-failure-rir`)

| #   | Работа                                                                                                             | Год  | Журнал              | Цит. | Ссылка                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------ | ---- | ------------------- | ---- | ---------------------------------------------------------------------------------- |
| 1   | Effects of Resistance Training to Muscle Failure on Acute Fatigue: SR+MA                                           | 2022 | Sports Medicine     | 45   | [DOI:10.1007/s40279-021-01602-x](https://doi.org/10.1007/s40279-021-01602-x)       |
| 2   | Proximity to Failure and Total Repetitions… Accuracy of RIR-based RPE                                              | 2021 | J Strength Cond Res | 40   | [DOI:10.1519/jsc.0000000000002995](https://doi.org/10.1519/jsc.0000000000002995)   |
| 3   | Exploring the Dose-Response Relationship Between Estimated RT Proximity to Failure, Strength Gain, and Hypertrophy | 2024 | Sports Medicine     | 46   | [DOI:10.1007/s40279-024-02069-2](https://doi.org/10.1007/s40279-024-02069-2)       |
| 4   | Influence of RT Proximity-to-Failure on Skeletal Muscle Hypertrophy: SR+MA                                         | 2023 | Sports Medicine     | 32   | [DOI:10.1007/s40279-022-01784-y](https://doi.org/10.1007/s40279-022-01784-y)       |
| 5   | Proximity-to-Failure Determined by RIR on Neuromuscular Fatigue                                                    | 2023 | Sports Med Open     | 31   | [DOI:10.1186/s40798-023-00554-y](https://doi.org/10.1186/s40798-023-00554-y)       |
| 6   | Towards an improved understanding of proximity-to-failure (scoping review)                                         | 2022 | J Sports Sciences   | 31   | [DOI:10.1080/02640414.2022.2080165](https://doi.org/10.1080/02640414.2022.2080165) |
| 7   | The Effect of Load and Volume Autoregulation: SR+MA                                                                | 2022 | Sports Med Open     | 27   | [DOI:10.1186/s40798-021-00404-9](https://doi.org/10.1186/s40798-021-00404-9)       |
| 8   | Methods for Controlling and Reporting RT Proximity to Failure                                                      | 2022 | Sports Medicine     | 26   | [DOI:10.1007/s40279-022-01667-2](https://doi.org/10.1007/s40279-022-01667-2)       |

1. **Острое утомление после отказа (SR+MA)** — тренировка до отказа (RTF) даёт большее острое утомление, чем не до отказа; увеличенное время восстановления следует учитывать.
2. **Zourdos 2021 (точность RIR-based RPE)** — ошибка прогноза RIR падает по мере приближения к отказу (на 9RPE ошибка 2.05±1.73 повтора, на 7RPE — 3.65±2.46, на 5RPE — 5.15±2.92); больше повторов в сете = менее точная оценка.
3. **Robinson 2024 (дозозависимость RIR, мультиуровневые мета-регрессии)** — сила растёт одинаково в широком диапазоне RIR, тогда как гипертрофия улучшается при завершении сета ближе к отказу; точная форма связи остаётся неясной (exploratory analysis).
4. **Robinson 2023 (SR+MA, 15 исследований)** — сеты «до set-failure» дают тривиальное преимущество в гипертрофии (ES=0.19; 95% CI 0.00–0.37); до «моментального отказа» vs не до отказа — ES=0.12 (NS); пороги velocity loss >25% vs 20–25% — ES=0.08 (NS); возможная нелинейная связь.
5. **Refalo 2023 (RCT, 24 человека, 6 сетов жима 75% 1RM до FAIL / 1-RIR / 3-RIR)** — падение скорости через 4 мин: −25% (FAIL), −13% (1-RIR), −8% (3-RIR); линейная связь близости к отказу с острым утомлением и негативными перцептивными ответами.
6. **Scoping review 2022** — в литературе нет консенсусного определения «отказа», «не-отказные» условия часто неоднозначны; на имеющихся данных RT до set-failure, вероятно, не превосходит не-до-отказа.
7. **Autoregulation meta 2022** — см. тему «Автогрегуляция»: пороги velocity loss >25% лучше для гипертрофии (MD 0.64 см²), ≤25% — лучше для силы.
8. **Методы контроля близости к отказу (обзор)** — нет консистентного метода квантификации: %-based, RM-зоны, velocity loss и самоотчётный RIR имеют свои плюсы/минусы.

---

## 3. Частота тренировок (`training-frequency`)

| #   | Работа                                                                                           | Год  | Журнал              | Цит. | Ссылка                                                                             |
| --- | ------------------------------------------------------------------------------------------------ | ---- | ------------------- | ---- | ---------------------------------------------------------------------------------- |
| 1   | Effect of Resistance Training Frequency on Gains in Muscular Strength: SR+MA                     | 2018 | Sports Medicine     | 208  | [DOI:10.1007/s40279-018-0872-x](https://doi.org/10.1007/s40279-018-0872-x)         |
| 2   | Effects of RT Frequency on Measures of Muscle Hypertrophy: SR+MA                                 | 2016 | Sports Medicine     | 189  | [DOI:10.1007/s40279-016-0543-8](https://doi.org/10.1007/s40279-016-0543-8)         |
| 3   | How many times per week should a muscle be trained to maximize hypertrophy? SR+MA                | 2019 | J Sports Sciences   | 95   | [DOI:10.1080/02640414.2018.1555906](https://doi.org/10.1080/02640414.2018.1555906) |
| 4   | Influence of RT Frequency on Muscular Adaptations in Well-Trained Men (SPLIT vs TOTAL)           | 2015 | J Strength Cond Res | 67   | [DOI:10.1519/jsc.0000000000000970](https://doi.org/10.1519/jsc.0000000000000970)   |
| 5   | Weekly Training Frequency Effects on Strength Gain: Meta-Analysis                                | 2018 | Sports Med Open     | 62   | [DOI:10.1186/s40798-018-0149-9](https://doi.org/10.1186/s40798-018-0149-9)         |
| 6   | Strength Training Improves Metabolic Health Markers in Older Individuals Regardless of Frequency | 2019 | Front Physiol       | 49   | [DOI:10.3389/fphys.2019.00032](https://doi.org/10.3389/fphys.2019.00032)           |
| 7   | Effect of RT Frequency on Neuromuscular Performance and Muscle Morphology After 8 Weeks          | 2019 | J Strength Cond Res | 39   | [DOI:10.1519/jsc.0000000000002563](https://doi.org/10.1519/jsc.0000000000002563)   |
| 8   | RT frequency and skeletal muscle hypertrophy: review of available evidence                       | 2019 | J Sci Med Sport     | 27   | [DOI:10.1016/j.jsams.2018.09.223](https://doi.org/10.1016/j.jsams.2018.09.223)     |
| 9   | Effects of Variations in RT Frequency on Strength Development in Well-Trained Populations        | 2022 | Sports Medicine     | 26   | [DOI:10.1007/s40279-021-01460-7](https://doi.org/10.1007/s40279-021-01460-7)       |

1. **Grgic 2018 (MA силы)** — более высокие частоты дают больший прирост силы, но эффект в первую очередь опосредован объёмом: при уравненном объёме значимого эффекта частоты нет; больший эффект у женщин и в многосуставных упражнениях верха тела; большинство исследований — на нетренированных.
2. **Schoenfeld 2016 (MA гипертрофии, 10 исследований)** — при уравненном объёме частота 2 раза/нед превосходит 1 раз/нед (ES 0.49±0.08 vs 0.30±0.07); «крупные мышечные группы не реже 2 раз в неделю»; 3 vs 2 — неизвестно.
3. **Schoenfeld 2019 (MA, 25 исследований)** — при уравненном объёме частота не влияет на гипертрофию; в не-уравненных исследованиях мета-регрессия показала небольшое преимущество более высоких частот (1 vs 3+ дней — скромная разница); выбор частоты — вопрос предпочтений.
4. **Schoenfeld 2015 (RCT, 20 тренированных)** — TOTAL (3×/нед на группу) дал больший прирост толщины сгибателей предплечья, чем SPLIT (1×/нед); силы — без различий.
5. **Hammarström 2018 (MA, 12 исследований)** — при уравненном объёме значимого эффекта частоты на силу нет; сильная корреляция частоты с приростом силы (g=0.48) обусловлена объёмом.
6. **Metabolic health 2019 (RCT, 92 пожилых, 6 мес)** — сила улучшает метаболические маркеры независимо от частоты (1/2/3 раза в неделю).
7. **Brigatto 2019 (RCT, объём уравнен)** — 1 vs 2 сессии/нед на группу: различий нет (небольшой тренд в пользу 2).
8. **Thomas 2019 (review)** — при уравненном объёме частота не даёт выраженного эффекта на массу мышц.
9. **Grgic 2022 (SR, тренированные)** — за 6–12 недель нет чётких различий в развитии силы между частотами; допускает «микродозирование» объёма в течение недели.

---

## 4. Периодизация / блочная периодизация (`periodization`)

| #   | Работа                                                                                             | Год  | Журнал                       | Цит. | Ссылка                                                                           |
| --- | -------------------------------------------------------------------------------------------------- | ---- | ---------------------------- | ---- | -------------------------------------------------------------------------------- |
| 1   | The Importance of Muscular Strength: Training Considerations                                       | 2018 | Sports Medicine              | 514  | [DOI:10.1007/s40279-018-0862-z](https://doi.org/10.1007/s40279-018-0862-z)       |
| 2   | Comparison of Periodized and Non-Periodized Resistance Training on Maximal Strength: Meta-Analysis | 2017 | Sports Medicine              | 94   | [DOI:10.1007/s40279-017-0734-y](https://doi.org/10.1007/s40279-017-0734-y)       |
| 3   | Systematic review and meta-analysis of linear and undulating periodized RT programs                | 2015 | J Strength Cond Res          | 81   | [DOI:10.1519/jsc.0000000000000712](https://doi.org/10.1519/jsc.0000000000000712) |
| 4   | Training Periodization… in Highly Trained and Elite Distance Runners                               | 2022 | Int J Sports Physiol Perform | 81   | [DOI:10.1123/ijspp.2021-0435](https://doi.org/10.1123/ijspp.2021-0435)           |
| 5   | Benefits and Limitations of Block Periodized Training Approaches: Review                           | 2016 | Sports Medicine              | 66   | [DOI:10.1007/s40279-015-0425-5](https://doi.org/10.1007/s40279-015-0425-5)       |
| 6   | Periodization and Block Periodization in Sports: A Provocative and Challenging Narrative           | 2021 | J Strength Cond Res          | 63   | [DOI:10.1519/jsc.0000000000004050](https://doi.org/10.1519/jsc.0000000000004050) |
| 7   | Short-term Periodization Models: Effects on Strength and Speed-strength                            | 2015 | Sports Medicine              | 50   | [DOI:10.1007/s40279-015-0355-2](https://doi.org/10.1007/s40279-015-0355-2)       |
| 8   | Periodization Strategies in Older Adults: Impact on Physical Function and Health                   | 2016 | Med Sci Sports Exerc         | 35   | [DOI:10.1249/mss.0000000000001053](https://doi.org/10.1249/mss.0000000000001053) |
| 9   | Effects of Periodization on Strength and Muscle Hypertrophy in Volume-Equated Programs: SR+MA      | 2022 | Sports Medicine              | 30   | [DOI:10.1007/s40279-021-01636-1](https://doi.org/10.1007/s40279-021-01636-1)     |
| 10  | The use of periodization in exercise prescriptions for inactive adults: SR                         | 2015 | Prev Med Rep                 | 41   | [DOI:10.1016/j.pmedr.2015.04.023](https://doi.org/10.1016/j.pmedr.2015.04.023)   |

1. **Suchomel 2018 (обзор)** — single- и multi-targeted block-модели периодизации могут давать наибольшие приросты силы-мощности, но выбор модели ограничен видом спорта и атлетами.
2. **Grgic 2017 (MA, 18 исследований, 81 эффект)** — периодизированная RT превосходит непериодизированную по 1RM: ES=0.43 (95% CI 0.27–0.58) — умеренный эффект.
3. **Harries 2015 (SR+MA, 17 исследований, 510 участников)** — линейная vs волнообразная (undulating) периодизация: различий в эффективности для силы верха и низа тела нет.
4. **Distance runners 2022 (SR)** — элитные бегуны используют преимущественно пирамидальное распределение интенсивности; марафонцы — более пирамидально, бегуны на 1500 м — более поляризованно.
5. **Issurin 2016 (обзор)** — block-периодизация (высокая концентрация специализированных нагрузок «блоками») предложена как альтернатива традиционной модели; два варианта: концентрированная однонаправленная и мультицелевая.
6. **Stone 2021 (narrative)** — периодизированный процесс с соответствующим программированием даёт превосходство над непериодизированным; традиционная и блочная модели имеют сильные и слабые стороны.
7. **Zafeiridis 2015 (обзор)** — у субъектов низкого уровня: ежедневная волнообразная периодизация даёт равные или статистически значимо большие приросты силы, чем классическая strength-power periodization.
8. **Fragala 2016 (обзор, пожилые)** — периодизация применима для пожилых, обзор стратегий и влияния на физическую функцию.
9. **Volume-equated MA 2022 (35 исследований)** — при уравненном объёме периодизированная RT лучше непериодизированной для 1RM, UP лучше LP — но только у тренированных; гипертрофия не различается (LP vs UP: ES 0.05).
10. **Prev Med Rep 2015 (SR, нетренированные взрослые)** — периодизированные упражнения улучшают факторы риска ССЗ и качество жизни; преждевременно утверждать превосходство над непериодизированными.

---

## 5. Сила хвата и смертность (`grip-strength-mortality`)

| #   | Работа                                                                                                                   | Год  | Журнал                       | Цит. | Ссылка                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ---- | ---------------------------- | ---- | ------------------------------------------------------------------------------------ |
| 1   | Prognostic value of grip strength: PURE study                                                                            | 2015 | The Lancet                   | 1370 | [DOI:10.1016/s0140-6736(14)62000-6](<https://doi.org/10.1016/s0140-6736(14)62000-6>) |
| 2   | Grip Strength: An Indispensable Biomarker For Older Adults                                                               | 2019 | Clin Interv Aging            | 724  | [DOI:10.2147/cia.s194543](https://doi.org/10.2147/cia.s194543)                       |
| 3   | Associations of grip strength with cardiovascular, respiratory, and cancer outcomes and all cause mortality (UK Biobank) | 2018 | BMJ                          | 589  | [DOI:10.1136/bmj.k1651](https://doi.org/10.1136/bmj.k1651)                           |
| 4   | Association of Grip Strength With Risk of All-Cause Mortality, CVD, and Cancer: MA                                       | 2017 | J Am Med Dir Assoc           | 195  | [DOI:10.1016/j.jamda.2017.03.011](https://doi.org/10.1016/j.jamda.2017.03.011)       |
| 5   | Predictors of poor functional outcomes and mortality in hip fracture: SR                                                 | 2019 | BMC Musculoskelet Disord     | 229  | [DOI:10.1186/s12891-019-2950-0](https://doi.org/10.1186/s12891-019-2950-0)           |
| 6   | Objective measures of frailty (handgrip strength, gait speed) and cardiovascular mortality: SR                           | 2016 | Int J Cardiol                | 121  | [DOI:10.1016/j.ijcard.2016.04.068](https://doi.org/10.1016/j.ijcard.2016.04.068)     |
| 7   | Recent sarcopenia definitions — prevalence and mortality associations                                                    | 2023 | J Cachexia Sarcopenia Muscle | 77   | [DOI:10.1002/jcsm.13160](https://doi.org/10.1002/jcsm.13160)                         |
| 8   | Handgrip strength measurement protocols for mortality outcomes (>3 млн)                                                  | 2022 | Clin Nutr                    | 41   | [DOI:10.1016/j.clnu.2022.09.006](https://doi.org/10.1016/j.clnu.2022.09.006)         |

1. **PURE (17 стран, 139 691, медиана 4.0 лет)** — сила хвата обратно связана с общей смертностью: HR на каждые 5 кг снижения = 1.16 (95% CI 1.13–1.20); ассоциации сходны в странах с разным доходом; простой и дешёвый метод стратификации риска.
2. **Biomarker review 2019** — сила хвата согласованно объясняет общую силу, функцию верхней конечности, BMD, падения, мальнутрицию, когницию, депрессию, диабет и мультиморбидность; предиктивная связь с общей и специфической смертностью; рекомендована как рутинное измерение.
3. **UK Biobank (502 293, 7.1 года, 13 322 смерти)** — более сильный хват связан с исходами по ССЗ, респираторным заболеваниям и раку и улучшает предсказание офисного risk score (конкретные HR в abstract не приведены).
4. **JAMDA 2017 (MA проспективных когорт)** — на каждые 5 кг снижения хвата: общая смертность HR 1.16 (1.12–1.20), ССЗ 1.21 (1.14–1.29), инсульт 1.09, ИБС 1.07, рак 1.01 (NS); связи линейны в диапазоне до 56 кг и не зависят от пола.
5. **Hip fracture SR 2019** — hand grip strength и frailty — важные предикторы плохих функциональных исходов и смертности после перелома шейки бедра.
6. **IJ Cardiol 2016 (SR, CVD-смертность)** — сниженные HGS и gait speed связаны с сердечно-сосудистой смертностью; связь более последовательна для gait speed.
7. **Sarcopenia definitions 2023** — сравнение недавних определений саркопении по распространённости и связи со смертностью (популяционные когорты).
8. **Clin Nutr 2022 (48 исследований, 3 135 473 участников)** — протоколы измерения хвата в исследованиях смертности неполные и гетерогенные; значения хвата выше при меньшем числе контролируемых переменных протокола.

---

## 6. VO2max / кардиореспираторная пригодность и смертность (`vo2max-mortality`)

| #   | Работа                                                                                        | Год  | Журнал              | Цит. | Ссылка                                                                           |
| --- | --------------------------------------------------------------------------------------------- | ---- | ------------------- | ---- | -------------------------------------------------------------------------------- |
| 1   | Importance of Assessing CRF in Clinical Practice: A Case for Fitness as a Clinical Vital Sign | 2016 | Circulation         | 1954 | [DOI:10.1161/cir.0000000000000461](https://doi.org/10.1161/cir.0000000000000461) |
| 2   | Impact of CRF on All-Cause and Disease-Specific Mortality: Advances Since 2009                | 2017 | Prog Cardiovasc Dis | 346  | [DOI:10.1016/j.pcad.2017.03.001](https://doi.org/10.1016/j.pcad.2017.03.001)     |
| 3   | CRF as predictor of cancer mortality: SR+MA                                                   | 2015 | Ann Oncol           | 197  | [DOI:10.1093/annonc/mdu250](https://doi.org/10.1093/annonc/mdu250)               |
| 4   | CRF is a strong and consistent predictor of morbidity and mortality: overview of SR           | 2024 | Br J Sports Med     | 193  | [DOI:10.1136/bjsports-2023-107849](https://doi.org/10.1136/bjsports-2023-107849) |
| 5   | Objectively Assessed CRF and All-Cause Mortality: Updated MA of 37 Cohort Studies             | 2022 | Mayo Clin Proc      | 164  | [DOI:10.1016/j.mayocp.2022.02.029](https://doi.org/10.1016/j.mayocp.2022.02.029) |
| 6   | CRF and mortality from all causes, CVD and cancer: dose-response MA                           | 2022 | Br J Sports Med     | 83   | [DOI:10.1136/bjsports-2021-104876](https://doi.org/10.1136/bjsports-2021-104876) |
| 7   | CRF measured with CPET and mortality in patients with CVD: MA                                 | 2021 | J Sport Health Sci  | 80   | [DOI:10.1016/j.jshs.2021.06.004](https://doi.org/10.1016/j.jshs.2021.06.004)     |
| 8   | Joint Association of Fitness and Fatness on CVD Mortality: Meta-Analysis                      | 2018 | Prog Cardiovasc Dis | 80   | [DOI:10.1016/j.pcad.2018.07.004](https://doi.org/10.1016/j.pcad.2018.07.004)     |
| 9   | Impact of Changes in CRF on Hypertension, Dyslipidemia and Survival                           | 2017 | Prog Cardiovasc Dis | 53   | [DOI:10.1016/j.pcad.2017.02.006](https://doi.org/10.1016/j.pcad.2017.02.006)     |
| 10  | CRF, body mass index and mortality: SR+MA                                                     | 2025 | Br J Sports Med     | 47   | [DOI:10.1136/bjsports-2024-108748](https://doi.org/10.1136/bjsports-2024-108748) |

1. **Ross 2016 (AHA scientific statement)** — низкий CRF прочно связан с риском ССЗ, общей смертности и смертности от раков; CRF — потенциально более сильный предиктор, чем классические факторы риска; призыв считать CRF «клиническим витальным знаком».
2. **Kodama-era update 2017 (обзор)** — доказательства обратной независимой связи CRF со смертностью устойчивы при разных методах оценки (от прямого VO2max до предикционных уравнений).
3. **Ann Oncol 2015 (MA рак-смертность, медиана 16.4 лет)** — промежуточный CRF: RR 0.80 (0.67–0.97), высокий CRF: RR 0.55 (0.47–0.65) против низкого; независимо от адипозности.
4. **BJSM 2024 (overview, 26 SR)** — высокий vs низкий CRF: наибольшее снижение риска общей смертности HR 0.47 (0.39–0.56); на каждый 1 MET выше CRF — снижение общей смертности на 11–17% (HR 0.89 и 0.83 в разных мета-анализах); incident heart failure HR 0.31 (0.19–0.49) high vs low и HR 0.82 на 1 MET; у кардиобольных CVD-смертность HR 0.27 (0.16–0.48).
5. **Mayo 2022 (MA 37 когорт)** — верхняя vs нижняя тертиль CRF: RR 0.55 (0.50–0.61); на каждый 1 MET больше — RR 0.89 (0.86–0.92); сила связи не зависит от возраста, пола, метода оценки.
6. **BJSM 2022 (dose-response MA)** — на 1 MET: all-cause 0.88 (0.83–0.93), CVD 0.87 (0.83–0.91), cancer 0.93 (0.91–0.96); высший vs низший CRF: 0.47 / 0.49 / 0.57 соответственно.
7. **JSHS 2021 (пациенты с CVD, CPET)** — на 1 MET больше: all-cause HR 0.81 (0.74–0.88); у ИБС с высоким CRF HR 0.32 (0.26–0.41) против непригодных.
8. **Fitness vs fatness 2018 (MA)** — непригодные имеют 2–3-кратный риск смертности на всех уровнях BMI; fit-ожирение: +42% CVD-смертности vs fit-норма, fit-избыточный вес +25%.
9. **Changes in CRF 2017 (overview)** — улучшение CRF связано с меньшей гипертонией/дислипидемией и лучшей выживаемостью.
10. **BJSM 2025 (SR+MA)** — CRF и BMI совместно и смертность (новейшая сводка).

---

## 7. Сон → тестостерон / метаболизм (`sleep-testosterone-metabolic`)

| #   | Работа                                                                                   | Год  | Журнал                  | Цит. | Ссылка                                                                               |
| --- | ---------------------------------------------------------------------------------------- | ---- | ----------------------- | ---- | ------------------------------------------------------------------------------------ |
| 1   | Sleep Duration and Quality: Impact on Cardiometabolic Health (AHA statement)             | 2016 | Circulation             | 830  | [DOI:10.1161/cir.0000000000000444](https://doi.org/10.1161/cir.0000000000000444)     |
| 2   | Short sleep duration and cardiometabolic risk: from pathophysiology to clinical evidence | 2019 | Nat Rev Cardiol         | 272  | [DOI:10.1038/s41569-018-0109-6](https://doi.org/10.1038/s41569-018-0109-6)           |
| 3   | Sleep and Reproductive Health                                                            | 2020 | J Sleep Res             | 103  | [DOI:10.5334/jcr.190](https://doi.org/10.5334/jcr.190)                               |
| 4   | The Association between Sleep Duration and Metabolic Syndrome: NHANES 2013/2014          | 2019 | Nutrients               | 182  | [DOI:10.3390/nu11112582](https://doi.org/10.3390/nu11112582)                         |
| 5   | Effects of sleep restriction on metabolism-related parameters: SR+MA (41 RCT)            | 2019 | Sleep Med Rev           | 132  | [DOI:10.1016/j.smrv.2019.02.002](https://doi.org/10.1016/j.smrv.2019.02.002)         |
| 6   | Sleep Duration and Metabolic Syndrome. An Updated Dose-Risk Metaanalysis                 | 2015 | Ann Am Thorac Soc       | 116  | [DOI:10.1513/annalsats.201504-190oc](https://doi.org/10.1513/annalsats.201504-190oc) |
| 7   | Sleep duration and metabolic syndrome: updated SR+MA                                     | 2021 | Sleep Med Rev           | 105  | [DOI:10.1016/j.smrv.2021.101451](https://doi.org/10.1016/j.smrv.2021.101451)         |
| 8   | Sleep, testosterone and cortisol balance, and ageing men                                 | 2022 | Rev Endocr Metab Disord | 63   | [DOI:10.1007/s11154-022-09755-4](https://doi.org/10.1007/s11154-022-09755-4)         |
| 9   | Effect of partial and total sleep deprivation on serum testosterone: SR+MA               | 2021 | Sleep Med               | 20   | [DOI:10.1016/j.sleep.2021.10.031](https://doi.org/10.1016/j.sleep.2021.10.031)       |
| 10  | Association between OSA and male serum testosterone: SR+MA                               | 2022 | Andrology               | 18   | [DOI:10.1111/andr.13111](https://doi.org/10.1111/andr.13111)                         |

1. **St-Onge 2016 (AHA statement)** — короткий сон и нарушения сна связаны с кардиометаболическим риском: ожирение, гипертония, диабет 2 типа, ССЗ; призыв включать сон в рекомендации по здоровью.
2. **Nat Rev Cardiol 2019 (обзор)** — короткий сон связан с увеличением заболеваемости и смертности, главным образом сердечно-сосудистой; механизмы: вегетатика, эндотелий, метаболическая регуляция, воспаление, коагуляция.
3. **J Sleep Res 2020 (обзор)** — депривация сна у мужчин связана со снижением тестостерона; у женщин — с нарушением гонадотропинов и половых стероидов.
4. **NHANES 2019 (n=2737)** — U-образная связь сна и метаболического синдрома; наименьшая тяжесть MetS при 7 ч/ночь.
5. **Sleep Med Rev 2019 (MA 41 RCT)** — ограничение сна дало прибавку массы +0.34 кг (p=0.003) и снижение инсулиновой чувствительности (SMD −0.70, p<0.01); изменений лепина, грелина и расхода энергии не найдено.
6. **Ann Am Thorac Soc 2015 (MA 18 исследований, 75 657)** — dose-response между коротким сном и MetS: <5 ч сна — в 1.5 раза выше шансы MetS (референс 7–8 ч); долгий сон не поддержан.
7. **Sleep Med Rev 2021 (36 cross-sectional + 9 longitudinal, 164 799 MetS + 430 895 контроль)** — «U-shape» для prevalent MetS; короткий сон связан и с incident MetS (RR 1.16, CI 0.95–1.41 — NS в лонгитюде).
8. **Rev Endocr Metab Disord 2022 (обзор)** — OSA связана с более низким тестостероном после поправки на возраст и ожирение; вывод «CPAP не влияет на тестостерон» преждевременен — исследования underpowered.
9. **Sleep Med 2021 (MA 18 исследований, 252 мужчины)** — краткосрочная частичная депривация сна не влияла на тестостерон (SMD −0.22; CI −0.5…0.06; NS), полная депривация (≥24 ч) снижала тестостерон (SMD −0.64; CI −0.87…−0.42).
10. **Andrology 2022 (SR+MA)** — OSA и уровень тестостерона у мужчин: систематический обзор и мета-анализ.

---

## 8. Анаболические стероиды — сердечно-сосудистый риск (`anabolic-steroids-cardio`)

| #   | Работа                                                                               | Год  | Журнал                     | Цит. | Ссылка                                                                                     |
| --- | ------------------------------------------------------------------------------------ | ---- | -------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| 1   | Cardiovascular Toxicity of Illicit Anabolic-Androgenic Steroid Use                   | 2017 | Circulation                | 228  | [DOI:10.1161/circulationaha.116.026945](https://doi.org/10.1161/circulationaha.116.026945) |
| 2   | Anabolic-androgenic steroid use and psychopathology in athletes: SR                  | 2015 | Curr Neuropharmacol        | 124  | [DOI:10.2174/1570159x13666141210222725](https://doi.org/10.2174/1570159x13666141210222725) |
| 3   | AAS related deaths: autoptic, histopathological and toxicological findings           | 2015 | Curr Neuropharmacol        | 102  | [DOI:10.2174/1570159x13666141210225414](https://doi.org/10.2174/1570159x13666141210225414) |
| 4   | Adverse Effects of Anabolic-Androgenic Steroids: Literature Review                   | 2021 | Healthcare                 | 101  | [DOI:10.3390/healthcare9010097](https://doi.org/10.3390/healthcare9010097)                 |
| 5   | Polypharmacy among AAS users: descriptive metasynthesis                              | 2015 | Subst Abuse                | 97   | [DOI:10.1186/s13011-015-0006-5](https://doi.org/10.1186/s13011-015-0006-5)                 |
| 6   | Former Abusers of AAS Exhibit Decreased Testosterone Levels and Hypogonadal Symptoms | 2016 | PLoS One                   | 96   | [DOI:10.1371/journal.pone.0161208](https://doi.org/10.1371/journal.pone.0161208)           |
| 7   | Anabolic-androgenic steroids and cardiovascular risk                                 | 2019 | Curr Med Chem? (Clin Med)  | 46   | [DOI:10.1097/cm9.0000000000000407](https://doi.org/10.1097/cm9.0000000000000407)           |
| 8   | How the love of muscle can break a heart: AAS and metabolic/cardiovascular impact    | 2021 | Rev Endocr Metab Disord    | 37   | [DOI:10.1007/s11154-020-09616-y](https://doi.org/10.1007/s11154-020-09616-y)               |
| 9   | Anabolic Steroids and Cardiovascular Outcomes: The Controversy                       | 2020 | Cureus                     | 19   | [DOI:10.7759/cureus.9333](https://doi.org/10.7759/cureus.9333)                             |
| 10  | AAS at supraphysiological doses: cardiovascular impacts and mechanisms               | 2026 | J Steroid Biochem Mol Biol | 3    | [DOI:10.1016/j.jsbmb.2026.106938](https://doi.org/10.1016/j.jsbmb.2026.106938)             |

1. **Baggish 2017 (Circulation, cross-sectional когорта 140 культуристов 34–54 лет)** — длительный AAS-употребление ассоциирован с дисфункцией миокарда и ускоренным коронарным атеросклерозом: объём бляшек медиана 3 [0–174] мм³ vs 0 [0–69] мм³ у не-употреблявших (P=0.012); кумулятивная доза за 10 лет — +0.60 SD объёма бляшек (CI 0.16–1.03; P=0.008).
2. **Psychopathology SR 2015** — AAS связаны с аффект-дестабилизацией: длительное применение — депрессия, короткое — гипомания, отмена может сопровождаться депрессией.
3. **AAS-related deaths 2015** — обзор летальных случаев: 19 фатальных случаев 1990–2012 с кардиальной причиной после исключения экстракардиальных; риски: внезапная сердечная смерть, ИМ, изменённые липопротеины, гипертрофия сердца.
4. **Adverse effects 2021 (обзор)** — сердечно-сосудистая и репродуктивная системы — наиболее часто затронутые при AAS-употреблении.
5. **Polypharmacy 2015** — AAS-пользователи сочетают с hCG, инсулином, кленбутеролом, тироксином, опиоидами и др. (13 групп веществ).
6. **PLoS One 2016 (когорта 140 атлетов)** — бывшие AAS-употреблявшие: общий тестостерон 14.4 (11.9–17.7) нмоль/л vs 18.8 (16.6–22.0) у контроля — значимо ниже, с симптомами гипогонадизма спустя годы после прекращения.
7. **Curr Med 2019 (обзор)** — употребление/злоупотребление AAS коррелирует с более высоким сердечно-сосудистым риском, но причинность осложнена конфаундерами.
8. **Rev Endocr 2021 (обзор)** — AAS заметно снижают HDL-C и повышают LDL-C; хроническое употребление ассоциировано с более высоким инсулином натощак и нарушенной толерантностью к глюкозе.
9. **Cureus 2020** — AAS связаны с нарушениями липидного обмена, гипертонией, коагулопатиями и кардиомиопатией; ИМ, фатальные аритмии, кардиомиопатия.
10. **JSBMB 2026 (свежайший обзор)** — супрафизиологические дозы AAS: кардиоваскулярные воздействия и патофизиологические механизмы.

---

## 9. Автогрегуляция / RPE в силовой (`autoregulation-rpe`)

| #   | Работа                                                                                 | Год  | Журнал                     | Цит. | Ссылка                                                                             |
| --- | -------------------------------------------------------------------------------------- | ---- | -------------------------- | ---- | ---------------------------------------------------------------------------------- |
| 1   | The Acute and Chronic Effects of Implementing Velocity Loss Thresholds: SR             | 2023 | Sports Medicine            | 104  | [DOI:10.1007/s40279-022-01754-4](https://doi.org/10.1007/s40279-022-01754-4)       |
| 2   | Rating of perceived exertion on resistance training in elderly subjects                | 2019 | Expert Rev Cardiovasc Ther | 79   | [DOI:10.1080/14779072.2019.1561278](https://doi.org/10.1080/14779072.2019.1561278) |
| 3   | RPE vs. Percentage 1RM Loading in Periodized Programs Matched for Sets and Repetitions | 2018 | Front Physiol              | 65   | [DOI:10.3389/fphys.2018.00247](https://doi.org/10.3389/fphys.2018.00247)           |
| 4   | Resistance training as a treatment for older persons with PAD: SR+MA                   | 2020 | Br J Sports Med            | 49   | [DOI:10.1136/bjsports-2018-100205](https://doi.org/10.1136/bjsports-2018-100205)   |
| 5   | Autoregulation in Resistance Training: Addressing the Inconsistencies                  | 2020 | Sports Medicine            | 48   | [DOI:10.1007/s40279-020-01330-8](https://doi.org/10.1007/s40279-020-01330-8)       |
| 6   | Effects of Resistance Training to Muscle Failure on Acute Fatigue: SR+MA               | 2022 | Sports Medicine            | 45   | [DOI:10.1007/s40279-021-01602-x](https://doi.org/10.1007/s40279-021-01602-x)       |
| 7   | The Effect of Load and Volume Autoregulation: SR+MA                                    | 2022 | Sports Med Open            | 27   | [DOI:10.1186/s40798-021-00404-9](https://doi.org/10.1186/s40798-021-00404-9)       |
| 8   | Proximity to Failure and Total Repetitions… Accuracy of RIR-based RPE                  | 2021 | J Strength Cond Res        | 40   | [DOI:10.1519/jsc.0000000000002995](https://doi.org/10.1519/jsc.0000000000002995)   |
| 9   | Is moderate RT adequate for older adults with sarcopenia? Network meta-analysis        | 2023 | J Nutr Health Aging        | 29   | [DOI:10.1186/s11556-023-00333-4](https://doi.org/10.1186/s11556-023-00333-4)       |
| 10  | Superset Versus Traditional RT Prescriptions: SR+MA                                    | 2025 | Sports Medicine            | 15   | [DOI:10.1007/s40279-025-02176-8](https://doi.org/10.1007/s40279-025-02176-8)       |

1. **González-Badillo/SR 2023 (velocity loss thresholds)** — градуированная связь величины velocity loss в сете с острым объёмом, нейромышечными, метаболическими и перцептивными ответами; выбор порога VL не влияет на силу и выносливость, но высокие пороги лучше для гипертрофии, низкие — для прыжка/спринта/скорости на субмаксимальных нагрузках.
2. **RPE у пожилых (обзор)** — RPE-шкалы могут определять интенсивность RT у пожилых, пригодны для дома; простой и полезный инструмент.
3. **Helms 2018 (RCT, periodized программы, sets/reps matched)** — RPE-based loading: приросты жима +10.70 кг, приседа +17.05 кг, total +27.75 кг vs %1RM-группы (+9.64/+13.91/+23.55); различия NS, но majority-inference — небольшое преимущество RPE-подхода в силе.
4. **PAD RT MA 2020** — RT улучшил ходьбу у пожилых с периферической артериальной болезнью (SMD 0.66 для claudication onset); более высокая интенсивность — лучше исходы.
5. **Greig 2020 (концептуальный обзор)** — главные ограничения исследований автогрегуляции: непоследовательная терминология (адаптация, готовность, усталость, ответ) и неясность реализации стратегий; предложена объединяющая рамка.
6. **Grgic 2022 (SR+MA острого утомления)** — см. тему RIR: тренировка до отказа даёт большее острое утомление и требует большего времени восстановления.
7. **Autoregulation MA 2022 (15 исследований)** — autoregulated load (RIR-based RPE, VBT) vs %1RM: схожий прирост силы и гипертрофии; пороги VL >25% лучше для гипертрофии (MD 0.64 см², CI 0.07–1.20), ≤25% — лучше для силы.
8. **Zourdos 2021** — точность RIR-прогноза растёт ближе к отказу и при малом/среднем числе повторов в сете.
9. **Sarcopenia network MA 2023** — умеренно-интенсивная RT (+nutrition) превзошла умеренную RT по массе мышц, силе ног и физическим показателям.
10. **Supersets MA 2025** — суперсеты сопоставимы по эффективности, экономят время, но дают более высокую внутреннюю нагрузку, больший мышечный урон и воспринимаемое усилие.

---

## 10. Velocity-based training (`velocity-based-training`)

| #   | Работа                                                                                                   | Год  | Журнал                          | Цит. | Ссылка                                                                           |
| --- | -------------------------------------------------------------------------------------------------------- | ---- | ------------------------------- | ---- | -------------------------------------------------------------------------------- |
| 1   | The Acute and Chronic Effects of Implementing Velocity Loss Thresholds: SR                               | 2023 | Sports Medicine                 | 104  | [DOI:10.1007/s40279-022-01754-4](https://doi.org/10.1007/s40279-022-01754-4)     |
| 2   | Validity of Various Methods for Determining Velocity, Force, and Power in the Back Squat                 | 2017 | Int J Sports Physiol Perform    | 109  | [DOI:10.1123/ijspp.2016-0627](https://doi.org/10.1123/ijspp.2016-0627)           |
| 3   | Comparison of Velocity-Based and Traditional Percentage-Based Loading (8-недельное RCT)                  | 2020 | J Strength Cond Res             | 83   | [DOI:10.1519/jsc.0000000000003089](https://doi.org/10.1519/jsc.0000000000003089) |
| 4   | Reliability of technologies to measure the barbell velocity                                              | 2020 | PLoS One                        | 68   | [DOI:10.1371/journal.pone.0232465](https://doi.org/10.1371/journal.pone.0232465) |
| 5   | Effects of velocity loss in the bench press on strength gains, neuromuscular adaptations and hypertrophy | 2020 | Scand J Med Sci Sports          | 62   | [DOI:10.1111/sms.13775](https://doi.org/10.1111/sms.13775)                       |
| 6   | Individual Sprint Force-Velocity Profile Adaptations to Assisted/Resisted VBT                            | 2020 | Sports                          | 56   | [DOI:10.3390/sports8050074](https://doi.org/10.3390/sports8050074)               |
| 7   | Superior Changes in Jump, Sprint, COD but Not Maximal Strength Following 6 Weeks VBT                     | 2021 | Int J Sports Physiol Perform    | 55   | [DOI:10.1123/ijspp.2019-0999](https://doi.org/10.1123/ijspp.2019-0999)           |
| 8   | Effects of In-Season Velocity- Versus Percentage-Based Training in Academy Rugby                         | 2020 | Int J Sports Physiol Perform    | 52   | [DOI:10.1123/ijspp.2019-0058](https://doi.org/10.1123/ijspp.2019-0058)           |
| 9   | Prediction of the Maximum Number of Repetitions and RIR From Barbell Velocity                            | 2018 | Int J Sports Physiol Perform    | 52   | [DOI:10.1123/ijspp.2017-0302](https://doi.org/10.1123/ijspp.2017-0302)           |
| 10  | Effects of VBT on Strength and Power in Elite Athletes: SR                                               | 2021 | Int J Environ Res Public Health | 41   | [DOI:10.3390/ijerph18105257](https://doi.org/10.3390/ijerph18105257)             |

1. **VL thresholds SR 2023** — см. тему «Автогрегуляция»: градуированная связь VL с острыми ответами; высокие пороги — гипертрофия, низкие — прыжок/спринт/скорость; на силу и выносливость выбор порога не влияет.
2. **Validity 2017 (присед)** — GymAware был высоковалиден для всех критериальных переменных; точность PUSH сомнительна для большинства переменных во всём диапазоне интенсивностей.
3. **Dorrell 2020 (RCT, тренированные мужчины, 8 нед)** — VBT vs %1RM: значимые приросты силы в приседе (9% vs 8%), жиме (8% vs 4%, p=0.004), CMJ (+5% только в VBT, p=0.018); VBT достиг этого при значительно меньшем суммарном объёме.
4. **Reliability 2020** — T-Force — предпочтительный вариант оценки скорости штанги; Speed4Lifts и STT — приемлемые альтернативы при скоростях ≤1.0 м/с; приложение My Lift — excessive errors.
5. **Bench press VL 2020** — более высокие пороги VL дали больший объём нагрузки и гипертрофию; низкие пороги — нейромышечные адаптации; сила — без межгрупповых различий.
6. **Sprint FV 2020** — исходный force-velocity профиль спринта влияет на механический ответ на resisted/assisted VBT (r=−0.95 и −0.79).
7. **IJSPP 2021 (6 недель, VBT vs PBT)** — VBT дал большие улучшения jump/sprint/COD (ES до 1.35), 1RM — без значимого различия; PBT может быть чуть лучше для сильных атлетов, сфокусированных на максимальной силе.
8. **Academy rugby 2020** — в сезонe VBT: большие приросты скорости приседа, меньшее время под нагрузкой и перцептивный стресс vs PBT.
9. **XRM prediction 2018** — групповые уравнения неприменимы для оценки XRM–velocity связи и RIR; необходимы индивидуализированные зависимости.
10. **Elite athletes SR 2021 (7 исследований)** — velocity losses 10–20% помогают индуцировать нейромышечные адаптации и снижать нейромышечную усталость; velocity-зоны программируются периодизированно или фиксированно.

---

## Покрытие и ограничения

- **Хорошо покрыто:** объём/dose-response, RIR, частота, сила хвата, VO2max, стероиды, RPE/VBT (много мета-анализов 2015–2026).
- **Слабее:** блочная периодизация — мало именно силовых мета-анализов (доминируют вынослостные исследования и нарративы); сон→тестостерон — мета-анализ маленький (18 исследований, 252 мужчины), ключевые классические работы (Leproult & Van Cauter 2011, Spiegel 1999) за пределами фильтра 2015–2026; у части записей в UK Biobank BMJ 2018 конкретные HR в abstract не приведены.
- Полные abstract сохранены в `raw/*.json` и `_dedup_*.json` (поле `abstractFull`).
