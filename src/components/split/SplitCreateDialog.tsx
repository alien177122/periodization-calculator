import {useState} from 'react';
import {AppSheet} from '../ui/AppSheet.tsx';

export interface SplitCalculationRow {
  id: string;
  name: string;
  daysPerWeek: 2 | 3 | 4;
  calculationCount: number;
  isActive: boolean;
}

interface SplitCreateDialogProps {
  open: boolean;
  profileCalculationCount: number;
  rows: SplitCalculationRow[];
  onClose: () => void;
  onSelectSplit: (id: string) => void;
  onCreate: (name: string, daysPerWeek: 2 | 3 | 4) => void;
}

function calculationsLabel(count: number): string {
  if (count === 0) return 'без расчётов';
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} расчёт`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} расчёта`;
  return `${count} расчётов`;
}

function daysLabel(days: 2 | 3 | 4): string {
  return `${days} дня`;
}

const CREATE_DETENTS = ['medium', 'large'] as const;

export function SplitCreateDialog({
  open,
  profileCalculationCount,
  rows,
  onClose,
  onSelectSplit,
  onCreate,
}: SplitCreateDialogProps) {
  /* Диалог ремоунтится по ключу при каждом открытии (см. SplitConstructorTab):
     состояние формы (имя «Сплит N», 3 дня) задаётся один раз при инициализации. */
  const [name, setName] = useState<string>(() => `Сплит ${rows.length + 1}`);
  const [daysPerWeek, setDaysPerWeek] = useState<2 | 3 | 4>(3);

  const submitName = name.trim().length > 0 ? name.trim() : 'Мой сплит';

  return (
    <AppSheet
      open={open}
      onClose={onClose}
      title="Создание сплита"
      detents={CREATE_DETENTS}
      initialDetent="large">
      <div className="split-create-dialog">
        <p className="split-create-dialog__hint">
          Расчётов у профиля: {profileCalculationCount}. Создайте новый сплит или откройте уже
          посчитанный.
        </p>

        <form
          className="split-create-dialog__form"
          onSubmit={event => {
            event.preventDefault();
            onCreate(submitName, daysPerWeek);
          }}>
          <div className="split-create-dialog__field">
            <label className="split-create-dialog__label" htmlFor="split-create-dialog-name">
              Название сплита
            </label>
            <input
              id="split-create-dialog-name"
              className="split-toolbar__input"
              type="text"
              maxLength={40}
              placeholder="Мой сплит"
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </div>
          <div className="split-create-dialog__field">
            <span className="split-create-dialog__label" id="split-create-dialog-days-label">
              Дней в неделю
            </span>
            <div
              className="split-segment"
              role="radiogroup"
              aria-labelledby="split-create-dialog-days-label">
              {([2, 3, 4] as const).map(days => (
                <button
                  key={days}
                  type="button"
                  role="radio"
                  className="split-segment__btn"
                  aria-checked={daysPerWeek === days}
                  onClick={() => setDaysPerWeek(days)}>
                  {days} дня
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn calc-test__submit split-create-dialog__submit">
            Создать сплит
          </button>
        </form>

        <div className="split-create-dialog__block">
          <h4 className="split-create-dialog__block-title">Имеющиеся расчёты</h4>
          <ul className="split-create-dialog__list">
            {rows.map(row => (
              <li key={row.id} className="split-create-dialog__item">
                <button
                  type="button"
                  className={`split-create-dialog__row${row.isActive ? ' is-active' : ''}`}
                  onClick={() => onSelectSplit(row.id)}>
                  <span className="split-create-dialog__row-title">
                    {row.name}
                    {row.isActive ? (
                      <span className="split-create-dialog__row-check" aria-hidden="true">
                        {' '}
                        ✓
                      </span>
                    ) : null}
                  </span>
                  <span className="split-create-dialog__row-meta">
                    {daysLabel(row.daysPerWeek)} · {calculationsLabel(row.calculationCount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppSheet>
  );
}
