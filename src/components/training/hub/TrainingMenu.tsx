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
      <div className="training-menu__grid training-menu__grid--four">
        <button type="button" className="training-menu__tile" onClick={onOpenWorkout}>
          <span className="training-menu__tile-title">Последний расчёт</span>
          <span className="training-menu__tile-meta">{workoutName}</span>
        </button>
        <button type="button" className="training-menu__tile" onClick={onOpenCalculations}>
          <span className="training-menu__tile-title">Расчёты</span>
          <span className="training-menu__tile-meta">{pluralCalculations(calculationsCount)}</span>
        </button>
        <button type="button" className="training-menu__tile" onClick={onOpenBase}>
          <span className="training-menu__tile-title">База силовых</span>
          <span className="training-menu__tile-meta">1ПМ · веса</span>
        </button>
        <button type="button" className="training-menu__tile" onClick={onOpenBreakdown}>
          <span className="training-menu__tile-title">Разбор</span>
          <span className="training-menu__tile-meta">Калькулятор</span>
        </button>
      </div>
    </div>
  );
}