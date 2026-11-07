import {useCallback, useState} from 'react';
import {EXERCISES} from '../data/exercises.ts';
import type {SavedExercise, UserData} from '../types/index.ts';
import type {CalculationRequestPayload, CalculationSuccessResponse} from '../types/billing.ts';
import {isCalculationLimitError} from '../types/billing.ts';

export interface UseCalculatorStateOptions {
  token: string;
  userName: string;
  userData: UserData | null;
  setUserData: (value: UserData | null) => void;
  saveUser: (data: UserData, token: string) => Promise<{ok: boolean} | void> | void;
  calculate: (
    payload: CalculationRequestPayload,
    token: string,
  ) => Promise<CalculationSuccessResponse>;
  onLimitReached?: () => void;
  onCalculateSuccess?: () => void;
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function toSavedExercise(response: CalculationSuccessResponse): SavedExercise {
  return {
    exerciseKey: response.exerciseKey,
    testWeight: response.testWeight,
    testReps: response.testReps,
    oneRM: response.oneRM,
    date: response.date,
    ...(response.bodyWeight !== undefined ? {bodyWeight: response.bodyWeight} : {}),
  };
}

export function useCalculatorState({
  token,
  userName,
  userData,
  setUserData,
  saveUser,
  calculate,
  onLimitReached,
  onCalculateSuccess,
}: UseCalculatorStateOptions) {
  const [selectedExercise, setSelectedExercise] = useState('bench');
  const [testWeight, setTestWeight] = useState('');
  const [testBodyWeight, setTestBodyWeight] = useState('');
  const [testExtraWeight, setTestExtraWeight] = useState('');
  const [testReps, setTestReps] = useState('');
  const [activeResult, setActiveResult] = useState<SavedExercise | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculateError, setCalculateError] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [pendingLockedResult, setPendingLockedResult] = useState(false);

  function resetInputs() {
    setTestWeight('');
    setTestReps('');
    setTestBodyWeight('');
    setTestExtraWeight('');
  }

  function resetCalculatorState() {
    setActiveResult(null);
    setSelectedExercise('bench');
    resetInputs();
    setCalculateError(null);
    setIsLimitReached(false);
    setPendingLockedResult(false);
  }

  function selectExercise(key: string) {
    setSelectedExercise(key);
    resetInputs();
    setCalculateError(null);
    setPendingLockedResult(false);
  }

  const handleCalculate = useCallback(async () => {
    if (!userData || !token) return;

    const config = EXERCISES[selectedExercise];
    if (!config) return;

    let payload: Omit<CalculationRequestPayload, 'requestId'>;

    if (config.usesBodyWeight || config.isPullup) {
      const bodyWeight = parseFloat(testBodyWeight);
      const extraWeight = parseFloat(testExtraWeight) || 0;
      if (!bodyWeight || bodyWeight < 1) return;

      payload = {
        exerciseKey: selectedExercise,
        testBodyWeight: bodyWeight,
        testExtraWeight: extraWeight,
        testReps: 0,
      };
    } else {
      const weight = parseFloat(testWeight);
      if (!weight || weight < 1) return;

      payload = {
        exerciseKey: selectedExercise,
        testWeight: weight,
        testReps: 0,
      };
    }

    const reps = parseInt(testReps, 10);
    if (!reps || reps < 1) return;
    payload.testReps = reps;

    setIsCalculating(true);
    setCalculateError(null);
    setIsLimitReached(false);
    setPendingLockedResult(false);

    const requestId = createRequestId();

    try {
      const response = await calculate({...payload, requestId}, token);
      const saved = toSavedExercise(response);

      const updated: UserData = {
        ...userData,
        name: userName,
        exercises: [
          ...userData.exercises.filter(exercise => exercise.exerciseKey !== selectedExercise),
          saved,
        ],
      };

      setUserData(updated);
      setActiveResult(saved);
      resetInputs();
      void saveUser(updated, token);
      onCalculateSuccess?.();
    } catch (error) {
      if (isCalculationLimitError(error)) {
        setIsLimitReached(true);
        setPendingLockedResult(true);
        onLimitReached?.();
        return;
      }

      setCalculateError(
        error instanceof Error ? error.message : 'Ошибка расчёта. Попробуй снова.',
      );
    } finally {
      setIsCalculating(false);
    }
  }, [
    calculate,
    onLimitReached,
    onCalculateSuccess,
    saveUser,
    selectedExercise,
    setUserData,
    testBodyWeight,
    testExtraWeight,
    testReps,
    testWeight,
    token,
    userData,
    userName,
  ]);

  function handleDelete(key: string) {
    if (!userData) return;

    const updated: UserData = {
      ...userData,
      exercises: userData.exercises.filter(exercise => exercise.exerciseKey !== key),
    };

    setUserData(updated);
    if (activeResult?.exerciseKey === key) setActiveResult(null);
    void saveUser(updated, token);
  }

  function handleSelectSaved(saved: SavedExercise) {
    setActiveResult(saved);
    setSelectedExercise(saved.exerciseKey);
    setPendingLockedResult(false);
    setCalculateError(null);
  }

  const clearPaywallLock = useCallback(() => {
    setPendingLockedResult(false);
    setIsLimitReached(false);
  }, []);

  return {
    selectedExercise,
    selectExercise,
    testWeight,
    setTestWeight,
    testBodyWeight,
    setTestBodyWeight,
    testExtraWeight,
    setTestExtraWeight,
    testReps,
    setTestReps,
    activeResult,
    isCalculating,
    calculateError,
    isLimitReached,
    pendingLockedResult,
    handleCalculate,
    handleDelete,
    handleSelectSaved,
    resetCalculatorState,
    clearPaywallLock,
  };
}
