/**
 * LEARNING_TRACK — единый маршрут обучения (этап L2, docs/lectures-copy-plan-2026-11-10.md).
 *
 * Основа — selfstudy/content/learning-path.md (15 тем, уровни 🟢🟡🔴, граф зависимостей).
 * Правила этапа: только ссылки на существующие id — темы Теории (chapterId/group/topicId)
 * и статьи самоучителя (буквы A–O). Никаких копий текстов; id тем не меняются.
 * Инварианты: THEORY_CHAPTERS = 10, THEORY_READING_ARTICLES = 3, статьи A–O = 15.
 */
import type {LectureChapterId} from './theory.ts';
import {LECTURE_CHAPTER_GROUPS} from './theory.ts';

/** Публичное имя для UI: главы, к которым можно привязать шаг маршрута. */
export type LearningChapterId = LectureChapterId;

export type LearningStepLevel = 'base' | 'mid' | 'deep';
export type LearningStepPhase = 'month1' | 'month2' | 'health';
export type LearningArticleId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O';

export interface LearningTopicRef {
  chapterId: LearningChapterId;
  groupId: string;
  topicId: string;
}

export interface LearningTrackStep {
  id: string;
  kind: 'topic' | 'article';
  title: string;
  level: LearningStepLevel;
  phase: LearningStepPhase;
  /** Позиция в общем порядке маршрута (1–15, как в learning-path.md). */
  order: number;
  /** id шагов, которые надо пройти до этого. */
  requires: string[];
  /** Ближайшая тема Теории (связь «лекция → действие», этап L3). */
  topicRef?: LearningTopicRef;
  /** Буква статьи самоучителя. */
  articleId?: LearningArticleId;
}

export const LEARNING_ARTICLES: Readonly<Record<LearningArticleId, string>> = {
  A: 'A-otkaz-rir-poterya-skorosti',
  B: 'B-gspg-svobodnyy-testosteron',
  C: 'C-most-nervnaya-sistema',
  D: 'D-pochemu-god-a-ne-trenirovka',
  E: 'E-obem-ubuvayushchaya-otdacha',
  F: 'F-son-glavnaya-vosstanovleniya',
  G: 'G-plato-periodizaciya',
  H: 'H-chastota-split-fullbody',
  I: 'I-rpe-avtoregulyaciya',
  J: 'J-volokna-genetika',
  K: 'K-pitanie-massa-sushka',
  L: 'L-insulinorezistentnost',
  M: 'M-sosudy-gemodinamika',
  N: 'N-kogda-est-cirkadnye-ritmy',
  O: 'O-farmakologiya-serdce',
};

