interface WeekProgressGridProps {
  currentWeekIdx: number;
}

export function WeekProgressGrid({currentWeekIdx}: WeekProgressGridProps) {
  const weeks = 8;
  const safeWeek = Math.min(weeks - 1, Math.max(0, currentWeekIdx));

  return (
    <div className="week-progress-grid" aria-label="Прогресс по неделям">
      {Array.from({length: weeks}, (_, week) => {
        const done = week < safeWeek;
        const isCurrent = week === safeWeek;
        const state = done ? 'done' : isCurrent ? 'current' : 'upcoming';
        return (
          <span
            key={week}
            className={`week-progress-grid__cell week-progress-grid__cell--${state}`}
            aria-label={`Неделя ${week + 1}`}>
            {week + 1}
          </span>
        );
      })}
    </div>
  );
}