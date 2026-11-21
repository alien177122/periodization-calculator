import {useSplitConstructor} from '../../../hooks/useSplitConstructor';
import {SplitCalculationHistory} from '../../split/SplitCalculationHistory';
import {Button} from '../../ui/Button';
import {saveUser} from '../../../utils/api';
import type {UserData} from '../../../types';

interface CalculationsPageProps {
  userData: UserData;
  setUserData: (value: UserData) => void;
  token: string;
  onSaveError?: (message: string) => void;
  onOpenWorkout: () => void;
  onOpenConstructor: () => void;
}

export function CalculationsPage({
  userData,
  setUserData,
  token,
  onSaveError,
  onOpenWorkout,
  onOpenConstructor,
}: CalculationsPageProps) {
  const constructor = useSplitConstructor({
    userData,
    setUserData,
    saveUser,
    token,
    onSaveError,
  });

  const activeId = userData.activeSplitCalculationId ?? undefined;

  function handleStandard() {
    const updated: UserData = {
      ...userData,
      activeSplitId: null,
      activeSplitCalculationId: null,
    };
    setUserData(updated);
    void saveUser(updated, token);
    onOpenWorkout();
  }

  return (
    <div className="training-calculations">
      <button
        type="button"
        className={`training-calculation-card training-calculation-card--standard${!activeId ? ' is-active' : ''}`}
        onClick={handleStandard}>
        <span className="training-calculation-card__eyebrow">Стандарт</span>
        <span className="training-calculation-card__title">Стандартный расчёт</span>
        <span className="training-calculation-card__meta">Базовые 8 недель · 3 дня</span>
      </button>

      {constructor.calculations.length > 0 ? (
        <SplitCalculationHistory
          calculations={constructor.calculations}
          activeId={activeId}
          onSelect={id => {
            constructor.selectCalculation(id);
            onOpenWorkout();
          }}
          onDelete={id => void constructor.deleteCalculation(id)}
        />
      ) : (
        <p className="training-calculations__empty">
          Пока нет расчётов. Добавь новый — посчитаются веса на 8 недель.
        </p>
      )}

      <div className="training-calculations__actions">
        <Button type="button" onClick={onOpenConstructor}>
          + Добавить расчёт
        </Button>
      </div>
    </div>
  );
}