import type {JournalSession} from '../../types';
import {buildCycleSeries} from '@training/shared/utils/cycles';

interface CycleComparisonProps {
  sessions: JournalSession[];
  exerciseKey: string;
}

export function CycleComparison({sessions, exerciseKey}: CycleComparisonProps) {
  const filtered = sessions.filter(s => s.exerciseKey === exerciseKey);
  const series = buildCycleSeries(filtered);

  if (series.length < 2) {
    return (
      <div className="cycle-comparison cycle-comparison--empty">
        <p>Нужны тесты в двух циклах — запиши тестовый подход.</p>
      </div>
    );
  }

  return (
    <div className="cycle-comparison">
      <div className="cycle-comparison__row">
        {series.map(point => (
          <div key={point.cycle} className="cycle-comparison__cell">
            <div className="cycle-comparison__delta">
              {point.deltaRaw != null ? `${point.deltaRaw > 0 ? '+' : ''}${point.deltaRaw}` : '—'}
            </div>
            <div className="cycle-comparison__values">
              <span className="cycle-comparison__raw">{point.raw}</span>
              {point.adjusted != null ? (
                <span className="cycle-comparison__adjusted">/{point.adjusted}</span>
              ) : (
                <span className="cycle-comparison__no-rpe">без RPE</span>
              )}
            </div>
            <div className="cycle-comparison__label">цикл {point.cycle}</div>
          </div>
        ))}
      </div>
      <p className="cycle-comparison__note">
        Оценка по Epley, не измеренный максимум. Слева — факт, справа — с учётом запаса.
      </p>
    </div>
  );
}