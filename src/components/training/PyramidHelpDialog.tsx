import {useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useBodyScrollLock} from '../../hooks/useBodyScrollLock';

const PYRAMID_STEPS = [
  {
    title: 'Вход',
    body: 'Вес и схема из программы (например 100 кг × 4×4). Целевой RPE 7–9.',
  },
  {
    title: 'Нисходящая ↓',
    body: 'Вес ходит в пределах ±3% от целевого (один шаг вверх / один вниз). Пример с 150 кг: 155×3 → 150×4 → 150×4 → 145×5. Лишние подходы держат середину, без второго провала.',
  },
  {
    title: 'Разминка',
    body: 'От топ-веса рабочих подходов: 50%, 65%, 80%, 90% с убыванием повторений. Шаг блинов — из типа упражнения.',
  },
  {
    title: 'Отдых',
    body: '3–5 мин между рабочими. Техника важнее веса; если последний подход с запасом больше 2 повторений — +2,5% в следующем цикле.',
  },
] as const;

export default function PyramidHelpDialog() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Portal to body: .reveal-section keeps transform:translate3d even when visible,
  // so nested position:fixed binds to the tall section and docks off-screen.
  const dialog =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div className="progression-dialog-backdrop" onClick={() => setOpen(false)}>
            <div
              className="progression-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={event => event.stopPropagation()}>
              <header className="progression-dialog__head">
                <div>
                  <p className="progression-dialog__eyebrow">Пирамида нагрузки</p>
                  <h2 className="progression-dialog__title" id={titleId}>
                    Алгоритм подходов
                  </h2>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  className="progression-dialog__close"
                  onClick={() => setOpen(false)}>
                  Закрыть
                </button>
              </header>

              <ol className="progression-dialog__steps">
                {PYRAMID_STEPS.map((step, index) => (
                  <li key={step.title} className="progression-dialog__step">
                    <span className="progression-dialog__step-num">{index + 1}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="progression-dialog__note">
                Расчёты — ориентиры. Корректируйте по технике и RPE в зале.
              </p>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="progression-pyramid-help"
        aria-label="Алгоритм пирамиды нагрузки"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}>
        <span className="progression-pyramid-help__icon" aria-hidden="true">
          △
        </span>
        <span className="progression-pyramid-help__text">Алгоритм</span>
      </button>
      {dialog}
    </>
  );
}
