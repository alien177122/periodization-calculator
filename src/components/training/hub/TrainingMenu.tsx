interface TrainingMenuProps {
  workoutName: string;
  calculationsCount: number;
  onOpenWorkout: () => void;
  onOpenCalculations: () => void;
  onOpenBase: () => void;
  onOpenBreakdown: () => void;
}

function pluralCalculations(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} расчёт`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} расчёта`;
  return `${count} расчётов`;
}

export function TrainingMenu({
  workoutName,
  calculationsCount,
  onOpenWorkout,
  onOpenCalculations,
  onOpenBase,
  onOpenBreakdown,
}: TrainingMenuProps) {
  return (
    <div className="training-menu">
      <button type="button" className="training-menu__primary" onClick={onOpenWorkout}>
        <span className="training-menu__primary-eyebrow">Продолжить</span>
        <span className="training-menu__primary-title">Последний расчёт</span>
        <span className="training-menu__primary-meta">{workoutName}</span>
        <span className="training-menu__chevron" aria-hidden="true">›</span>
      </button>

      <div className="training-menu__grid">
        <button type="button" className="training-menu__tile" onClick={onOpenCalculations}>
          <span className="training-menu__tile-title">Расчёты</span>
          <span className="training-menu__tile-meta">{pluralCalculations(calculationsCount)}</span>
        </button>
        <button type="button" className="training-menu__tile" onClick={onOpenBase}>
          <span className="training-menu__tile-title">База силовых</span>
          <span className="training-menu__tile-meta">1ПМ · веса</span>
        </button>
      </div>

      <button type="button" className="training-menu__link" onClick={onOpenBreakdown}>
        Открыть разбор
      </button>
    </div>
  );
}