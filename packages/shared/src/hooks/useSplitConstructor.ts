import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {CATALOG_EXERCISES} from '../data/exercises.ts';
import type {CustomSplit, SavedExercise, SplitCalculation, UserData} from '../types/index.ts';
import type {TrainingDayDef} from '../types/index.ts';

import {
  buildDayPreview,
  createDefaultSplit,
  mergeToTwoDays,
  validateSplit,
  migrateToCustomExercises,
} from '../utils/split-constructor.ts';
import {
  applyToggleCompletedDay,
  applyToggleCompletedWeek,
  isWeekEffectivelyDone,
} from '../utils/split-progress.ts';
import {resolveSavedSplitSelection} from '../utils/split-selection.ts';

export interface UseSplitConstructorOptions {
  userData: UserData;
  setUserData: (value: UserData) => void;
  saveUser: (data: UserData, token: string) => Promise<{ok: boolean; error?: string} | void>;
  token: string;
  initialSplitId?: string | null;
  onSplitIdChange?: (id: string | null) => void;
  onSaveError?: (message: string) => void;
}

function cloneSplit(split: CustomSplit): CustomSplit {
  return migrateToCustomExercises({
    ...split,
    days: split.days.map(day => ({...day, muscles: [...day.muscles]})),
  });
}

export function useSplitConstructor({
  userData,
  setUserData,
  saveUser,
  token,
  initialSplitId,
  onSplitIdChange,
  onSaveError,
}: UseSplitConstructorOptions) {
  const userDataRef = useRef(userData);
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  const savedSplits = useMemo(() => userData.splits ?? [], [userData.splits]);
  const activeSplitId = userData.activeSplitId ?? null;
  const calculations = useMemo(() => {
    const stored = userData.splitCalculations ?? [];
    if (stored.length > 0) return stored;

    const legacySplit = savedSplits.find(split => split.id === activeSplitId) ?? savedSplits[0];
    const hasLegacyProgress =
      (legacySplit?.completedWeeks?.length ?? 0) > 0 ||
      (legacySplit?.completedDays?.length ?? 0) > 0;
    if (!legacySplit || !hasLegacyProgress) return [];

    return [
      {
        id: `legacy-${legacySplit.id}`,
        calculatedAt: legacySplit.updatedAt,
        split: cloneSplit(legacySplit),
        exercises: userData.exercises.map(exercise => ({...exercise})),
      },
    ];
  }, [activeSplitId, savedSplits, userData.exercises, userData.splitCalculations]);
  const [isDraftingNewSplit, setIsDraftingNewSplit] = useState(false);
  const activeCalculation = isDraftingNewSplit
    ? undefined
    : (calculations.find(entry => entry.id === userData.activeSplitCalculationId) ??
      calculations[0]);
  const isEditingCalculation =
    activeCalculation !== undefined && activeCalculation.id === userData.activeSplitCalculationId;

  const resolveSavedSplit = useCallback(
    (preferredId?: string | null): CustomSplit | undefined =>
      resolveSavedSplitSelection(savedSplits, preferredId, activeSplitId),
    [activeSplitId, savedSplits],
  );

  const [draft, setDraft] = useState<CustomSplit>(() => {
    const existing = resolveSavedSplit(initialSplitId);
    return existing ? cloneSplit(existing) : migrateToCustomExercises(createDefaultSplit());
  });
  const [previewWeek, setPreviewWeek] = useState(0);

  useEffect(() => {
    const found = resolveSavedSplit(initialSplitId);
    if (!found) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setDraft(current => {
        const isUnsavedDraft = !savedSplits.some(split => split.id === current.id);
        if (isUnsavedDraft && current.id !== found.id) return current;
        if (current.id !== found.id) return cloneSplit(found);
        // Prefer newer saved snapshot (login reload / concurrent persist) without
        // clobbering in-progress local edits that share the same updatedAt.
        if (found.updatedAt > current.updatedAt) return cloneSplit(found);
        return current;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [initialSplitId, resolveSavedSplit, savedSplits]);

  const validationError = useMemo(() => validateSplit(draft), [draft]);

  const previewSplit = activeCalculation?.split ?? draft;
  const previewExercises = activeCalculation?.exercises ?? userData.exercises;

  const dayPreviews = useMemo(() => {
    return previewSplit.days.map(day => {
      const exercises = buildDayPreview({
        split: previewSplit,
        dayNumber: day.dayNumber,
        weekIndex: previewWeek,
        savedExercises: previewExercises,
      });
      const dayDef: TrainingDayDef = {
        dayNumber: day.dayNumber,
        name: day.label ?? `День ${day.dayNumber}`,
        exerciseKeys: exercises.map(row => row.key),
      };
      return {day, dayDef, exercises};
    });
  }, [previewExercises, previewSplit, previewWeek]);

  const updateDraft = useCallback((patch: Partial<CustomSplit>) => {
    setDraft(current => ({...current, ...patch, updatedAt: new Date().toISOString()}));
  }, []);

  const setDaysPerWeek = useCallback((daysPerWeek: 2 | 3) => {
    setDraft(current => {
      const customExercises = {...(current.customExercisesByDay ?? {})};

      if (daysPerWeek === 2) {
        const day2List = customExercises[2] ?? [];
        const day3List = customExercises[3] ?? [];
        const merged = [...day2List];
        for (const key of day3List) {
          if (!merged.includes(key)) {
            merged.push(key);
          }
        }
        customExercises[2] = merged;
        delete customExercises[3];
      } else {
        if (!customExercises[3]) {
          customExercises[3] = [];
        }
      }

      const days = Array.from({length: daysPerWeek}, (_, i) => ({
        dayNumber: (i + 1) as 1 | 2 | 3,
        muscles: [],
      }));

      return {
        ...current,
        daysPerWeek,
        days,
        customExercisesByDay: customExercises,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const saveSplit = useCallback(async () => {
    const error = validateSplit(draft);
    if (error) {
      onSaveError?.(error);
      return;
    }

    const nextSplits = [
      ...savedSplits.filter(split => split.id !== draft.id),
      {...draft, updatedAt: new Date().toISOString()},
    ];

    const updated: UserData = {
      ...userData,
      splits: nextSplits,
      activeSplitId: draft.id,
    };

    setUserData(updated);
    onSplitIdChange?.(draft.id);

    try {
      const result = await saveUser(updated, token);
      if (result && 'ok' in result && !result.ok) {
        const errMsg =
          'error' in result && typeof result.error === 'string' ? result.error : 'Failed to save';
        throw new Error(errMsg);
      }
    } catch (e) {
      console.error('saveSplit error:', e);
      const isNetworkError =
        e instanceof Error &&
        (e.message.toLowerCase().includes('fetch') ||
          e.message.toLowerCase().includes('network') ||
          e.message.toLowerCase().includes('load') ||
          e.message.toLowerCase().includes('http') ||
          e.message.toLowerCase().includes('status') ||
          e.message.toLowerCase().includes('сесси') ||
          e.message.toLowerCase().includes('соедине'));
      if (!isNetworkError) {
        onSaveError?.(
          e instanceof Error && e.message && e.message !== 'Failed to save'
            ? `Не удалось сохранить сплит: ${e.message}`
            : 'Не удалось сохранить сплит',
        );
      } else {
        console.warn('Network error during saveSplit (changes saved locally):', e);
      }
    }
  }, [draft, onSaveError, onSplitIdChange, saveUser, savedSplits, setUserData, token, userData]);

  const calculateSplit = useCallback(async (): Promise<string | null> => {
    const error = validateSplit(draft);
    if (error) {
      onSaveError?.(error);
      return null;
    }

    const calculatedAt = new Date().toISOString();
    const savedDraft = cloneSplit({...draft, updatedAt: calculatedAt});
    const snapshot = cloneSplit({
      ...savedDraft,
      completedWeeks: undefined,
      completedDays: undefined,
    });
    const isUpdatingCalculation =
      !isDraftingNewSplit &&
      activeCalculation !== undefined &&
      activeCalculation.id === userData.activeSplitCalculationId;
    const calculation: SplitCalculation = {
      id: isUpdatingCalculation ? activeCalculation.id : crypto.randomUUID(),
      calculatedAt,
      split: snapshot,
      exercises: userData.exercises.map(exercise => ({...exercise})),
    };
    const updated: UserData = {
      ...userData,
      splits: [...savedSplits.filter(split => split.id !== savedDraft.id), savedDraft],
      activeSplitId: savedDraft.id,
      splitCalculations: [
        calculation,
        ...calculations.filter(entry => entry.id !== calculation.id),
      ].slice(0, 50),
      activeSplitCalculationId: calculation.id,
    };

    setIsDraftingNewSplit(false);
    setDraft(savedDraft);
    setPreviewWeek(0);
    setUserData(updated);
    onSplitIdChange?.(savedDraft.id);

    try {
      const result = await saveUser(updated, token);
      if (result && 'ok' in result && !result.ok) {
        throw new Error(
          'error' in result && typeof result.error === 'string' ? result.error : 'Failed to save',
        );
      }
      return calculation.id;
    } catch (error_) {
      onSaveError?.(
        error_ instanceof Error && error_.message !== 'Failed to save'
          ? `Не удалось сохранить расчёт: ${error_.message}`
          : 'Не удалось сохранить расчёт',
      );
      return null;
    }
  }, [
    activeCalculation,
    calculations,
    draft,
    onSaveError,
    onSplitIdChange,
    saveUser,
    savedSplits,
    setUserData,
    token,
    userData,
    isDraftingNewSplit,
  ]);

  const selectCalculation = useCallback(
    (id: string) => {
      const calculation = calculations.find(entry => entry.id === id);
      if (!calculation) return;

      setIsDraftingNewSplit(false);
      const nextWeek = Array.from({length: 8}, (_, index) => index).find(
        week => !isWeekEffectivelyDone(calculation.split, week),
      );
      const updated: UserData = {
        ...userData,
        activeSplitId: calculation.split.id,
        splitCalculations: calculations,
        activeSplitCalculationId: calculation.id,
      };

      setDraft(cloneSplit(calculation.split));
      setPreviewWeek(nextWeek ?? 7);
      setUserData(updated);
      onSplitIdChange?.(calculation.split.id);
      void saveUser(updated, token);
    },
    [calculations, onSplitIdChange, saveUser, setUserData, token, userData],
  );

  const deleteCalculation = useCallback(
    async (id: string) => {
      const calculation = calculations.find(entry => entry.id === id);
      if (!calculation) return;

      const isLegacy = id.startsWith('legacy-');
      const storedCalculations = userData.splitCalculations ?? [];
      const hasStoredCalculations = storedCalculations.length > 0;

      const nextCalculations = hasStoredCalculations
        ? storedCalculations.filter(entry => entry.id !== id)
        : [];

      const wasActive =
        userData.activeSplitCalculationId === id ||
        activeCalculation?.id === id ||
        (!userData.activeSplitCalculationId && calculations[0]?.id === id);

      let nextSplits = savedSplits;
      if (isLegacy || !hasStoredCalculations) {
        const legacySplitId = isLegacy ? id.slice('legacy-'.length) : calculation.split.id;
        nextSplits = savedSplits.map(split =>
          split.id === legacySplitId
            ? {
                ...split,
                completedWeeks: undefined,
                completedDays: undefined,
                updatedAt: new Date().toISOString(),
              }
            : split,
        );
      }

      let nextActiveCalculationId = userData.activeSplitCalculationId;
      let nextActiveSplitId = userData.activeSplitId;

      if (wasActive) {
        if (nextCalculations.length > 0) {
          const next = nextCalculations[0];
          nextActiveCalculationId = next.id;
          nextActiveSplitId = next.split.id;
          setDraft(cloneSplit(next.split));
          const nextWeek = Array.from({length: 8}, (_, index) => index).find(
            week => !isWeekEffectivelyDone(next.split, week),
          );
          setPreviewWeek(nextWeek ?? 7);
          onSplitIdChange?.(next.split.id);
        } else {
          nextActiveCalculationId = undefined;
          setPreviewWeek(0);
        }
      }

      const updated: UserData = {
        ...userData,
        splits: nextSplits,
        splitCalculations: nextCalculations,
        activeSplitCalculationId: nextActiveCalculationId,
        activeSplitId: nextActiveSplitId,
      };

      setUserData(updated);

      try {
        const result = await saveUser(updated, token);
        if (result && 'ok' in result && !result.ok) {
          throw new Error(
            'error' in result && typeof result.error === 'string' ? result.error : 'Failed to save',
          );
        }
      } catch (error_) {
        onSaveError?.(
          error_ instanceof Error && error_.message !== 'Failed to save'
            ? `Не удалось удалить расчёт: ${error_.message}`
            : 'Не удалось удалить расчёт',
        );
      }
    },
    [
      activeCalculation?.id,
      calculations,
      onSaveError,
      onSplitIdChange,
      saveUser,
      savedSplits,
      setUserData,
      token,
      userData,
    ],
  );

  const createNewSplit = useCallback(() => {
    const split = migrateToCustomExercises(createDefaultSplit(`Сплит ${savedSplits.length + 1}`));
    setIsDraftingNewSplit(true);
    setDraft(split);
    onSplitIdChange?.(null);
  }, [onSplitIdChange, savedSplits.length]);

  const createSavedSplit = useCallback(
    (options?: {name?: string; daysPerWeek?: 2 | 3}) => {
      const explicitName = options?.name?.trim();
      const splitName =
        explicitName && explicitName.length > 0
          ? explicitName
          : `Сплит ${savedSplits.length + 1}`;
      const split = migrateToCustomExercises(createDefaultSplit(splitName));
      if (options?.daysPerWeek && options.daysPerWeek !== split.daysPerWeek) {
        const customExercises = {...(split.customExercisesByDay ?? {})};
        if (options.daysPerWeek === 2) {
          split.days = mergeToTwoDays(split.days);
        }
        split.daysPerWeek = options.daysPerWeek;
        split.customExercisesByDay = customExercises;
      }
      const stamped: CustomSplit = {...split, updatedAt: new Date().toISOString()};
      setIsDraftingNewSplit(false);
      setDraft(cloneSplit(stamped));
      const nextSplits = [
        ...savedSplits.filter(entry => entry.id !== stamped.id),
        stamped,
      ];
      const updated: UserData = {
        ...userData,
        splits: nextSplits,
        activeSplitId: stamped.id,
      };
      setUserData(updated);
      onSplitIdChange?.(stamped.id);
      void saveUser(updated, token);
    },
    [onSplitIdChange, saveUser, savedSplits, setUserData, token, userData],
  );

  const duplicateLast = useCallback(() => {
    const last = savedSplits[0];
    if (!last) return;
    const copy: CustomSplit = migrateToCustomExercises({
      ...last,
      id: crypto.randomUUID(),
      name: `${last.name} (копия)`,
      days: last.days.map(day => ({...day, muscles: []})),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsDraftingNewSplit(true);
    setDraft(copy);
    onSplitIdChange?.(copy.id);
  }, [onSplitIdChange, savedSplits]);

  const selectSplit = useCallback(
    (id: string) => {
      const found = savedSplits.find(split => split.id === id);
      if (!found) return;
      setIsDraftingNewSplit(true);
      setDraft(
        migrateToCustomExercises({
          ...found,
          days: found.days.map(day => ({...day, muscles: [...day.muscles]})),
        }),
      );
      onSplitIdChange?.(id);
    },
    [onSplitIdChange, savedSplits],
  );

  const moveExercise = useCallback((exerciseKey: string, fromDay: 1 | 2 | 3, toDay: 1 | 2 | 3) => {
    if (!CATALOG_EXERCISES[exerciseKey]) return;
    setDraft(current => {
      const customExercises = {...(current.customExercisesByDay ?? {})};

      const fromList = customExercises[fromDay] ?? [];
      customExercises[fromDay] = fromList.filter(key => key !== exerciseKey);

      const toList = [...(customExercises[toDay] ?? [])];
      if (!toList.includes(exerciseKey)) {
        toList.push(exerciseKey);
      }
      customExercises[toDay] = toList;

      return {
        ...current,
        customExercisesByDay: customExercises,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const addExerciseToDay = useCallback((exerciseKey: string, targetDay: 1 | 2 | 3) => {
    if (!CATALOG_EXERCISES[exerciseKey]) return;
    setDraft(current => {
      const customExercises = {...(current.customExercisesByDay ?? {})};
      const dayList = [...(customExercises[targetDay] ?? [])];
      if (!dayList.includes(exerciseKey)) {
        dayList.push(exerciseKey);
      }
      customExercises[targetDay] = dayList;

      return {
        ...current,
        customExercisesByDay: customExercises,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  /** Copy exercise to another day without removing it from the source day. */
  const duplicateExerciseToDay = useCallback(
    (exerciseKey: string, targetDay: 1 | 2 | 3) => {
      addExerciseToDay(exerciseKey, targetDay);
    },
    [addExerciseToDay],
  );

  const removeExercise = useCallback((exerciseKey: string, dayNumber: 1 | 2 | 3) => {
    setDraft(current => {
      const customExercises = {...(current.customExercisesByDay ?? {})};
      const dayList = customExercises[dayNumber] ?? [];
      customExercises[dayNumber] = dayList.filter(key => key !== exerciseKey);

      return {
        ...current,
        customExercisesByDay: customExercises,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);
  const setExerciseOneRM = useCallback(
    (
      exerciseKey: string,
      oneRM: number,
      testWeight?: number,
      testReps?: number,
      bodyWeight?: number,
    ) => {
      if (!CATALOG_EXERCISES[exerciseKey] || !Number.isFinite(oneRM) || oneRM <= 0) return;

      const existing = userData.exercises.find(exercise => exercise.exerciseKey === exerciseKey);
      const saved: SavedExercise = existing
        ? {
            ...existing,
            oneRM,
            testWeight: testWeight ?? existing.testWeight,
            testReps: testReps ?? existing.testReps,
            bodyWeight: bodyWeight ?? existing.bodyWeight,
            date: new Date().toLocaleDateString('ru-RU'),
          }
        : {
            exerciseKey,
            testWeight: testWeight ?? oneRM,
            testReps: testReps ?? 1,
            oneRM,
            bodyWeight,
            date: new Date().toLocaleDateString('ru-RU'),
          };

      const updated: UserData = {
        ...userData,
        exercises: [
          ...userData.exercises.filter(exercise => exercise.exerciseKey !== exerciseKey),
          saved,
        ],
      };

      setUserData(updated);

      void saveUser(updated, token)
        .then(result => {
          if (result && 'ok' in result && !result.ok) {
            const errMsg =
              'error' in result && typeof result.error === 'string' ? result.error : '';
            const isNetworkError =
              errMsg.toLowerCase().includes('fetch') ||
              errMsg.toLowerCase().includes('network') ||
              errMsg.toLowerCase().includes('load') ||
              errMsg.toLowerCase().includes('http') ||
              errMsg.toLowerCase().includes('status');
            if (!isNetworkError) {
              onSaveError?.('Не удалось сохранить силовые показатели');
            } else {
              console.warn('Network error when saving 1RM (saved locally):', errMsg);
            }
          }
        })
        .catch(e => {
          console.error('setExerciseOneRM error:', e);
        });
    },
    [onSaveError, saveUser, setUserData, token, userData],
  );

  const resolveCalculations = useCallback((data: UserData): SplitCalculation[] => {
    const stored = data.splitCalculations ?? [];
    if (stored.length > 0) return stored;

    const splits = data.splits ?? [];
    const legacySplit =
      splits.find(split => split.id === (data.activeSplitId ?? null)) ?? splits[0];
    const hasLegacyProgress =
      (legacySplit?.completedWeeks?.length ?? 0) > 0 ||
      (legacySplit?.completedDays?.length ?? 0) > 0;
    if (!legacySplit || !hasLegacyProgress) return [];

    return [
      {
        id: `legacy-${legacySplit.id}`,
        calculatedAt: legacySplit.updatedAt,
        split: cloneSplit(legacySplit),
        exercises: data.exercises.map(exercise => ({...exercise})),
      },
    ];
  }, []);

  const persistCalculationProgress = useCallback(
    (nextSplit: CustomSplit) => {
      const latest = userDataRef.current;
      const latestCalculations = resolveCalculations(latest);
      const calculationId =
        latest.activeSplitCalculationId ?? activeCalculation?.id ?? latestCalculations[0]?.id;
      if (!calculationId) return;

      const nextCalculations = latestCalculations.map(entry =>
        entry.id === calculationId ? {...entry, split: nextSplit} : entry,
      );
      // Ensure the active calculation exists even when we started from a legacy synthetic entry.
      if (!nextCalculations.some(entry => entry.id === calculationId) && activeCalculation) {
        nextCalculations.unshift({...activeCalculation, split: nextSplit});
      }

      const updated: UserData = {
        ...latest,
        splitCalculations: nextCalculations.slice(0, 50),
        activeSplitId: nextSplit.id,
        activeSplitCalculationId: calculationId,
      };
      userDataRef.current = updated;
      setUserData(updated);
      onSplitIdChange?.(nextSplit.id);
      void saveUser(updated, token)
        .then(result => {
          if (result && 'ok' in result && !result.ok) {
            const errMsg =
              'error' in result && typeof result.error === 'string' ? result.error : '';
            console.error('persistCalculationProgress failed:', errMsg || result);
            onSaveError?.(
              errMsg
                ? `Не удалось сохранить прогресс расчёта: ${errMsg}`
                : 'Не удалось сохранить прогресс расчёта на сервер',
            );
          }
        })
        .catch(error => {
          console.error('persistCalculationProgress error:', error);
          onSaveError?.('Не удалось сохранить прогресс расчёта на сервер');
        });
    },
    [
      activeCalculation,
      onSaveError,
      onSplitIdChange,
      resolveCalculations,
      saveUser,
      setUserData,
      token,
    ],
  );

  const setFixedWeight = useCallback(
    (exerciseKey: string, weekIndex: number, weight: number) => {
      const source = activeCalculation?.split ?? draft;
      const existing = source.fixedWeights?.[exerciseKey] ?? Array(8).fill(0);
      const weeks = [...existing];
      weeks[weekIndex] = weight;
      const next = {
        ...source,
        weightMode: 'fixed' as const,
        fixedWeights: {...source.fixedWeights, [exerciseKey]: weeks},
        updatedAt: new Date().toISOString(),
      };
      if (activeCalculation) {
        persistCalculationProgress(next);
      } else {
        setDraft(next);
      }
    },
    [activeCalculation, draft, persistCalculationProgress],
  );

  const toggleCompletedWeek = useCallback(
    (weekIndex: number) => {
      if (!activeCalculation || !Number.isInteger(weekIndex) || weekIndex < 0 || weekIndex > 7) {
        return;
      }
      // Read latest snapshot so rapid day/week taps cannot clobber each other.
      const latest = userDataRef.current;
      const latestCalculations = resolveCalculations(latest);
      const calculationId =
        latest.activeSplitCalculationId ?? activeCalculation.id ?? latestCalculations[0]?.id;
      const current =
        latestCalculations.find(entry => entry.id === calculationId) ?? activeCalculation;
      persistCalculationProgress(applyToggleCompletedWeek(current.split, weekIndex));
    },
    [activeCalculation, persistCalculationProgress, resolveCalculations],
  );

  const toggleCompletedDay = useCallback(
    (weekIndex: number, day: 1 | 2 | 3) => {
      if (!activeCalculation || !Number.isInteger(weekIndex) || weekIndex < 0 || weekIndex > 7) {
        return;
      }
      const latest = userDataRef.current;
      const latestCalculations = resolveCalculations(latest);
      const calculationId =
        latest.activeSplitCalculationId ?? activeCalculation.id ?? latestCalculations[0]?.id;
      const current =
        latestCalculations.find(entry => entry.id === calculationId) ?? activeCalculation;
      persistCalculationProgress(applyToggleCompletedDay(current.split, weekIndex, day));
    },
    [activeCalculation, persistCalculationProgress, resolveCalculations],
  );

  return {
    draft,
    savedSplits,
    calculations,
    activeCalculation,
    isEditingCalculation,
    previewSplit,
    previewWeek,
    setPreviewWeek,
    dayPreviews,
    validationError,
    updateDraft,
    setDaysPerWeek,
    saveSplit,
    calculateSplit,
    selectCalculation,
    deleteCalculation,
    createNewSplit,
    createSavedSplit,
    duplicateLast,
    selectSplit,
    setFixedWeight,
    moveExercise,
    removeExercise,
    addExerciseToDay,
    duplicateExerciseToDay,
    setExerciseOneRM,
    toggleCompletedWeek,
    toggleCompletedDay,
  };
}
