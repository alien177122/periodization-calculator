import {useEffect, useState} from 'react';
import {SHORT_NAMES} from '../../data/exercises';
import type {TrainingExerciseRow} from '../../utils/training';

/** Авто-стоп: таймер не считает бесконечно (решение владельца 2026-11-12). */
export const TIMER_MAX_MS = 10 * 60 * 1000;

/** Текущее время: вынесено из компонента, чтобы не нарушать react-hooks/purity. */
function nowMs(): number {
  return Date.now();
}

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

interface ExerciseTimersProps {
  exercises: TrainingExerciseRow[];
}

/**
 * Индивидуальные таймеры упражнений в выполнении (S3).
 *
 * Счётчика подходов нет: человек сам решает, когда подходить. Тап по чипу
 * запускает таймер, повторный тап останавливает; через 10 минут — авто-стоп.
 */
export function ExerciseTimers({exercises}: ExerciseTimersProps) {
  const [startedAt, setStartedAt] = useState<Record<string, number>>({});
  const [now, setNow] = useState(() => nowMs());

  // Истёкшие таймеры отбрасываются при рендере: без setState в эффекте.
  const activeTimers: Record<string, number> = {};
  for (const [key, start] of Object.entries(startedAt)) {
    if (now - start < TIMER_MAX_MS) activeTimers[key] = start;
  }
  const activeCount = Object.keys(activeTimers).length;

  useEffect(() => {
    if (activeCount === 0) return;
    const interval = window.setInterval(() => setNow(nowMs()), 1000);
    return () => window.clearInterval(interval);
  }, [activeCount]);

  if (exercises.length === 0) return null;

  const toggle = (key: string) => {
    const timestamp = nowMs();
    setNow(timestamp);
    setStartedAt(previous => {
      const previousStart = previous[key];
      const wasRunning =
        previousStart !== undefined && timestamp - previousStart < TIMER_MAX_MS;

      // Заодно чистим истёкшие записи — они больше не отображаются.
      const next: Record<string, number> = {};
      for (const [otherKey, start] of Object.entries(previous)) {
        if (otherKey !== key && timestamp - start < TIMER_MAX_MS) next[otherKey] = start;
      }
      if (!wasRunning) next[key] = timestamp;
      return next;
    });
  };

  return (
    <div className="exercise-timers" aria-label="Таймеры упражнений">
      <p className="exercise-timers__hint">
        Таймер упражнения: тапнул — пошёл. Сам останавливается через 10 минут.
      </p>
      <ul className="exercise-timers__list">
        {exercises.map(exercise => {
          const start = activeTimers[exercise.key];
          const running = start !== undefined;
          const label = SHORT_NAMES[exercise.key] ?? exercise.name;
          return (
            <li key={exercise.key}>
              <button
                type="button"
                className={`exercise-timers__chip${running ? ' is-running' : ''}`}
                aria-pressed={running}
                aria-label={
                  running
                    ? `Остановить таймер: ${exercise.name}`
                    : `Запустить таймер: ${exercise.name}`
                }
                onClick={() => toggle(exercise.key)}>
                <span className="exercise-timers__name">{label}</span>
                <span className="exercise-timers__time u-num">
                  {running ? formatElapsed(now - start) : '▶'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
