import {useBlockTimer} from '../../hooks/useBlockTimer';
import {usePhaseTimer, type Phase} from '../../hooks/usePhaseTimer';

function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface BlockTimerProps {
  /** Если переданы фазы — таймер исполняет их по очереди (Phase 5). */
  phases?: Phase[];
  muted?: boolean;
}

export function BlockTimer({phases, muted: mutedProp = false}: BlockTimerProps) {
  const simple = useBlockTimer();
  const phase = usePhaseTimer(phases ?? [], mutedProp);

  if (phases && phases.length > 0) {
    const current = phases[phase.phaseIndex];
    return (
      <div className="block-timer" aria-label="Таймер блока">
        <div className="block-timer__row">
          <span className="block-timer__label">{current?.label ?? 'Блок'}</span>
          <span className="block-timer__value u-num">
            {formatMs(phase.phaseDurationMs - phase.phaseElapsedMs)}
          </span>
          <span className="block-timer__sep">·</span>
          <span className="block-timer__label">Всего</span>
          <span className="block-timer__value u-num">{formatMs(phase.totalElapsedMs)}</span>
        <span className="block-timer__actions">
          <button type="button" className="block-timer__btn" onClick={phase.toggle}>
            {phase.running ? 'Стоп' : 'Старт'}
          </button>
          <button type="button" className="block-timer__btn block-timer__btn--ghost" onClick={phase.reset}>
            Сброс
          </button>
          {phase.done ? <span className="block-timer__done">Готово ✓</span> : null}
        </span>
        </div>
      </div>
    );
  }

  return (
    <div className="block-timer" aria-label="Таймер блока">
      <div className="block-timer__row">
        <span className="block-timer__label">Блок</span>
        <span className="block-timer__value u-num">{formatMs(simple.elapsedMs)}</span>
        <span className="block-timer__sep">·</span>
        <span className="block-timer__label">Сессия</span>
        <span className="block-timer__value u-num">{formatMs(simple.totalMs)}</span>
      <span className="block-timer__actions">
        <button type="button" className="block-timer__btn" onClick={simple.toggle}>
          {simple.running ? 'Стоп' : 'Старт'}
        </button>
        <button type="button" className="block-timer__btn block-timer__btn--ghost" onClick={simple.reset}>
          Сброс
        </button>
        <button
          type="button"
          className="block-timer__btn block-timer__btn--ghost"
          onClick={() => simple.setMuted(!simple.muted)}
          aria-pressed={simple.muted}>
          {simple.muted ? '🔇' : '🔊'}
        </button>
      </span>
      </div>
    </div>
  );
}
