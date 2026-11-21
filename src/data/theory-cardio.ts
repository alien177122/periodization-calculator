export type TheoryCardVariant = 'default' | 'warning' | 'critical'

export type TheoryTextPart =
  | {
      id: string
      kind: 'text'
      text: string
    }
  | {
      id: string
      kind: 'stat'
      text: string
    }

export interface TheoryParagraph {
  id: string
  parts: readonly TheoryTextPart[]
}

export interface TheoryConcept {
  id: string
  title: string
  paragraphs: readonly TheoryParagraph[]
  variant?: TheoryCardVariant
}

const text = (id: string, value: string): TheoryTextPart => ({
  id,
  kind: 'text',
  text: value,
})

const stat = (id: string, value: string): TheoryTextPart => ({
  id,
  kind: 'stat',
  text: value,
})

export const CARDIO_CONCEPTS: readonly TheoryConcept[] = [
  {
    id: 'cardio-steps',
    title: '8 000 шагов — минимальная цель',
    paragraphs: [
      {
        id: 'cardio-steps-risk',
        parts: [
          stat('steps-8000', '~8 000 шагов/день'),
          text('steps-risk-text-1', ' ассоциированы со снижением смертности от всех причин на '),
          stat('steps-risk-51', '51%'),
          text('steps-risk-text-2', ' vs '),
          stat('steps-risk-4000', '~4 000 шагов'),
          text('steps-risk-text-3', '; '),
          stat('steps-risk-12000', '~12 000 шагов'),
          text('steps-risk-text-4', ' — на '),
          stat('steps-risk-65', '65%'),
          text('steps-risk-text-5', '.'),
        ],
      },
      {
        id: 'cardio-steps-continuous',
        parts: [
          text(
            'steps-continuous-text-1',
            'Шагомер показывает цифру; длительное непрерывное движение с умеренным подъёмом пульса даёт больше ',
          ),
          stat('steps-pulse', '~100–120 уд/мин'),
          text('steps-continuous-text-2', '. Цель для новичка: '),
          stat('steps-duration', '30–60 мин'),
          text('steps-continuous-text-3', ' непрерывной ходьбы в день.'),
        ],
      },
    ],
  },
  {
    id: 'cardio-aerobic',
    title: 'Аэробные + координационные нагрузки',
    paragraphs: [
      {
        id: 'cardio-aerobic-sports',
        parts: [
          text(
            'aerobic-sports-text',
            'Теннис и бадминтон одновременно тренируют координацию, выносливость, верх и низ тела.',
          ),
        ],
      },
      {
        id: 'cardio-aerobic-combo',
        parts: [
          text(
            'aerobic-combo-text',
            'Чем сложнее и интенсивнее аэробная активность — тем выше потенциал для улучшения сосудистой функции. Силовая работа тоже полезна, особенно в сочетании с кардио: тезис «силовые не влияют на сосуды» упрощён.',
          ),
        ],
      },
    ],
  },
  {
    id: 'cardio-swim',
    title: 'Плавание — нагрузка без удара на суставы',
    paragraphs: [
      {
        id: 'cardio-swim-load',
        parts: [
          text(
            'swim-load-text',
            'Вода снижает ударную нагрузку на суставы и позвоночник. Оптимально при реабилитации, избыточном весе и низкой начальной тренированности.',
          ),
        ],
      },
      {
        id: 'cardio-swim-volume',
        parts: [
          text('swim-volume-text-1', 'Пример любительского объёма — '),
          stat('swim-volume-1km', '~1 км'),
          text('swim-volume-text-2', ' в спокойном темпе. Хороший вариант для постепенного возвращения к активности.'),
        ],
      },
    ],
  },
  {
    id: 'cardio-run',
    title: 'Бег — даже редкий даёт эффект',
    paragraphs: [
      {
        id: 'cardio-run-dose',
        parts: [
          text('run-dose-text-1', 'Даже нерегулярные короткие пробежки '),
          stat('run-dose-50', '<50 мин'),
          text(
            'run-dose-text-2',
            ', медленный темп ассоциированы с преимуществами для здоровья и долголетия.',
          ),
        ],
      },
      {
        id: 'cardio-run-pace',
        parts: [
          text(
            'run-pace-text',
            'Регулярность решает больше, чем высокая интенсивность. Начинать следует с трусцы, постепенно наращивая время.',
          ),
        ],
      },
    ],
  },
  {
    id: 'cardio-hiit',
    title: 'HIIT — польза для сосудов',
    paragraphs: [
      {
        id: 'cardio-hiit-effect',
        parts: [
          text(
            'hiit-effect-text',
            'Интервальные высокоинтенсивные тренировки улучшают сосудистую функцию через кратковременное повышение пульса и усиление кровотока.',
          ),
        ],
      },
      {
        id: 'cardio-hiit-example',
        parts: [
          text('hiit-example-text-1', 'Пример: спокойный бег '),
          stat('hiit-example-8', '8 км/ч'),
          text('hiit-example-text-2', ' → ускорение до '),
          stat('hiit-example-15', '~15 км/ч'),
          text('hiit-example-text-3', ' на '),
          stat('hiit-example-duration', '1–2 мин'),
          text(
            'hiit-example-text-4',
            ' → восстановление. Только после адаптации к регулярным нагрузкам: резкое начало интервалов опасно.',
          ),
        ],
      },
    ],
  },
  {
    id: 'cardio-overload',
    title: 'Признаки перегрузки — снизь интенсивность',
    variant: 'critical',
    paragraphs: [
      {
        id: 'cardio-overload-symptoms',
        parts: [
          text(
            'overload-symptoms-text',
            'Одышка, не проходящая после отдыха. Боль или давление в груди. Головокружение. Нарушения ритма.',
          ),
        ],
      },
      {
        id: 'cardio-overload-rules',
        parts: [
          text('overload-rules-text-1', 'Усталость '),
          stat('overload-rules-fatigue', '>24–48 ч'),
          text(
            'overload-rules-text-2',
            ' после тренировки. Боль в суставах. Не увеличивай объём и интенсивность одновременно: только один параметр за раз.',
          ),
        ],
      },
    ],
  },
] as const