/** Порядок и связи — дословно из learning-path.md (§Маршрут новичка/продолжающего/здоровья). */
export const LEARNING_TRACK: readonly LearningTrackStep[] = [
  {
    id: 'lp-01-volume',
    kind: 'article',
    title: 'Объём и интенсивность — база',
    level: 'base',
    phase: 'month1',
    order: 1,
    requires: [],
    articleId: 'E',
    topicRef: {chapterId: 'basics', groupId: 'week-in-app', topicId: 'volume-colors'},
  },
  {
    id: 'lp-02-rir',
    kind: 'article',
    title: 'Отказ, RIR и потеря скорости',
    level: 'base',
    phase: 'month1',
    order: 2,
    requires: ['lp-01-volume'],
    articleId: 'A',
    topicRef: {chapterId: 'basics', groupId: 'effort', topicId: 'rpe'},
  },
  {
    id: 'lp-03-year-horizon',
    kind: 'article',
    title: 'Почему год, а не тренировка',
    level: 'base',
    phase: 'month1',
    order: 3,
    requires: ['lp-02-rir'],
    articleId: 'D',
    topicRef: {chapterId: 'basics', groupId: 'progression', topicId: 'overload'},
  },
  {
    id: 'lp-04-sleep',
    kind: 'article',
    title: 'Сон и восстановление',
    level: 'base',
    phase: 'month1',
    order: 4,
    requires: [],
    articleId: 'F',
    topicRef: {chapterId: 'late-dinner', groupId: 'melatonin-glucose', topicId: 'antagonism'},
  },
  {
    id: 'lp-05-stress-nerves',
    kind: 'article',
    title: 'Стресс и нервная система',
    level: 'mid',
    phase: 'month1',
    order: 5,
    requires: ['lp-04-sleep'],
    articleId: 'C',
  },
  {
    id: 'lp-06-periodization',
    kind: 'article',
    title: 'Периодизация и плато',
    level: 'mid',
    phase: 'month1',
    order: 6,
    requires: ['lp-01-volume', 'lp-02-rir'],
    articleId: 'G',
    topicRef: {chapterId: 'basics', groupId: 'progression', topicId: 'wave'},
  },
  {
    id: 'lp-07-frequency',
    kind: 'article',
    title: 'Частота, сплит и фуллбоди',
    level: 'mid',
    phase: 'month2',
    order: 7,
    requires: ['lp-02-rir', 'lp-06-periodization'],
    articleId: 'H',
  },
  {
    id: 'lp-08-autoregulation',
    kind: 'article',
    title: 'Авторегуляция и RPE',
    level: 'mid',
    phase: 'month2',
    order: 8,
    requires: ['lp-02-rir'],
    articleId: 'I',
    topicRef: {chapterId: 'specs', groupId: 'rpe-scale', topicId: 'rpe-reserve'},
  },
  {
    id: 'lp-09-fibers',
    kind: 'article',
    title: 'Типы волокон и генетика',
    level: 'deep',
    phase: 'month2',
    order: 9,
    requires: ['lp-02-rir', 'lp-08-autoregulation'],
    articleId: 'J',
  },
  {
    id: 'lp-10-nutrition-mass',
    kind: 'article',
    title: 'Питание для массы и сушки',
    level: 'mid',
    phase: 'month2',
    order: 10,
    requires: ['lp-02-rir', 'lp-09-fibers'],
    articleId: 'K',
  },
  {
    id: 'lp-11-insulin',
    kind: 'article',
    title: 'Метаболизм и инсулинорезистентность',
    level: 'base',
    phase: 'health',
    order: 11,
    requires: [],
    articleId: 'L',
    topicRef: {chapterId: 'diabetes-habits', groupId: 'habits', topicId: 'sedentary-glut4'},
  },
  {
    id: 'lp-12-vessels',
    kind: 'article',
    title: 'Сосуды и атеросклероз',
    level: 'mid',
    phase: 'health',
    order: 12,
    requires: ['lp-11-insulin'],
    articleId: 'M',
    topicRef: {chapterId: 'cardio', groupId: 'wall-blood-pressure', topicId: 'lipids-inflammation'},
  },
  {
    id: 'lp-13-circadian',
    kind: 'article',
    title: 'Питание и циркадные ритмы',
    level: 'mid',
    phase: 'health',
    order: 13,
    requires: ['lp-11-insulin'],
    articleId: 'N',
    topicRef: {chapterId: 'late-dinner', groupId: 'chronotypes', topicId: 'sleep-clock'},
  },
  {
    id: 'lp-14-shbg',
    kind: 'article',
    title: 'ГСПГ и тестостерон',
    level: 'deep',
    phase: 'health',
    order: 14,
    requires: ['lp-05-stress-nerves', 'lp-11-insulin'],
    articleId: 'B',
  },
  {
    id: 'lp-15-pharma-heart',
    kind: 'article',
    title: 'Фармакология и сердце',
    level: 'deep',
    phase: 'health',
    order: 15,
    requires: ['lp-12-vessels', 'lp-14-shbg'],
    articleId: 'O',
  },
];

/** id всех шагов (для проверки requires и для UI). */
export const LEARNING_TRACK_IDS: readonly string[] = LEARNING_TRACK.map(step => step.id);

/** Шаг по id, либо undefined. */
export function getLearningStep(id: string): LearningTrackStep | undefined {
  return LEARNING_TRACK.find(step => step.id === id);
}

/**
 * Проверка доступности шага: все requires имеют отметку checked = 'ok'
 * (прочитанное без самопроверки предпосылки не открывает следующий шаг —
 * по правилу learning-path «не переходить, пока не пройдены темы со стрелкой "до"»).
 */
export function isLearningStepUnlocked(
  step: LearningTrackStep,
  progress: Readonly<Record<string, {read: boolean; checked?: 'ok' | 'retry'}>>,
): boolean {
  return step.requires.every(requiredId => progress[requiredId]?.checked === 'ok');
}

/** Следующий шаг трека: первый заблокированный по порядку, либо undefined (всё пройдено). */
export function nextLearningStep(
  progress: Readonly<Record<string, {read: boolean; checked?: 'ok' | 'retry'}>>,
): LearningTrackStep | undefined {
  return LEARNING_TRACK.find(step => !isLearningStepUnlocked(step, progress));
}

/**
 * Сводка по треку: сколько шагов пройдено (checked = 'ok'), сколько всего,
 * сколько прочитано без самопроверки.
 */
export function learningTrackStats(
  progress: Readonly<Record<string, {read: boolean; checked?: 'ok' | 'retry'}>>,
): {total: number; done: number; read: number} {
  const total = LEARNING_TRACK.length;
  let done = 0;
  let read = 0;
  for (const step of LEARNING_TRACK) {
    const item = progress[step.id];
    if (item?.checked === 'ok') done += 1;
    else if (item?.read) read += 1;
  }
  return {total, done, read};
}

/** Все группы лекций по главам — для валидации topicRef (tests + L3-навигация). */
export function groupsOfChapter(chapterId: LearningChapterId) {
  return LECTURE_CHAPTER_GROUPS[chapterId] ?? [];
}
