import {useSplitConstructor} from '../../../hooks/useSplitConstructor';
import {GlobalExerciseAdder} from '../../split/GlobalExerciseAdder';
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
      <GlobalExerciseAdder
        savedExercises={constructor.profileExercises}
        daysPerWeek={2}
        title="Внести в базу"
        onAddExercise={() => {}}
        onOneRMChange={constructor.setExerciseOneRM}
        profileBaseOnly
      />
    </div>
  );
}