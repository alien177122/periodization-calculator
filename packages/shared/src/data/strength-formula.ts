import {z} from 'zod';

export const FormulaPartOrderSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const StrengthFormulaPartSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  hint: z.string().min(1),
  tone: z.enum(['positive', 'negative']),
  visualOrder: FormulaPartOrderSchema,
});

export const StrengthFormulaOverviewSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  thesis: z.string().min(1),
  formulaParts: z.array(StrengthFormulaPartSchema).length(5),
  parameters: z.array(z.string().min(1)).min(1),
  rounding: z.string().min(1),
  logic: z.string().min(1),
});

export const PriorityLevelSchema = z.enum([
  'foundation',
  'optimization',
  'tuning',
  'advanced',
  'remove',
]);

export type PriorityLevel = z.infer<typeof PriorityLevelSchema>;

export const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  foundation: 0,
  optimization: 1,
  tuning: 2,
  advanced: 3,
  remove: 4,
} as const;

export const StrengthFactorTierSchema = z.object({
  rank: z.enum(['S-TIER', 'A-TIER', 'B-TIER', 'C-TIER', 'F-TIER']),
  zone: z.string().min(1),
  level: PriorityLevelSchema,
  plainLabel: z.string().min(1),
  detail: z.string().min(1),
  action: z.string().min(1),
  keyParameters: z.array(z.string().min(1)).min(1),
  trigger: z.string().min(1),
  color: z.string().min(1),
  textColor: z.string().min(1).optional(),
});

export const StrengthWavePhaseSchema = z.object({
  id: z.string().min(1),
  phase: z.string().min(1),
  weeks: z.string().min(1),
  goal: z.string().min(1),
  intensity: z.string().min(1),
  scheme: z.string().min(1),
  volume: z.string().min(1),
  focus: z.string().min(1),
  stopRule: z.string().min(1),
  color: z.string().min(1),
});

export const StrengthWarmupStepSchema = z.object({
  stage: z.string().min(1),
  weight: z.string().min(1),
  reps: z.string().min(1),
  rest: z.string().min(1),
  goal: z.string().min(1),
  color: z.string().min(1),
  isWorkSet: z.boolean().optional(),
});

export const StrengthScienceCardSchema = z.object({
  id: z.string().min(1),
  group: z.string().min(1),
  category: z.enum(['Сила', 'Техника', 'Восстановление']),
  difficulty: z.number().int().min(1).max(3),
  question: z.string().min(1),
  answer: z.string().min(1),
  application: z.string().min(1),
  source: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  color: z.string().min(1),
});

export const StrengthProtocolStepSchema = z.object({
  step: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  bullets: z.array(z.string().min(1)).optional(),
  color: z.string().min(1),
});

export const StrengthAutoregChecklistSchema = z.object({
  before: z.array(z.string().min(1)).min(1),
  during: z.array(z.string().min(1)).min(1),
  after: z.array(z.string().min(1)).min(1),
});

export const StrengthFormulaDataSchema = z.object({
  overview: StrengthFormulaOverviewSchema,
  factorTiers: z.array(StrengthFactorTierSchema).min(1),
  wavePhases: z.array(StrengthWavePhaseSchema).min(1),
  bicepsNote: z.string().min(1),
  warmupStack: z.array(StrengthWarmupStepSchema).min(1),
  scienceCards: z.array(StrengthScienceCardSchema).min(1),
  protocolSteps: z.array(StrengthProtocolStepSchema).min(1),
  autoregChecklist: StrengthAutoregChecklistSchema,
});

export type FormulaPartVisualOrder = z.infer<typeof FormulaPartOrderSchema>;
export type StrengthFormulaPart = z.infer<typeof StrengthFormulaPartSchema>;
export type StrengthFormulaOverview = z.infer<typeof StrengthFormulaOverviewSchema>;
export type StrengthFactorTier = z.infer<typeof StrengthFactorTierSchema>;
export type StrengthWavePhase = z.infer<typeof StrengthWavePhaseSchema>;
export type StrengthWarmupStep = z.infer<typeof StrengthWarmupStepSchema>;
export type StrengthScienceCard = z.infer<typeof StrengthScienceCardSchema>;
export type StrengthProtocolStep = z.infer<typeof StrengthProtocolStepSchema>;
export type StrengthAutoregChecklist = z.infer<typeof StrengthAutoregChecklistSchema>;
export type StrengthFormulaData = z.infer<typeof StrengthFormulaDataSchema>;

