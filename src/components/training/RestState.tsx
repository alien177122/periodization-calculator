import {useId, useRef, useState, type KeyboardEvent} from 'react';
import {TRAINING_DAYS} from '../../data/exercises';
import {SectionBlock} from '../SectionBlock';
import {Button} from '../ui/Button';

interface RestStateProps {
  completedSessions: number;
  completedMicrocycle: number;
  onDismiss: () => void;
}

const REST_FEELINGS = [
  {id: 'ready', label: 'Отлично, готов продолжать', tone: 'green'},
  {id: 'tired', label: 'Нормально, но устал', tone: 'yellow'},
  {id: 'need-rest', label: 'Нужно ещё отдохнуть', tone: 'red'},
] as const;

type RestFeelingId = (typeof REST_FEELINGS)[number]['id'];

export default function RestState({
  completedSessions,
  completedMicrocycle,
  onDismiss,
}: RestStateProps) {
  const feelingLabelId = useId();
  const [feeling, setFeeling] = useState<RestFeelingId | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function moveFeeling(index: number, delta: number) {
    const next = (index + delta + REST_FEELINGS.length) % REST_FEELINGS.length;
    setFeeling(REST_FEELINGS[next].id);
    optionRefs.current[next]?.focus();
  }

  function onFeelingKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      moveFeeling(index, 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveFeeling(index, -1);
    }
  }

  return (
    <SectionBlock num="01" title={`Завершён ${completedMicrocycle}-й микроцикл`}>
      <div className="rest-card">
        <header className="rest-card-head">
          <span className="rest-card-icon" aria-hidden="true">
            &#127881;
          </span>
          <div className="rest-card-head-copy">
            <h3 className="rest-card-title">Праздник! Время отдохнуть</h3>
            <p className="rest-card-subtitle">
              {completedMicrocycle}-й микроцикл из 8 пройден — {completedSessions} тренировок позади
            </p>
          </div>
        </header>
        <div className="rest-card-rec">
          <p className="rest-card-rec-title">Рекомендации на 4–8 дней</p>
          <ul className="rest-card-list">
            <li>Полный отдых от силовых тренировок — дай ЦНС восстановиться</li>
            <li>Поддерживай аэробные нагрузки: бег, плавание, велосипед, ходьба</li>
            <li>Следи за сном (7–9 часов) и питанием (достаточно белка)</li>
            <li>Растяжка и мобильность — без фанатизма, лёгко</li>
          </ul>
        </div>
        <div className="rest-card-question">
          <p className="rest-card-q-title" id={feelingLabelId}>
            Как ты себя чувствуешь?
          </p>
          <div className="rest-card-q-options" role="radiogroup" aria-labelledby={feelingLabelId}>
            {REST_FEELINGS.map((option, index) => {
              const selected = feeling === option.id;
              return (
                <button
                  key={option.id}
                  ref={node => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected || (feeling === null && index === 0) ? 0 : -1}
                  className={`rest-card-q-opt rest-card-q-${option.tone}${selected ? ' is-selected' : ''}`}
                  onClick={() => setFeeling(option.id)}
                  onKeyDown={event => onFeelingKeyDown(event, index)}>
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="rest-card-q-hint">
            Если чувствуешь усталость или боль в суставах — отдохни полные 8 дней. Если всё хорошо —
            4 дня достаточно. Пауза сейчас = прогресс потом.
          </p>
        </div>
        <p className="rest-card-next">
          Следующий микроцикл: <strong>{completedMicrocycle + 1}-й</strong>
          {' · День 1 · '}
          {TRAINING_DAYS[0].name}
        </p>
      </div>
      <div className="rest-card-actions">
        <Button className="calc-test__submit" onClick={onDismiss}>
          Начать следующий микроцикл
        </Button>
      </div>
    </SectionBlock>
  );
}
