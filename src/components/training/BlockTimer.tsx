import {useBlockTimer} from '../../hooks/useBlockTimer';

function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function BlockTimer() {
  const {running, elapsedMs, totalMs, muted, toggle, reset, setMuted} = useBlockTimer();

  return (
    <div className="block-timer" aria-label="Таймер блока">
      <div className="block-timer__row">
        <span className="block-timer__label">Блок</span>
        <span className="block-timer__value u-num">{formatMs(elapsedMs)}</span>
        <span className="block-timer__sep">·</span>
        <span className="block-timer__label">Сессия</span>
        <span className="block-timer__value u-num">{formatMs(totalMs)}</span>
      </div>
      <div className="block-timer__actions">
        <button type="button" className="block-timer__btn" onClick={toggle}>
          {running ? 'Стоп' : 'Старт'}
        </button>
        <button type="button" className="block-timer__btn block-timer__btn--ghost" onClick={reset}>
          Сброс
        </button>
        <button
          type="button"
          className="block-timer__btn block-timer__btn--ghost"
          onClick={() => setMuted(!muted)}
          aria-pressed={muted}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}