const strengthFormulaDataInput = {
  overview: {
    title: 'Формула силы',
    subtitle:
      'Практичная карта: что двигать в первую очередь, как строить 8 недель и где не накопить лишнюю усталость.',
    thesis:
      'Сила растёт, когда тяжёлая специфичная практика воспроизводится чаще, чем накапливается лишняя усталость.',
    formulaParts: [
      {
        id: 'specificity',
        label: 'Специфичность',
        hint: 'Тренируй тот паттерн, амплитуду и скорость, в которых хочешь стать сильнее.',
        tone: 'positive',
        visualOrder: 1,
      },
      {
        id: 'heavy-exposures',
        label: 'Тяжёлые экспозиции',
        hint: 'Нужны регулярные касания зоны 80–90% 1ПМ без постоянного отказа.',
        tone: 'positive',
        visualOrder: 2,
      },
      {
        id: 'recovery',
        label: 'Восстановление',
        hint: 'Сон, питание и длинный отдых между подходами сохраняют качество усилия.',
        tone: 'positive',
        visualOrder: 3,
      },
      {
        id: 'quality',
        label: 'Качество повторений',
        hint: 'Техника, полный ROM и внешняя задача важнее случайного добивания объёма.',
        tone: 'positive',
        visualOrder: 4,
      },
      {
        id: 'excess-fatigue',
        label: 'Лишняя усталость',
        hint: 'Отказ в каждом подходе, короткий отдых и лишние спецметоды крадут пик силы.',
        tone: 'negative',
        visualOrder: 5,
      },
    ],
    parameters: ['Пример: присед 120 кг', 'жим 120 кг', 'бицепс 60 кг'],
    rounding: 'CEILING(вес / 2,5) × 2,5',
    logic: 'Накопление → интенсификация → откат → пик',
  },
  factorTiers: [
    {
      rank: 'S-TIER',
      zone: 'Фундамент',
      level: 'foundation',
      plainLabel: 'Тренируй то, что хочешь улучшить',
      detail:
        'Сила специфична: перенос выше, когда совпадают упражнение, амплитуда, скорость и тип усилия.',
      action: 'Выбери 1–2 ключевых упражнения на цикл и тренируй их по 2–3 касания в неделю.',
      keyParameters: [
        '>85% 1ПМ',
        '2–3 экспозиции в неделю',
        'специфичность',
        'отдых 5+ минут',
        'сон 7–9 часов',
        'профицит калорий',
      ],
      trigger: 'Если этого нет, всё остальное даёт мало отдачи.',
      color: '#ffb020',
      textColor: '#000',
    },
    {
      rank: 'A-TIER',
      zone: 'Оптимум',
      level: 'optimization',
      plainLabel: 'Держи тяжёлую работу качественной',
      detail: 'Сила лучше растёт от регулярных тяжёлых подходов с запасом, чем от хаотичного отказа.',
      action: 'Работай чаще в RPE 8–9, оставляя 1–2 повторения в запасе на большинстве подходов.',
      keyParameters: [
        '3–6 подходов',
        'RPE 8–9 / RIR 1–2',
        'периодизация',
        'делоад',
        'авторегуляция',
        'взрывные подходы 40–60%',
      ],
      trigger: 'Подключай, когда база стабильна и восстановление под контролем.',
      color: '#ffc94d',
      textColor: '#000',
    },
    {
      rank: 'B-TIER',
      zone: 'Тюнинг',
      level: 'tuning',
      plainLabel: 'Шлифуй слабые звенья после базы',
      detail:
        'Подсобка, паузы и объёмная база полезны, когда они решают конкретную проблему упражнения.',
      action: 'Добавляй 1–2 вспомогательных упражнения, а не отдельную программу поверх основной.',
      keyParameters: ['подсобка', 'паузы', 'объёмная база 65–80%', 'изоляция 12–20 повторений'],
      trigger: 'Шлифуй слабые звенья, но не перегружай ЦНС вспомогательной работой.',
      color: '#5ba4ff',
      textColor: '#000',
    },
    {
      rank: 'C-TIER',
      zone: 'Спецметоды',
      level: 'advanced',
      plainLabel: 'Используй спецметоды только под задачу',
      detail:
        'Негативы, цепи, резина и изометрия помогают опытным атлетам, но быстро дорожают усталостью.',
      action:
        'Вводи один спецметод на блок и убирай его, если техника или восстановление проседают.',
      keyParameters: ['негативы', 'цепи и резина', 'изометрия'],
      trigger: 'Точечный инструмент для опытных, а не замена базе.',
      color: '#3affb8',
      textColor: '#000',
    },
    {
      rank: 'F-TIER',
      zone: 'Мусор',
      level: 'remove',
      plainLabel: 'Убери то, что крадёт силу',
      detail:
        'Пампинг ради пампинга, короткий отдых и отказ в каждом подходе повышают усталость быстрее, чем силу.',
      action: 'Если элемент не улучшает главный подъём или восстановление, вычеркни его из блока.',
      keyParameters: [
        'внутренний фокус',
        'отказ в каждом подходе',
        'отдых <2 минут',
        'пампинг вместо задачи',
        'нестабильная опора',
        'дефицит калорий',
      ],
      trigger: 'Крадут силу, мешают технике и повышают риск травмы.',
      color: '#ff4d4d',
      textColor: '#fff',
    },
  ],
  wavePhases: [
    {
      id: 'accumulation',
      phase: 'Накопление',
      weeks: '1–2',
      goal: 'Гипертрофия и техника',
      intensity: '70–74% 1ПМ',
      scheme: '4×8 → 4×7',
      volume: '32 → 28 повторений',
      focus: 'RIR 2, полный ROM, контроль эксцентрики.',
      stopRule: 'Останови подход, если техника начинает ломаться раньше последнего повторения.',
      color: '#ffc94d',
    },
    {
      id: 'transition',
      phase: 'Переход',
      weeks: '3–4',
      goal: 'Адаптация и сила',
      intensity: '79–83% 1ПМ',
      scheme: '4×6 → 4×5',
      volume: '24 → 20 повторений',
      focus: 'Внешний фокус, отдых 4–5 минут, RIR 1–2.',
      stopRule: 'Если RPE уже на втором подходе ≥ 9,5, снизь вес на 2,5–5 кг.',
      color: '#ffb020',
    },
    {
      id: 'deload',
      phase: 'Делоад',
      weeks: '5',
      goal: 'Суперкомпенсация',
      intensity: 'около 77% 1ПМ',
      scheme: '4×6',
      volume: '24 повторения',
      focus: 'Снижение RPE до 7, восстановление суставов и техники.',
      stopRule: 'Не превращай делоад в тест: скорость и техника важнее веса.',
      color: '#5ba4ff',
    },
    {
      id: 'peak',
      phase: 'Пик',
      weeks: '6–8',
      goal: 'Максимальная сила',
      intensity: '81–92% 1ПМ',
      scheme: '4×5 → 4×3',
      volume: '20 → 12 повторений',
      focus: 'Скоростное намерение, RIR 0–1, кластеры при усталости.',
      stopRule: 'При падении скорости более чем на четверть сократи один рабочий подход.',
      color: '#3affb8',
    },
  ],
  bicepsNote:
    'Для бицепса стандартные 3 подхода расширены до 4–5, что даёт прирост объёма примерно на 33–40%. Суммируй этот стресс с тяговыми упражнениями дня. Если локти начинают гореть, сразу убирай один подход.',
  warmupStack: [
    {
      stage: 'Разминка 1',
      weight: '20 кг',
      reps: '12',
      rest: '1–2 мин',
      goal: 'Активация, пульс и мобильность.',
      color: '#5ba4ff',
    },
    {
      stage: 'Разминка 2',
      weight: '35–45 кг',
      reps: '6',
      rest: '2–3 мин',
      goal: 'Прогрев суставов и мягкий старт ЦНС.',
      color: '#5ba4ff',
    },
    {
      stage: 'Разминка 3',
      weight: '55–60 кг',
      reps: '5',
      rest: '2–3 мин',
      goal: 'Нейроактивация и отработка рабочего паттерна.',
      color: '#ffc94d',
    },
    {
      stage: 'Разминка 4',
      weight: '70–72,5 кг',
      reps: '4',
      rest: '3–4 мин',
      goal: 'Подгонка под рабочий тонус.',
      color: '#ffc94d',
    },
    {
      stage: 'Рабочие подходы ×4',
      weight: '85 кг',
      reps: '8',
      rest: '4–5 мин',
      goal: 'Полная отдача и внешний фокус.',
      color: '#ffb020',
      isWorkSet: true,
    },
  ],
  scienceCards: [
    {
      id: 'strength_formula_specificity',
      group: 'Специфичность и перенос',
      category: 'Сила',
      difficulty: 1,
      question: 'Почему специфичность стоит выше остальных факторов?',
      answer:
        'Рост силы переносится туда, где совпадают паттерн, амплитуда, скорость и тип сокращения. Сила — это навык координации, а не только объём мышц.',
      application:
        'Если цель — жим 1ПМ, 2–3 касания штанги в неделю полезнее, чем набор случайной изоляции.',
      source: 'Saeterbakken et al., 2025',
      tags: ['специфичность', '1ПМ'],
      color: '#ffb020',
    },
    {
      id: 'strength_formula_load_zone',
      group: 'Специфичность и перенос',
      category: 'Сила',
      difficulty: 1,
      question: 'Какая зона интенсивности лучше для 1ПМ?',
      answer:
        'Лучше всего работают нагрузки выше 80% 1ПМ в диапазоне 1–6 повторений. Тяжёлые веса учат рекрутировать высокопороговые моторные единицы и работать в соревновательной механике.',
      application: 'Хороший ориентир — присед 4×3 на 82–85% 1ПМ с запасом 1–3 повторения.',
      source: 'Lopez et al., 2021',
      tags: ['интенсивность', 'тяжёлые веса'],
      color: '#ffb020',
    },
    {
      id: 'strength_formula_neural_component',
      group: 'Специфичность и перенос',
      category: 'Техника',
      difficulty: 2,
      question: 'Как сила растёт быстрее объёма мышц?',
      answer:
        'За счёт нейромышечной адаптации: рекрутирования, синхронизации и снижения антагонистического торможения. Сила может заметно расти даже при почти неизменном весе тела.',
      application:
        'После 6–8 недель силового блока рост 1ПМ без визуального набора мышц — нормальный сценарий.',
      source: 'Rong et al., 2025',
      tags: ['нейроадаптация', 'координация'],
      color: '#ffc94d',
    },
    {
      id: 'strength_formula_sets',
      group: 'Объём и частота',
      category: 'Сила',
      difficulty: 1,
      question: '1 подход или несколько для роста силы?',
      answer:
        'Несколько качественных подходов выигрывают у одиночного. Сила лучше растёт от регулярных тяжёлых экспозиций, а не от одного пикового усилия.',
      application: 'Вместо 1×5 используй top set и 2–3 back-off подхода в той же задаче.',
      source: 'Krieger, 2009',
      tags: ['подходы', 'объём'],
      color: '#ffb020',
    },
    {
      id: 'strength_formula_frequency',
      group: 'Объём и частота',
      category: 'Сила',
      difficulty: 2,
      question: 'Частота: 3 сессии в неделю лучше 1–2 при равном объёме?',
      answer:
        'Магии в самой частоте нет. Её плюс — разнести объём на менее утомляющие сессии и сохранить качество повторений и техники.',
      application:
        '6 тяжёлых подходов жима часто лучше разбить на 3 сессии по 2 подхода, чем сделать всё за один день.',
      source: 'Grgic et al., 2018',
      tags: ['частота', 'восстановление'],
      color: '#ffc94d',
    },
    {
      id: 'strength_formula_rest',
      group: 'Объём и частота',
      category: 'Восстановление',
      difficulty: 1,
      question: 'Почему отдых 3–5 минут лучше для силы?',
      answer:
        'Длинный отдых сохраняет повторения, тоннаж и качество усилия. Короткие паузы поднимают метаболическую усталость и мешают снова выдавать высокий уровень силы.',
      application: 'После приседа 3×3 на 85% держи около 4 минут отдыха вместо 90 секунд.',
      source: 'de Salles et al., 2009',
      tags: ['отдых', 'паузы между подходами'],
      color: '#ffb020',
    },
    {
      id: 'strength_formula_rom',
      group: 'Техника и управление усталостью',
      category: 'Техника',
      difficulty: 2,
      question: 'Когда полная амплитуда лучше частичной?',
      answer:
        'Полная амплитуда обычно даёт лучший общий рост силы и мышц. Частичная амплитуда полезна только для конкретного угла или слабой точки.',
      application:
        'База — полный присед. Присед с ограничителями или частичная амплитуда — только как вспомогательный инструмент.',
      source: 'Pallarés et al., 2021',
      tags: ['амплитуда', 'слабые точки'],
      color: '#5ba4ff',
    },
    {
      id: 'strength_formula_failure',
      group: 'Техника и управление усталостью',
      category: 'Восстановление',
      difficulty: 2,
      question: 'Нужно ли работать до отказа для силы?',
      answer:
        'Нет — при равном объёме отказ не даёт преимущества по силе, но создаёт больше усталости и удлиняет восстановление.',
      application: 'Держи рабочие подходы около RIR 1–3 вместо постоянного RPE 10.',
      source: 'Grgic et al., 2022',
      tags: ['отказ', 'RIR'],
      color: '#ff4d4d',
    },
    {
      id: 'strength_formula_intent_velocity',
      group: 'Техника и управление усталостью',
      category: 'Техника',
      difficulty: 2,
      question: 'Нужно ли ускорять штангу на тяжёлых весах?',
      answer:
        'Да. Намерение максимально ускорить концентрику поддерживает высокое нервно-мышечное усилие, даже если фактическая скорость штанги низкая.',
      application:
        'В жиме 6×2 на 75% опускай контролируемо, а вверх работай с намерением взорваться.',
      source: 'Davies et al., 2017',
      tags: ['скорость', 'намерение'],
      color: '#5ba4ff',
    },
    {
      id: 'strength_formula_periodization',
      group: 'Периодизация и VBT',
      category: 'Сила',
      difficulty: 2,
      question: 'Что реально даёт периодизация?',
      answer:
        'Она помогает организовать колебания интенсивности и усталости. При равном объёме разница между линейной и волновой моделями обычно невелика.',
      application:
        'Практичный блок: 3 недели накопления, 3 интенсификации, 1 подводка и 1 разгрузка.',
      source: 'Moesgaard et al., 2022',
      tags: ['периодизация', 'блоки'],
      color: '#3affb8',
    },
    {
      id: 'strength_formula_vbt_settings',
      group: 'Периодизация и VBT',
      category: 'Техника',
      difficulty: 3,
      question: 'Какие настройки VBT практичны для силы?',
      answer:
        'Часто лучше всего работают 70–80% 1ПМ, 3–5 подходов, 2–4 минуты отдыха и порог потери скорости 15–30%. Это позволяет дозировать усталость без лишнего накопления.',
      application: 'В приседе можно вести 5×3 на 75–80% и обрывать подход при 20% velocity loss.',
      source: 'Zhang et al., 2023',
      tags: ['VBT', 'velocity loss'],
      color: '#3affb8',
    },
    {
      id: 'strength_formula_vbt_vs_percent',
      group: 'Периодизация и VBT',
      category: 'Техника',
      difficulty: 3,
      question: 'Когда VBT лучше, чем процент от 1ПМ?',
      answer:
        'Когда готовность сильно гуляет из-за стресса, недосыпа или сезона. Скорость даёт обратную связь по текущему состоянию, а не по старому тесту.',
      application:
        'Если по плану стоит 80%, но скорость выглядит как 85%, VBT подскажет опустить вес в нужную зону.',
      source: 'Zhang et al., 2022',
      tags: ['VBT', 'авторегуляция'],
      color: '#3affb8',
    },
    {
      id: 'strength_formula_variable_resistance',
      group: 'Периодизация и VBT',
      category: 'Сила',
      difficulty: 3,
      question: 'Когда нужны цепи и резина?',
      answer:
        'Они могут помочь тренированным атлетам за счёт сверхнагрузки в зоне механического преимущества, но не заменяют базовую тяжёлую работу.',
      application:
        'Жим с цепями уместен в блоке на локаут, если старт стабильный, а скорость теряется в верхней части амплитуды.',
      source: 'Dos Santos et al., 2022',
      tags: ['цепи', 'переменное сопротивление'],
      color: '#3affb8',
    },
  ],
  protocolSteps: [
    {
      step: '01',
      title: 'Тест 1ПМ',
      description:
        'Проведи тест за 5–7 дней до старта. Если не хочешь тестировать максимум, оцени 1ПМ по формуле вес × (1 + повторения / 30) из отказного подхода на 3–5 повторений.',
      color: '#ffb020',
    },
    {
      step: '02',
      title: 'Жёсткие правила',
      bullets: [
        'Отдых 4–5 минут между рабочими подходами.',
        'Сон не меньше 7 часов и калорийный профицит +200–300 ккал.',
        'Отказ оставляй только на последние подходы изоляции, ориентир RIR 0–1.',
      ],
      color: '#ffc94d',
    },
    {
      step: '03',
      title: 'Авторегуляция',
      bullets: [
        'Если уже на втором подходе RPE ≥ 9,5, снижай вес на 2,5–5 кг до конца блока.',
        'Если скорость штанги падает более чем на 25% от первого подхода, сокращай работу на один подход.',
      ],
      color: '#5ba4ff',
    },
    {
      step: '04',
      title: 'Трекинг',
      description:
        'Записывай фактический вес, повторения и RPE после каждой тренировки. Волновая прогрессия работает только при честном журнале.',
      color: '#3affb8',
    },
  ],
  autoregChecklist: {
    before: [
      'Оцени сон, стресс, боль и общую готовность.',
      'Если усталость высокая, снизь целевой тоннаж на 10–20%.',
      'Проверь, что первый тяжёлый подход не выглядит как максимум.',
    ],
    during: [
      'RPE выше плана на 1+? Остановись на одно повторение раньше.',
      'Техника ломается? Сбрось вес или заверши упражнение.',
      'Сохраняй отдых 4–5 минут между тяжёлыми рабочими подходами.',
    ],
    after: [
      'Запиши фактический вес, повторения, RPE и короткий комментарий.',
      'Если восстановление затянулось, добавь день отдыха перед следующей сессией.',
      'Если боль держится две тренировки подряд, убери один подход или спецметод.',
    ],
  },
} satisfies z.input<typeof StrengthFormulaDataSchema>;

