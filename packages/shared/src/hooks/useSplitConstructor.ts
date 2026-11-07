import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {CATALOG_EXERCISES} from '../data/exercises.ts';
import type {
  CustomSplit,
  SavedExercise,
  SplitCalculation,
  SplitDayNumber,
  TrainingProfile,
  UserData,
} from '../types/index.ts';
import type {TrainingDayDef} from '../types/index.ts';
import {
  getProfileExercises,
  upsertProfileExercise,
  removeProfileExercises,
} from '../utils/profile-exercises.ts';
import {
  areCalculationWeightsReady,
  copyExercisesForSplitKeys,
  missingExerciseKeys,
  splitExerciseKeys,
} from '../utils/split-weight-readiness.ts';

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
import {resolveDeepLinkSplit, resolveSavedSplitSelection} from '../utils/split-selection.ts';
import {
  DEFAULT_PROFILE_ID,
  DEFAULT_PROFILE_NAME,
  ensureTrainingProfiles,
  profileNameOrFallback,
  upsertSplit,
  withEnsuredProfiles,
} from '../utils/training-profiles.ts';

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

  const profileBundle = useMemo(() => ensureTrainingProfiles(userData), [userData]);
  const virtualProfile = useMemo<TrainingProfile>(
    () => ({
      id: DEFAULT_PROFILE_ID,
      name: DEFAULT_PROFILE_NAME,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }),
    [],
  );
  const profiles = useMemo(
    () => (profileBundle.profiles.length > 0 ? profileBundle.profiles : [virtualProfile]),
    [profileBundle.profiles, virtualProfile],
  );
  const activeProfileId = profileBundle.activeProfileId ?? profiles[0]?.id ?? DEFAULT_PROFILE_ID;
  const allSplits = profileBundle.splits;
  const activeSplitId = userData.activeSplitId ?? null;
  const savedSplits = useMemo(
    () => allSplits.filter(split => split.profileId === activeProfileId),
    [activeProfileId, allSplits],
  );
  const allCalculations = useMemo(() => {
    if (profileBundle.splitCalculations.length > 0) return profileBundle.splitCalculations;

    const legacySplit = allSplits.find(split => split.id === activeSplitId) ?? allSplits[0];
    const hasLegacyProgress =
      (legacySplit?.completedWeeks?.length ?? 0) > 0 ||
      (legacySplit?.completedDays?.length ?? 0) > 0;
    if (!legacySplit || !hasLegacyProgress) return [];

    return [
      {
        id: `legacy-${legacySplit.id}`,
        splitId: legacySplit.id,
        calculatedAt: legacySplit.updatedAt,
        split: cloneSplit(legacySplit),
        exercises: getProfileExercises(userData, activeProfileId).map(exercise => ({...exercise})),
      },
    ];
  }, [activeProfileId, activeSplitId, allSplits, profileBundle.splitCalculations, userData]);
  const calculations = useMemo(
    () =>
      allCalculations
        .filter(entry => entry.split.profileId === activeProfileId)
        .map(entry => ({...entry, splitId: entry.splitId ?? entry.split.id})),
    [activeProfileId, allCalculations],
  );
  const profileExercises = useMemo(
    () => getProfileExercises(userData, activeProfileId),
    [activeProfileId, userData],
  );
  const selectedSplitId = useMemo(() => {
    if (activeSplitId && savedSplits.some(split => split.id === activeSplitId))
      return activeSplitId;
    return null;
  }, [activeSplitId, savedSplits]);
  const calculationsForSelectedSplit = useMemo(() => {
    if (!selectedSplitId) return [];
    return calculations.filter(entry => (entry.splitId ?? entry.split.id) === selectedSplitId);
  }, [calculations, selectedSplitId]);
  const activeProfile = profiles.find(profile => profile.id === activeProfileId) ?? profiles[0];
  const [profileName, setProfileName] = useState(activeProfile?.name ?? DEFAULT_PROFILE_NAME);
  const [profileFocusKey, setProfileFocusKey] = useState(0);
  const profileNameDirty = useRef(false);
  const [prevProfileId, setPrevProfileId] = useState(activeProfileId);

  // Switching profiles resets the name field (adjust-state-during-render pattern).
  if (prevProfileId !== activeProfileId) {
    setPrevProfileId(activeProfileId);
    setProfileName(activeProfile?.name ?? DEFAULT_PROFILE_NAME);
  }

  useEffect(() => {
    profileNameDirty.current = false;
  }, [activeProfileId]);

  useEffect(() => {
    if (profileNameDirty.current) return;
    setProfileName(activeProfile?.name ?? DEFAULT_PROFILE_NAME);
  }, [activeProfile?.name, activeProfileId]);
  const [isDraftingNewSplit, setIsDraftingNewSplit] = useState(false);
  const [isDraftingNewCalculation, setIsDraftingNewCalculation] = useState(false);
  const [splitEditorOpen, setSplitEditorOpen] = useState(false);
  const [weightBaseOpen, setWeightBaseOpen] = useState(false);
  const [calculationExercises, setCalculationExercises] = useState<SavedExercise[] | null>(null);
  const autoCalcHashRef = useRef<string>('');
  const activeCalculation = isDraftingNewSplit
    ? undefined
    : isDraftingNewCalculation
      ? undefined
      : (calculationsForSelectedSplit.find(
          entry => entry.id === userData.activeSplitCalculationId,
        ) ??
        calculationsForSelectedSplit[0] ??
        calculations.find(entry => entry.id === userData.activeSplitCalculationId));
  const isEditingCalculation =
    activeCalculation !== undefined && activeCalculation.id === userData.activeSplitCalculationId;

  const resolveSavedSplit = useCallback(
    (preferredId?: string | null): CustomSplit | undefined =>
      resolveSavedSplitSelection(savedSplits, preferredId, activeSplitId),
    [activeSplitId, savedSplits],
  );

  const [draft, setDraft] = useState<CustomSplit>(() => {
    const fromUrl = resolveDeepLinkSplit(allSplits, initialSplitId);
    if (fromUrl) return cloneSplit(fromUrl);
    const existing = resolveSavedSplit(initialSplitId);
    if (existing) return cloneSplit(existing);
    const fallback = resolveSavedSplitSelection(savedSplits, null, activeSplitId);
    if (fallback) return cloneSplit(fallback);
    const fresh = migrateToCustomExercises(createDefaultSplit());
    fresh.profileId = activeProfileId;
    return fresh;
  });
  const [previewWeek, setPreviewWeek] = useState(0);
  const hydratedUrlIdRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (!initialSplitId) {
      hydratedUrlIdRef.current = null;
      return;
    }
    const found = resolveDeepLinkSplit(allSplits, initialSplitId);
    if (!found) return;
    const current = userDataRef.current;
    const profileId = found.profileId ?? current.activeProfileId ?? activeProfileId;
    const alreadyActive =
      current.activeSplitId === found.id &&
      (current.activeProfileId ?? activeProfileId) === profileId;
    if (alreadyActive && hydratedUrlIdRef.current === initialSplitId) return;
    hydratedUrlIdRef.current = initialSplitId;
    const forSplit = allCalculations.filter(
      entry => (entry.splitId ?? entry.split.id) === found.id,
    );
    setIsDraftingNewSplit(false);
    setIsDraftingNewCalculation(false);
    setCalculationExercises(null);
    setDraft(cloneSplit(found));
    if (alreadyActive) return;
    const updated: UserData = {
      ...withEnsuredProfiles(current),
      activeProfileId: profileId,
      splits: allSplits,
      activeSplitId: found.id,
      splitCalculations: allCalculations,
      activeSplitCalculationId: forSplit[0]?.id,
    };
    userDataRef.current = updated;
    setUserData(updated);
    onSplitIdChange?.(found.id);
    void saveUser(updated, token);
  }, [
    activeProfileId,
    allCalculations,
    allSplits,
    initialSplitId,
    onSplitIdChange,
    saveUser,
    setUserData,
    token,
  ]);

  const validationError = useMemo(() => validateSplit(draft), [draft]);

  const previewSplit =
    isEditingCalculation || isDraftingNewCalculation ? draft : (activeCalculation?.split ?? draft);
  const previewExercises = calculationExercises ?? activeCalculation?.exercises ?? profileExercises;
  const weightReadinessKeys = useMemo(() => {
    const split = selectedSplitId
      ? (savedSplits.find(entry => entry.id === selectedSplitId) ?? previewSplit)
      : previewSplit;
    return splitExerciseKeys(split);
  }, [previewSplit, savedSplits, selectedSplitId]);
  const weightsReady = useMemo(
    () => areCalculationWeightsReady(weightReadinessKeys, previewExercises),
    [previewExercises, weightReadinessKeys],
  );
  const missingWeightKeys = useMemo(
    () => missingExerciseKeys(weightReadinessKeys, previewExercises),
    [previewExercises, weightReadinessKeys],
  );

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

  const setDaysPerWeek = useCallback((daysPerWeek: 2 | 3 | 4) => {
    setDraft(current => {
      const customExercises = {...(current.customExercisesByDay ?? {})};

      if (daysPerWeek === 2) {
        const day2List = customExercises[2] ?? [];
        const day3List = customExercises[3] ?? [];
        const day4List = customExercises[4] ?? [];
        const merged = [...day2List];
        for (const key of [...day3List, ...day4List]) {
          if (!merged.includes(key)) merged.push(key);
        }
        customExercises[2] = merged;
        delete customExercises[3];
        delete customExercises[4];
      } else if (daysPerWeek === 3) {
        if (!customExercises[3]) customExercises[3] = [];
        const day4List = customExercises[4] ?? [];
        const day3List = [...(customExercises[3] ?? [])];
        for (const key of day4List) {
          if (!day3List.includes(key)) day3List.push(key);
        }
        customExercises[3] = day3List;
        delete customExercises[4];
      } else {
        if (!customExercises[3]) customExercises[3] = [];
        if (!customExercises[4]) customExercises[4] = [];
      }

      const days = Array.from({length: daysPerWeek}, (_, i) => ({
        dayNumber: (i + 1) as SplitDayNumber,
        muscles: [] as CustomSplit['days'][number]['muscles'],
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

  const namedProfiles = useCallback((): TrainingProfile[] => {
    const name = profileNameOrFallback(profileName, activeProfileId);
    const now = new Date().toISOString();
    return profiles.map(profile =>
      profile.id === activeProfileId ? {...profile, name, updatedAt: now} : profile,
    );
  }, [activeProfileId, profileName, profiles]);

  const saveSplit = useCallback(async () => {
    const error = validateSplit(draft);
    if (error) {
      onSaveError?.(error);
      return;
    }

    const stamped = {...draft, profileId: activeProfileId, updatedAt: new Date().toISOString()};
    const nextProfiles = namedProfiles();
    const updated: UserData = {
      ...withEnsuredProfiles(userData),
      profiles: nextProfiles,
      activeProfileId,
      splits: upsertSplit(allSplits, stamped),
      activeSplitId: stamped.id,
    };

    setIsDraftingNewSplit(false);
    setSplitEditorOpen(false);
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
  }, [
    activeProfileId,
    allSplits,
    draft,
    namedProfiles,
    onSaveError,
    onSplitIdChange,
    saveUser,
    setUserData,
    token,
    userData,
  ]);

  const calculateSplit = useCallback(async (): Promise<string | null> => {
    const splitSource = draft;
    const error = validateSplit(splitSource);
    if (error) {
      onSaveError?.(error);
      return null;
    }

    const calculatedAt = new Date().toISOString();
    const savedDraft = cloneSplit({
      ...splitSource,
      profileId: activeProfileId,
      updatedAt: calculatedAt,
    });
    const snapshot = cloneSplit({
      ...savedDraft,
      completedWeeks: undefined,
      completedDays: undefined,
    });
    const isUpdatingCalculation =
      !isDraftingNewSplit &&
      activeCalculation !== undefined &&
      activeCalculation.id === userData.activeSplitCalculationId;
    const exerciseSnapshot = (calculationExercises ?? previewExercises).map(exercise => ({
      ...exercise,
    }));
    const calculation: SplitCalculation = {
      id: isUpdatingCalculation ? activeCalculation.id : crypto.randomUUID(),
      splitId: savedDraft.id,
      calculatedAt,
      split: snapshot,
      exercises: exerciseSnapshot,
    };
    const updated: UserData = {
      ...withEnsuredProfiles(userData),
      profiles: namedProfiles(),
      activeProfileId,
      splits: upsertSplit(allSplits, savedDraft),
      activeSplitId: savedDraft.id,
      splitCalculations: [
        calculation,
        ...allCalculations.filter(entry => entry.id !== calculation.id),
      ].slice(0, 50),
      activeSplitCalculationId: calculation.id,
    };

    setIsDraftingNewSplit(false);
    setIsDraftingNewCalculation(false);
    setCalculationExercises(null);
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
    activeProfileId,
    allCalculations,
    allSplits,
    draft,
    namedProfiles,
    onSaveError,
    onSplitIdChange,
    saveUser,
    setUserData,
    token,
    userData,
    isDraftingNewSplit,
    calculationExercises,
    previewExercises,
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
        ...withEnsuredProfiles(userData),
        profiles: namedProfiles(),
        activeProfileId,
        splits: allSplits,
        activeSplitId: calculation.split.id,
        splitCalculations: allCalculations,
        activeSplitCalculationId: calculation.id,
      };

      setIsDraftingNewCalculation(false);
      setCalculationExercises(null);
      setDraft(cloneSplit(calculation.split));
      setPreviewWeek(nextWeek ?? 7);
      setUserData(updated);
      onSplitIdChange?.(calculation.split.id);
      void saveUser(updated, token);
    },
    [
      activeProfileId,
      allCalculations,
      allSplits,
      calculations,
      namedProfiles,
      onSplitIdChange,
      saveUser,
      setUserData,
      token,
      userData,
    ],
  );

  const deleteCalculation = useCallback(
    async (id: string) => {
      const calculation = calculations.find(entry => entry.id === id);
      if (!calculation) return;

      const isLegacy = id.startsWith('legacy-');
      const storedCalculations = userData.splitCalculations ?? [];
      const hasStoredCalculations = storedCalculations.length > 0;

      const nextCalculations = allCalculations.filter(entry => entry.id !== id);
      const nextInProfile = nextCalculations.find(
        entry => entry.split.profileId === activeProfileId,
      );

      const wasActive =
        userData.activeSplitCalculationId === id ||
        activeCalculation?.id === id ||
        (!userData.activeSplitCalculationId && calculations[0]?.id === id);

      let nextSplits = allSplits;
      if (isLegacy || !hasStoredCalculations) {
        const legacySplitId = isLegacy ? id.slice('legacy-'.length) : calculation.split.id;
        nextSplits = allSplits.map(split =>
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
        if (nextInProfile) {
          nextActiveCalculationId = nextInProfile.id;
          nextActiveSplitId = nextInProfile.split.id;
          setDraft(cloneSplit(nextInProfile.split));
          const nextWeek = Array.from({length: 8}, (_, index) => index).find(
            week => !isWeekEffectivelyDone(nextInProfile.split, week),
          );
          setPreviewWeek(nextWeek ?? 7);
          onSplitIdChange?.(nextInProfile.split.id);
        } else {
          nextActiveCalculationId = undefined;
          setPreviewWeek(0);
        }
      }

      const updated: UserData = {
        ...withEnsuredProfiles(userData),
        profiles: namedProfiles(),
        activeProfileId,
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
      activeProfileId,
      allCalculations,
      allSplits,
      calculations,
      namedProfiles,
      onSaveError,
      onSplitIdChange,
      saveUser,
      setUserData,
      token,
      userData,
    ],
  );

  const createNewSplit = useCallback(() => {
    // «+ Новый» применяется к названию, введённому в тулбаре: имя обязано
    // сохраниться. Сбрасываем на «Сплит N» только когда драфт зеркалит
    // сохранённый сплит без правок имени.
    const selectedSaved = isDraftingNewSplit
      ? undefined
      : savedSplits.find(entry => entry.id === draft.id);
    const typedName = draft.name.trim();
    const keptName =
      isDraftingNewSplit || !selectedSaved
        ? typedName
        : selectedSaved.name === draft.name
          ? ''
          : typedName;
    const split = migrateToCustomExercises(
      createDefaultSplit(keptName.length > 0 ? keptName : `Сплит ${savedSplits.length + 1}`),
    );
    split.profileId = activeProfileId;
    setIsDraftingNewSplit(true);
    setSplitEditorOpen(true);
    setIsDraftingNewCalculation(false);
    setCalculationExercises(null);
    setDraft(split);
    onSplitIdChange?.(null);
  }, [activeProfileId, draft, isDraftingNewSplit, onSplitIdChange, savedSplits]);

  // «+ Новый сплит» из тулбара: создаёт сплит и сразу сохраняет его,
  // затем сразу открываем его для редактирования как обычный сохранённый сплит.
  const createSavedSplit = useCallback(
    (options?: {name?: string; daysPerWeek?: 2 | 3 | 4}) => {
      const explicitName = options?.name?.trim();
      const selectedSaved = isDraftingNewSplit
        ? undefined
        : savedSplits.find(entry => entry.id === draft.id);
      const typedName = draft.name.trim();
      const keptName =
        isDraftingNewSplit || !selectedSaved
          ? typedName
          : selectedSaved.name === draft.name
            ? ''
            : typedName;
      const splitName =
        explicitName && explicitName.length > 0
          ? explicitName
          : keptName.length > 0
            ? keptName
            : `Сплит ${savedSplits.length + 1}`;
      const split = migrateToCustomExercises(createDefaultSplit(splitName));
      split.profileId = activeProfileId;
      if (options?.daysPerWeek && options.daysPerWeek !== split.daysPerWeek) {
        split.daysPerWeek = options.daysPerWeek;
        const customExercises = {...(split.customExercisesByDay ?? {})};
        if (options.daysPerWeek === 2) {
          const merged = [...(customExercises[2] ?? [])];
          for (const key of [...(customExercises[3] ?? []), ...(customExercises[4] ?? [])]) {
            if (!merged.includes(key)) merged.push(key);
          }
          customExercises[2] = merged;
          delete customExercises[3];
          delete customExercises[4];
          split.days = mergeToTwoDays(split.days);
        } else {
          customExercises[3] = customExercises[3] ?? [];
          customExercises[4] = customExercises[4] ?? [];
          split.days = [...split.days, {dayNumber: 4, muscles: []}];
        }
        split.customExercisesByDay = customExercises;
      }
      const stamped: CustomSplit = {
        ...split,
        profileId: activeProfileId,
        updatedAt: new Date().toISOString(),
      };

      setIsDraftingNewSplit(false);
      setSplitEditorOpen(false);
      setIsDraftingNewCalculation(false);
      setCalculationExercises(null);
      setDraft(cloneSplit(stamped));

      const updated: UserData = {
        ...withEnsuredProfiles(userData),
        profiles: namedProfiles(),
        activeProfileId,
        splits: upsertSplit(allSplits, stamped),
        activeSplitId: stamped.id,
        // У нового сплита расчётов нет — не наследуем расчёт предыдущего
        // сплита, иначе редактор откроется с чужими упражнениями.
        activeSplitCalculationId: undefined,
      };
      setUserData(updated);
      onSplitIdChange?.(stamped.id);
      void saveUser(updated, token);
    },
    [
      activeProfileId,
      allSplits,
      draft,
      isDraftingNewSplit,
      namedProfiles,
      onSplitIdChange,
      saveUser,
      savedSplits,
      setUserData,
      token,
      userData,
    ],
  );

  const duplicateLast = useCallback(() => {
    const last = savedSplits[0];
    if (!last) return;
    const copy: CustomSplit = migrateToCustomExercises({
      ...last,
      id: crypto.randomUUID(),
      profileId: activeProfileId,
      name: `${last.name} (копия)`,
      days: last.days.map(day => ({...day, muscles: []})),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsDraftingNewSplit(true);
    setDraft(copy);
    onSplitIdChange?.(copy.id);
  }, [activeProfileId, onSplitIdChange, savedSplits]);

  const selectSplit = useCallback(
    (id: string) => {
      const found = savedSplits.find(split => split.id === id);
      if (!found) return;
      setIsDraftingNewSplit(false);
      setSplitEditorOpen(false);
      setIsDraftingNewCalculation(false);
      setCalculationExercises(null);
      setDraft(cloneSplit(found));
      const forSplit = calculations.filter(entry => (entry.splitId ?? entry.split.id) === id);
      const nextCalcId = forSplit[0]?.id;
      const updated: UserData = {
        ...withEnsuredProfiles(userData),
        profiles: namedProfiles(),
        activeProfileId,
        splits: allSplits,
        activeSplitId: id,
        splitCalculations: allCalculations,
        activeSplitCalculationId: nextCalcId,
      };
      setUserData(updated);
      onSplitIdChange?.(id);
      void saveUser(updated, token);
    },
    [
      activeProfileId,
      allCalculations,
      allSplits,
      calculations,
      namedProfiles,
      onSplitIdChange,
      savedSplits,
      saveUser,
      setUserData,
      token,
      userData,
    ],
  );

  const moveExercise = useCallback(
    (exerciseKey: string, fromDay: SplitDayNumber, toDay: SplitDayNumber) => {
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
    },
    [],
  );

  const addExerciseToDay = useCallback((exerciseKey: string, targetDay: SplitDayNumber) => {
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
    (exerciseKey: string, targetDay: SplitDayNumber) => {
      addExerciseToDay(exerciseKey, targetDay);
    },
    [addExerciseToDay],
  );

  const removeExercise = useCallback((exerciseKey: string, dayNumber: SplitDayNumber) => {
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

      const existing = getProfileExercises(userData, activeProfileId).find(
        exercise => exercise.exerciseKey === exerciseKey,
      );
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

      const ensured = withEnsuredProfiles(userData);
      const withProfile = upsertProfileExercise(ensured, activeProfileId, saved);
      const updated: UserData = {
        ...withProfile,
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
    [activeProfileId, onSaveError, saveUser, setUserData, token, userData],
  );

  const setCalculationExerciseOneRM = useCallback(
    (
      exerciseKey: string,
      oneRM: number,
      testWeight?: number,
      testReps?: number,
      bodyWeight?: number,
    ) => {
      if (!CATALOG_EXERCISES[exerciseKey] || !Number.isFinite(oneRM) || oneRM <= 0) return;
      setCalculationExercises(current => {
        const base = current ?? previewExercises;
        const existing = base.find(exercise => exercise.exerciseKey === exerciseKey);
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
        return [...base.filter(exercise => exercise.exerciseKey !== exerciseKey), saved];
      });
    },
    [previewExercises],
  );

  const resolveCalculations = useCallback((data: UserData): SplitCalculation[] => {
    const ensured = ensureTrainingProfiles(data);
    const stored = ensured.splitCalculations;
    if (stored.length > 0) return stored;

    const splits = ensured.splits;
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

      const ensured = withEnsuredProfiles(latest);
      const updated: UserData = {
        ...ensured,
        profiles: ensured.profiles ?? namedProfiles(),
        activeProfileId: ensured.activeProfileId ?? activeProfileId,
        splits: ensured.splits ?? allSplits,
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
      activeProfileId,
      allSplits,
      namedProfiles,
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
    (weekIndex: number, day: SplitDayNumber) => {
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

  const renameProfile = useCallback((name: string) => {
    profileNameDirty.current = true;
    setProfileName(name.slice(0, 40));
  }, []);

  const commitProfileName = useCallback(() => {
    const nextProfiles = namedProfiles();
    profileNameDirty.current = false;
    const committed = nextProfiles.find(profile => profile.id === activeProfileId);
    if (committed) setProfileName(committed.name);
    const updated: UserData = {
      ...withEnsuredProfiles(userData),
      profiles: nextProfiles,
      activeProfileId,
      splits: allSplits,
    };
    userDataRef.current = updated;
    setUserData(updated);
    void saveUser(updated, token);
  }, [activeProfileId, allSplits, namedProfiles, saveUser, setUserData, token, userData]);

  const selectProfile = useCallback(
    (id: string) => {
      if (!profiles.some(profile => profile.id === id)) return;
      if (id === activeProfileId) {
        const nextProfiles = namedProfiles();
        profileNameDirty.current = false;
        const committed = nextProfiles.find(profile => profile.id === id);
        if (committed) setProfileName(committed.name);
        const updated: UserData = {
          ...withEnsuredProfiles(userData),
          profiles: nextProfiles,
          activeProfileId,
          splits: allSplits,
        };
        userDataRef.current = updated;
        setUserData(updated);
        void saveUser(updated, token);
        return;
      }
      const nextProfiles = namedProfiles();
      profileNameDirty.current = false;
      const nextName =
        nextProfiles.find(profile => profile.id === id)?.name ?? DEFAULT_PROFILE_NAME;
      setProfileName(nextName);
      const profileSplits = allSplits.filter(split => split.profileId === id);
      const preferred =
        profileSplits.find(split => split.id === userData.activeSplitId) ?? profileSplits[0];
      const updated: UserData = {
        ...withEnsuredProfiles(userData),
        profiles: nextProfiles,
        activeProfileId: id,
        splits: allSplits,
        activeSplitId: preferred?.id ?? userData.activeSplitId,
      };
      if (preferred) {
        setIsDraftingNewSplit(false);
        setDraft(cloneSplit(preferred));
        onSplitIdChange?.(preferred.id);
      } else {
        const fresh = migrateToCustomExercises(createDefaultSplit('Сплит 1'));
        fresh.profileId = id;
        setIsDraftingNewSplit(true);
        setDraft(fresh);
        onSplitIdChange?.(null);
      }
      userDataRef.current = updated;
      setUserData(updated);
      void saveUser(updated, token);
    },
    [
      activeProfileId,
      allSplits,
      namedProfiles,
      onSplitIdChange,
      profiles,
      saveUser,
      setUserData,
      token,
      userData,
    ],
  );

  const createCalculationFromBase = useCallback(() => {
    if (!selectedSplitId) return;
    const split = savedSplits.find(entry => entry.id === selectedSplitId);
    if (!split) return;
    const keys = splitExerciseKeys(split);
    setIsDraftingNewCalculation(true);
    setCalculationExercises(copyExercisesForSplitKeys(keys, profileExercises));
    const updated: UserData = {
      ...withEnsuredProfiles(userData),
      profiles: namedProfiles(),
      activeProfileId,
      splits: allSplits,
      activeSplitId: selectedSplitId,
      splitCalculations: allCalculations,
      activeSplitCalculationId: undefined,
    };
    setUserData(updated);
    void saveUser(updated, token);
  }, [
    activeProfileId,
    allCalculations,
    allSplits,
    namedProfiles,
    profileExercises,
    saveUser,
    savedSplits,
    selectedSplitId,
    setUserData,
    token,
    userData,
  ]);

  const openSplitEditor = useCallback(
    (id?: string) => {
      const targetId = id ?? selectedSplitId;
      if (!targetId) return;
      const found = savedSplits.find(split => split.id === targetId);
      if (!found) return;
      setDraft(cloneSplit(found));
      setSplitEditorOpen(true);
    },
    [savedSplits, selectedSplitId],
  );

  const closeSplitEditor = useCallback(() => {
    setSplitEditorOpen(false);
    if (selectedSplitId) {
      const found = savedSplits.find(split => split.id === selectedSplitId);
      if (found) setDraft(cloneSplit(found));
    }
  }, [savedSplits, selectedSplitId]);

  const deleteSplitById = useCallback(
    async (id: string) => {
      const nextSplits = allSplits.filter(split => split.id !== id);
      const nextCalculations = allCalculations.filter(
        entry => (entry.splitId ?? entry.split.id) !== id,
      );
      const wasActive = userData.activeSplitId === id;
      const nextActiveSplitId = wasActive
        ? (nextSplits.find(split => split.profileId === activeProfileId)?.id ?? null)
        : userData.activeSplitId;
      const updated: UserData = {
        ...withEnsuredProfiles(userData),
        profiles: namedProfiles(),
        activeProfileId,
        splits: nextSplits,
        splitCalculations: nextCalculations,
        activeSplitId: nextActiveSplitId ?? undefined,
        activeSplitCalculationId: wasActive ? undefined : userData.activeSplitCalculationId,
      };
      setSplitEditorOpen(false);
      setIsDraftingNewCalculation(false);
      setCalculationExercises(null);
      if (nextActiveSplitId) {
        const found = nextSplits.find(split => split.id === nextActiveSplitId);
        if (found) setDraft(cloneSplit(found));
      }
      setUserData(updated);
      onSplitIdChange?.(nextActiveSplitId ?? null);
      try {
        await saveUser(updated, token);
      } catch {
        onSaveError?.('Не удалось удалить сплит');
      }
    },
    [
      activeProfileId,
      allCalculations,
      allSplits,
      namedProfiles,
      onSaveError,
      onSplitIdChange,
      saveUser,
      setUserData,
      token,
      userData,
    ],
  );

  const deleteProfileById = useCallback(
    async (id: string) => {
      if (profiles.length <= 1) {
        onSaveError?.('Нельзя удалить последний профиль');
        return;
      }
      const nextProfiles = namedProfiles().filter(profile => profile.id !== id);
      const nextSplits = allSplits.filter(split => split.profileId !== id);
      const nextCalculations = allCalculations.filter(entry => entry.split.profileId !== id);
      const nextUser = removeProfileExercises(userData, id);
      const fallbackProfile = nextProfiles[0]?.id ?? DEFAULT_PROFILE_ID;
      const updated: UserData = {
        ...withEnsuredProfiles(nextUser),
        profiles: nextProfiles,
        activeProfileId: activeProfileId === id ? fallbackProfile : activeProfileId,
        splits: nextSplits,
        splitCalculations: nextCalculations,
        activeSplitId:
          activeProfileId === id
            ? nextSplits.find(split => split.profileId === fallbackProfile)?.id
            : userData.activeSplitId,
        activeSplitCalculationId:
          activeProfileId === id ? undefined : userData.activeSplitCalculationId,
      };
      setSplitEditorOpen(false);
      setWeightBaseOpen(false);
      setUserData(updated);
      void saveUser(updated, token);
    },
    [
      activeProfileId,
      allCalculations,
      allSplits,
      namedProfiles,
      onSaveError,
      profiles.length,
      saveUser,
      setUserData,
      token,
      userData,
    ],
  );

  useEffect(() => {
    if (!selectedSplitId || !weightsReady) return;
    if (!isDraftingNewCalculation && !calculationExercises && !activeCalculation) return;
    const hash = JSON.stringify({
      splitId: selectedSplitId,
      keys: weightReadinessKeys,
      exercises: previewExercises.map(entry => [
        entry.exerciseKey,
        entry.testWeight,
        entry.testReps,
        entry.oneRM,
      ]),
    });
    if (hash === autoCalcHashRef.current) return;
    const timer = window.setTimeout(() => {
      autoCalcHashRef.current = hash;
      void calculateSplit();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [
    activeCalculation,
    calculateSplit,
    calculationExercises,
    isDraftingNewCalculation,
    previewExercises,
    selectedSplitId,
    weightReadinessKeys,
    weightsReady,
  ]);

  const createProfile = useCallback(() => {
    const now = new Date().toISOString();
    const profile: TrainingProfile = {
      id: crypto.randomUUID(),
      name: 'Новый профиль',
      createdAt: now,
      updatedAt: now,
    };
    const nextProfiles = [...namedProfiles(), profile];
    profileNameDirty.current = false;
    setProfileName(profile.name);
    setProfileFocusKey(key => key + 1);
    const fresh = migrateToCustomExercises(createDefaultSplit('Сплит 1'));
    fresh.profileId = profile.id;
    setIsDraftingNewSplit(true);
    setDraft(fresh);
    onSplitIdChange?.(null);
    const updated: UserData = {
      ...withEnsuredProfiles(userData),
      profiles: nextProfiles,
      activeProfileId: profile.id,
      splits: allSplits,
    };
    userDataRef.current = updated;
    setUserData(updated);
    void saveUser(updated, token);
  }, [allSplits, namedProfiles, onSplitIdChange, saveUser, setUserData, token, userData]);

  return {
    draft,
    savedSplits,
    profiles,
    activeProfileId,
    profileName,
    profileFocusKey,
    profileExercises,
    renameProfile,
    commitProfileName,
    selectProfile,
    createProfile,
    deleteProfileById,
    calculations,
    calculationsForSelectedSplit,
    selectedSplitId,
    activeCalculation,
    isEditingCalculation,
    isDraftingNewCalculation,
    isDraftingNewSplit,
    splitEditorOpen,
    setSplitEditorOpen,
    weightBaseOpen,
    setWeightBaseOpen,
    previewSplit,
    previewExercises,
    previewWeek,
    setPreviewWeek,
    dayPreviews,
    validationError,
    weightsReady,
    missingWeightKeys,
    weightReadinessKeys,
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
    createCalculationFromBase,
    openSplitEditor,
    closeSplitEditor,
    deleteSplitById,
    setFixedWeight,
    moveExercise,
    removeExercise,
    addExerciseToDay,
    duplicateExerciseToDay,
    setExerciseOneRM,
    setCalculationExerciseOneRM,
    toggleCompletedWeek,
    toggleCompletedDay,
  };
}
