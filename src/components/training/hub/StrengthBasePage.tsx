import {CATALOG_EXERCISES} from '@training/shared/data/exercises';
import {useSplitConstructor} from '../../../hooks/useSplitConstructor';
import {GlobalExerciseAdder} from '../../split/GlobalExerciseAdder';
import {ProfileWeightBaseSheet} from '../../split/ProfileWeightBaseSheet';
import {saveUser} from '../../../utils/api';
import type {UserData} from '../../../types';

interface StrengthBasePageProps {
  userData: UserData;
  setUserData: (value: UserData) => void;
  token: string;
  onSaveError?: (message: string) => void;
}

export function StrengthBasePage({userData, setUserData, token, onSaveError}: StrengthBasePageProps) {
  const constructor = useSplitConstructor({
    userData,
    setUserData,
    saveUser,
    token,
    onSaveError,
  });

  return (
    <div className="training-base">
      <div className="training-base__intro">
        <h2 className="training-base__title">База силовых</h2>
        <p className="training-base__hint">
          Дефолтные веса для новых расчётов. Внеси тестовый подход — 1ПМ посчитается автоматически.
        </p>
      </div>

      <GlobalExerciseAdder
        savedExercises={constructor.profileExercises}
        daysPerWeek={2}
        title="Внести в базу"
        onAddExercise={() => {}}
        onOneRMChange={constructor.setExerciseOneRM}
        profileBaseOnly
      />

      {constructor.profileExercises.length > 0 ? (
        <ul className="training-base__list">
          {constructor.profileExercises.map(ex => (
            <li key={ex.exerciseKey} className="training-base__row">
              <span className="training-base__name">
                {CATALOG_EXERCISES[ex.exerciseKey]?.name ?? ex.exerciseKey}
              </span>
              <span className="training-base__meta">
                {ex.testWeight} × {ex.testReps}
              </span>
              <strong className="training-base__one-rm">{ex.oneRM} кг</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="training-base__empty">Пока пусто. Добавь упражнение выше.</p>
      )}

      <ProfileWeightBaseSheet
        open={constructor.weightBaseOpen}
        profileLabel="профиля"
        savedExercises={constructor.profileExercises}
        onClose={() => constructor.setWeightBaseOpen(false)}
        onOneRMChange={constructor.setExerciseOneRM}
      />
    </div>
  );
}