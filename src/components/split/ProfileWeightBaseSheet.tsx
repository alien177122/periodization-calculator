import {createPortal} from 'react-dom';
import {useBodyScrollLock} from '../../hooks/useBodyScrollLock.ts';
import {GlobalExerciseAdder} from './GlobalExerciseAdder.tsx';
import type {SavedExercise} from '../../types';

interface ProfileWeightBaseSheetProps {
  open: boolean;
  profileLabel: string;
  savedExercises: SavedExercise[];
  onClose: () => void;
  onOneRMChange: (
    exerciseKey: string,
    oneRM: number,
    testWeight: number,
    testReps: number,
    bodyWeight?: number,
  ) => void;
}

export function ProfileWeightBaseSheet({
  open,
  profileLabel,
  savedExercises,
  onClose,
  onOneRMChange,
}: ProfileWeightBaseSheetProps) {
  useBodyScrollLock(open);
  if (!open) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="split-hub__sheet-backdrop"
        aria-label="Закрыть базу силовых"
        onClick={onClose}
      />
      <div className="split-hub__sheet" role="dialog" aria-labelledby="profile-weight-base-title">
        <div className="split-hub__sheet-head">
          <h3 id="profile-weight-base-title" className="split-hub__sheet-title">
            База силовых · {profileLabel}
          </h3>
          <button type="button" className="split-hub__icon-btn" onClick={onClose}>
            Закрыть
          </button>
        </div>
        <GlobalExerciseAdder
          savedExercises={savedExercises}
          daysPerWeek={2}
          onAddExercise={() => {}}
          onOneRMChange={onOneRMChange}
          profileBaseOnly
        />
      </div>
    </>,
    document.body,
  );
}