const strengthFormulaFallback: StrengthFormulaData = {
  overview: {
    title: 'Формула силы',
    subtitle: 'Данные секции временно недоступны.',
    thesis: 'Данные секции временно недоступны.',
    formulaParts: [
      {id: 'fallback-1', label: 'Недоступно', hint: 'Недоступно', tone: 'positive', visualOrder: 1},
      {id: 'fallback-2', label: 'Недоступно', hint: 'Недоступно', tone: 'positive', visualOrder: 2},
      {id: 'fallback-3', label: 'Недоступно', hint: 'Недоступно', tone: 'positive', visualOrder: 3},
      {id: 'fallback-4', label: 'Недоступно', hint: 'Недоступно', tone: 'positive', visualOrder: 4},
      {id: 'fallback-5', label: 'Недоступно', hint: 'Недоступно', tone: 'negative', visualOrder: 5},
    ],
    parameters: [],
    rounding: 'Недоступно',
    logic: 'Недоступно',
  },
  factorTiers: [],
  wavePhases: [],
  bicepsNote: 'Данные секции временно недоступны.',
  warmupStack: [],
  scienceCards: [],
  protocolSteps: [],
  autoregChecklist: {
    before: ['Данные секции временно недоступны.'],
    during: ['Данные секции временно недоступны.'],
    after: ['Данные секции временно недоступны.'],
  },
};

