import type { UserData } from '../../../types';
import { SectionBlock } from '../../SectionBlock';
import { SplitCalculationHistory } from '../../split/SplitCalculationHistory';
import { Button } from '../../ui/Button';

interface TrainingCalculationsSectionProps {
  userData: UserData;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onOpenBase: () => void;
  onOpenBreakdown: () => void;
}

/**
 * Контейнеры расчётов на главном экране тренировки: активный расчёт,
 * история и входы в базу/конструктор/разбор. Раньше это жило за «Меню».
 */
export function TrainingCalculationsSection({
  userData,
  onSelect,
  onDelete,
  onCreate,
  onOpenBase,
  onOpenBreakdown,
}: TrainingCalculationsSectionProps) {
  const calculations = userData.splitCalculations ?? [];
  const activeId = userData.activeSplitCalculationId ?? undefined;

  return (
    <SectionBlock num="03" title="Расчёты" variant="apple" className="training-section">
      {calculations.length > 0 ? (
        <SplitCalculationHistory
          calculations={calculations}
          activeId={activeId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ) : (
        <p className="training-calculations__empty">
          Пока один стандартный расчёт. Добавь свой — рассчитаются веса на 8 недель.
        </p>
      )}

      <div className="training-section-actions">
        <Button type="button" onClick={onCreate}>
          + Новый расчёт
        </Button>
        <button type="button" className="training-section-link" onClick={onOpenBase}>
          База силовых
        </button>
        <button type="button" className="training-section-link" onClick={onOpenBreakdown}>
          Разбор
        </button>
      </div>
    </SectionBlock>
  );
}
