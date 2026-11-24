/** Типизированный доступ к данным мышечных карт (docs/muscle-maps/muscle-maps.json). */
import raw from '../../docs/muscle-maps/muscle-maps.json';

export interface StimulusEntry {
  id: string;
  name: string;
  group: string;
  sources: string[];
  anthropometrySensitive: boolean;
  comment: string;
  /** muscleId → степень стимула 0–100. */
  stimulus: Record<string, number>;
}

export interface MuscleMapsData {
  version: string;
  scale: string;
  sourceCodes: Record<string, string>;
  anthropometry: {id: string; label: string; note: string};
  exercises: StimulusEntry[];
}

export const MUSCLE_MAPS = raw as unknown as MuscleMapsData;

/** Метки мышц, которых нет в shared MUSCLE_META (данные из карт, не из расчёта объёма). */
export const MUSCLE_EXTRA_LABELS: Record<string, string> = {
  adductors: 'Приводящие',
};

/** Человекочитаемые метки источников числа стимула. */
export function sourceLabel(code: string): string {
  if (code.startsWith('repo:')) return 'репо';
  if (code.startsWith('research:')) return 'исследование';
  if (code.startsWith('estimate')) return 'оценка';
  if (code.startsWith('conspect:')) return 'конспект';
  if (code.startsWith('anthropometry:')) return 'антропометрия';
  return code;
}

/** Сводная пометка источника по списку codes упражнения. */
export function sourceBadge(codes: string[]): string {
  const hasResearch = codes.some(c => c.startsWith('research:'));
  const hasRepo = codes.some(c => c.startsWith('repo:'));
  const hasEstimate = codes.some(c => c.startsWith('estimate'));
  const hasConspect = codes.some(c => c.startsWith('conspect:'));
  const parts = [hasResearch ? 'исследование' : null, hasRepo ? 'репо' : null, hasEstimate || hasConspect ? 'оценка' : null].filter(Boolean);
  return parts.length ? parts.join(' + ') : 'оценка';
}