const parsedStrengthFormulaData = StrengthFormulaDataSchema.safeParse(strengthFormulaDataInput);

const runtimeProcess =
  typeof globalThis === 'object' && 'process' in globalThis
    ? (globalThis as {process?: {env?: {NODE_ENV?: string}}}).process
    : undefined;

if (!parsedStrengthFormulaData.success && runtimeProcess?.env?.NODE_ENV !== 'production') {
  console.warn(
    '[strength-formula] Zod validation failed, using fallback data.',
    parsedStrengthFormulaData.error.flatten(),
  );
}

export const strengthFormulaData: StrengthFormulaData = parsedStrengthFormulaData.success
  ? parsedStrengthFormulaData.data
  : strengthFormulaFallback;

export const STRENGTH_FORMULA_OVERVIEW = strengthFormulaData.overview;
export const STRENGTH_FACTOR_TIERS = strengthFormulaData.factorTiers;
export const STRENGTH_WAVE_PHASES = strengthFormulaData.wavePhases;
export const STRENGTH_BICEPS_NOTE = strengthFormulaData.bicepsNote;
export const STRENGTH_WARMUP_STACK = strengthFormulaData.warmupStack;
export const STRENGTH_SCIENCE_CARDS = strengthFormulaData.scienceCards;
export const STRENGTH_PROTOCOL_STEPS = strengthFormulaData.protocolSteps;
export const STRENGTH_AUTOREG_CHECKLIST = strengthFormulaData.autoregChecklist;
