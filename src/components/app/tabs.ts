export const APP_TABS = ['split', 'theory'] as const;

export type AppTab = (typeof APP_TABS)[number];

/**
 * Старый id вкладки «Тренировка». После S2 (2026-11-14) она слита со «Сплитом».
 */
export const LEGACY_TRAINING_TAB = 'training';

/**
 * Старый id вкладки «Калькулятор». После M (2026-11-15) калькулятор стал
 * режимом «Разбор» внутри вкладки «Тренировка».
 */
export const LEGACY_CALCULATOR_TAB = 'calculator';

export function isAppTab(value: string | null): value is AppTab {
  return APP_TABS.some(tab => tab === value);
}

/** Разбирает id вкладки, включая устаревшие, в актуальный. */
export function normalizeTab(value: string | null): AppTab | null {
  if (value === LEGACY_TRAINING_TAB) return 'split';
  if (value === LEGACY_CALCULATOR_TAB) return 'split';
  return isAppTab(value) ? value : null;
}
