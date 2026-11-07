import type {ChapterId, TheoryChapterMeta, TheoryTopicKind} from '../types/theory';

/**
 * Static metadata for the 10 chapters of the Theory tab.
 * Kept data-only so component modules can stay single-purpose.
 */
export const THEORY_CHAPTERS = [
  {
    id: 'basics',
    kind: 'chapter',
    num: '01',
    title: 'Основы',
    cardTitle: 'Основы тренировки',
    panelTitle: 'Основы тренировки',
    summary: '1ПМ, прогрессия, fractional подходы и как устроен 8-недельный план.',
    accentVar: '--ta-sec-01',
    tintVar: '--ta-sec-01-tint',
  },
  {
    id: 'mtor',
    kind: 'chapter',
    num: '02',
    title: 'mTOR',
    cardTitle: 'mTOR и рост',
    panelTitle: 'mTOR и анаболический отклик',
    summary: 'Как нагрузка, аминокислоты и энергия складываются в сигнал роста.',
    accentVar: '--ta-sec-02',
    tintVar: '--ta-sec-02-tint',
  },
  {
    id: 'tiers',
    kind: 'chapter',
    num: '03',
    title: 'Tier List',
    cardTitle: 'Tier List добавок',
    panelTitle: 'Tier List добавок',
    summary: 'Какие добавки работают почти всегда, какие — иногда, а на какие не стоит тратиться.',
    accentVar: '--ta-sec-03',
    tintVar: '--ta-sec-03-tint',
  },
  {
    id: 'top3',
    kind: 'chapter',
    num: '04',
    title: 'Топ-3',
    cardTitle: 'Топ-3 добавки',
    panelTitle: 'Топ-3, если выбирать',
    summary: 'Минимальный набор для силы, концентрации и восстановления.',
    accentVar: '--ta-sec-04',
    tintVar: '--ta-sec-04-tint',
  },
  {
    id: 'specs',
    kind: 'chapter',
    num: '05',
    title: '%ПМ + RPE',
    cardTitle: 'Интенсивность и RPE',
    panelTitle: 'Интенсивность и RPE',
    summary: 'Две шкалы, которые держат тренировку в рабочей зоне и показывают, насколько тяжело дался подход.',
    accentVar: '--ta-sec-05',
    tintVar: '--ta-sec-05-tint',
  },
  {
    id: 'tendons',
    kind: 'chapter',
    num: '06',
    title: 'Сухожилия',
    cardTitle: 'Сухожилия',
    panelTitle: 'Протокол укрепления сухожилий',
    summary:
      'Зона деформации 4,5–6,5%, изометрия 3–6 с с тяжёлым весом и дозировка протокола.',
    accentVar: '--ta-sec-06',
    tintVar: '--ta-sec-06-tint',
  },
  {
    id: 'cardio',
    kind: 'chapter',
    num: '07',
    title: 'Кардио',
    cardTitle: 'Кардио и сосуды',
    panelTitle: 'Кардио и сосудистое здоровье',
    summary: 'Ходьба, бег, плавание и интервалы для здоровья сосудов.',
    accentVar: '--ta-sec-07',
    tintVar: '--ta-sec-07-tint',
  },
  {
    id: 'mechanics',
    kind: 'chapter',
    num: '08',
    title: 'Механика',
    cardTitle: 'Механика нагрузки',
    panelTitle: 'Механика важнее мотивации',
    summary: 'Почему один и тот же вес ощущается по-разному: рычаги и позиция.',
    accentVar: '--ta-sec-08',
    tintVar: '--ta-sec-08-tint',
  },
  {
    id: 'strength',
    kind: 'chapter',
    num: '09',
    title: 'Формула силы',
    cardTitle: 'Формула силы',
    panelTitle: 'Формула силы',
    summary: 'Что тренировать в первую очередь, как вести нагрузку волной и где остановить усталость.',
    accentVar: '--ta-sec-09',
    tintVar: '--ta-sec-09-tint',
  },
  {
    id: 'progression',
    kind: 'chapter',
    num: '10',
    title: 'Прогрессия 2.0',
    cardTitle: 'Прогрессия 2.0',
    panelTitle: 'Прогрессия 2.0',
    summary: 'Как управлять нагрузкой: циклы, модели, научная база и специальные методы.',
    accentVar: '--ta-sec-10',
    tintVar: '--ta-sec-10-tint',
  },
] as const satisfies readonly TheoryChapterMeta[];

export const THEORY_READING_ARTICLES = [
  {
    id: 'diabetes-habits',
    kind: 'reading',
    num: 'Статья',
    title: 'Привычки и диабет',
    cardTitle: 'Пять привычек к диабету',
    panelTitle: 'Пять привычек, которые ведут к диабету',
    summary: 'GLUT4, жидкие калории, недосып и набор веса — конспект клинического разбора.',
    accentVar: '--ta-sec-07',
    tintVar: '--ta-sec-07-tint',
  },
  {
    id: 'late-dinner',
    kind: 'reading',
    num: 'Статья',
    title: 'Еда на ночь',
    cardTitle: 'Почему вредно есть на ночь',
    panelTitle: 'Почему вредно есть на ночь',
    summary: 'Мелатонин и инсулин, хронотипы, ночной пульс и правило 3–4 часов до сна.',
    accentVar: '--ta-sec-05',
    tintVar: '--ta-sec-05-tint',
  },
  {
    id: 'anabolic-vessels',
    kind: 'reading',
    num: 'Статья',
    title: 'Анаболики и сосуды',
    cardTitle: 'Что анаболики делают с сосудами',
    panelTitle: 'Что анаболики делают с сосудами',
    summary: 'Курсы AAS, оксидативный стресс, эстрадиол, липкий эндотелий и рост стенки артерии.',
    accentVar: '--ta-sec-09',
    tintVar: '--ta-sec-09-tint',
  },
] as const satisfies readonly TheoryChapterMeta[];

export const THEORY_TOPICS = [...THEORY_CHAPTERS, ...THEORY_READING_ARTICLES];

export const THEORY_CHAPTER_ALIASES: Readonly<Record<string, ChapterId>> = {
  tables: 'specs',
  tendon: 'tendons',
  formula: 'strength',
  progression2: 'progression',
};

export const THEORY_CHAPTER_IDS = THEORY_TOPICS.map(topic => topic.id);

export function isChapterId(value: string | null): value is ChapterId {
  return Boolean(value && THEORY_CHAPTER_IDS.includes(value as ChapterId));
}

export function normalizeChapterId(value: string | null): ChapterId | null {
  if (isChapterId(value)) return value;
  return value ? (THEORY_CHAPTER_ALIASES[value] ?? null) : null;
}

export function getTheoryChapter(id: ChapterId): TheoryChapterMeta {
  return THEORY_TOPICS.find(topic => topic.id === id) ?? THEORY_CHAPTERS[0];
}

export function isReadingArticle(id: ChapterId): boolean {
  return getTheoryChapter(id).kind === 'reading';
}

export type {ChapterId, TheoryChapterMeta, TheoryTopicKind};
