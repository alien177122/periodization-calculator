import {SectionBlock} from '../SectionBlock';
import {Button} from '../ui/Button';

interface DoneStateProps {
  completedSessions: number;
  onReset: () => void;
}

export default function DoneState({completedSessions, onReset}: DoneStateProps) {
  return (
    <SectionBlock num="01" title="Программа завершена" variant="apple" className="training-section">
      <div className="program-complete">
        <div className="program-complete-icon" aria-hidden="true">
          &#127942;
        </div>
        <div className="program-complete-title">8 недель пройдено!</div>
        <div className="program-complete-stat">
          {completedSessions} тренировок · 8 недель · 2 дня
        </div>
        <p className="program-complete-desc">
          Пересчитай 1ПМ по контрольным подходам и начни новый цикл.
        </p>
        <Button style={{marginTop: 20}} onClick={onReset}>
          Начать новый цикл
        </Button>
      </div>
    </SectionBlock>
  );
}
