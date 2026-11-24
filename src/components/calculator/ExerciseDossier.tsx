import {MuscleMap} from '../MuscleMap';
import {EXERCISE_INSIGHTS} from '../../data/exerciseInsights';

interface ExerciseDossierProps {
  selectedExercise?: string;
}

/**
 * Фаза 5: досье упражнения — карта стимула + инсайты + роль/сравнение/норматив.
 * Обёртка над MuscleMap, чтобы вкладка «Разбор» показывала единый блок разбора.
 */
export function ExerciseDossier({selectedExercise}: ExerciseDossierProps) {
  const insight = selectedExercise
    ? EXERCISE_INSIGHTS[
        Object.keys(EXERCISE_INSIGHTS).find(k => k === selectedExercise) ?? ''
      ]
    : undefined;

  return (
    <div className="pv-dossier">
      {insight ? (
        <div className="pv-dossier__summary">
          <h4 className="pv-dossier__title">Разбор упражнения</h4>
          <p className="pv-dossier__role">{insight.role}</p>
        </div>
      ) : null}
      <MuscleMap selectedExercise={selectedExercise} />
    </div>
  );
}
