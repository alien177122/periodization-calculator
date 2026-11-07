import {JOURNAL_LIMITS, pruneJournal} from './journalLimits.js';
import {
  SPLIT_LIMITS,
  isSplitMuscle,
  isWeightMode,
  normalizeLegExercisesArray,
  pruneSplits,
} from './splitLimits.js';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function invalid(message) {
  return {error: message};
}

function trimNote(value, maxLen = JOURNAL_LIMITS.MAX_NOTE_LENGTH) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

function normalizeJournalSet(set, index) {
  if (!isRecord(set)) return null;

  const weight = isPositiveNumber(set.weight) ? set.weight : null;
  const reps = isNonNegativeInteger(set.reps) && set.reps >= 1 ? set.reps : null;
  if (weight === null || reps === null) return null;

  const setIndex =
    isNonNegativeInteger(set.setIndex) && set.setIndex >= 1 ? set.setIndex : index + 1;

  const normalized = {setIndex, weight, reps};

  if (set.rpe !== undefined) {
    if (!Number.isFinite(set.rpe) || set.rpe < 6 || set.rpe > 10) return null;
    normalized.rpe = set.rpe;
  }

  const note = trimNote(set.note);
  if (note) normalized.note = note;

  if (set.additionalWeight !== undefined) {
    if (!isPositiveNumber(set.additionalWeight)) return null;
    normalized.additionalWeight = set.additionalWeight;
  }

  return normalized;
}

function normalizeJournalSession(session) {
  if (!isRecord(session)) return null;

  const id = typeof session.id === 'string' ? session.id.trim() : '';
  const exerciseKey = typeof session.exerciseKey === 'string' ? session.exerciseKey.trim() : '';
  const date = typeof session.date === 'string' ? session.date.trim() : '';
  const createdAt = typeof session.createdAt === 'string' ? session.createdAt.trim() : '';

  if (!id || !exerciseKey || !date || !ISO_DATE_RE.test(date)) return null;
  if (!createdAt) return null;
  if (!Array.isArray(session.sets) || session.sets.length === 0) return null;
  if (session.sets.length > JOURNAL_LIMITS.MAX_SETS_PER_SESSION) return null;

  const sets = session.sets.map((set, index) => normalizeJournalSet(set, index)).filter(Boolean);

  if (sets.length === 0) return null;

  const normalized = {id, exerciseKey, date, sets, createdAt};

  const sessionNote = trimNote(session.sessionNote);
  if (sessionNote) normalized.sessionNote = sessionNote;

  if (typeof session.updatedAt === 'string' && session.updatedAt.trim()) {
    normalized.updatedAt = session.updatedAt.trim();
  }

  return normalized;
}

function normalizeJournalArray(input) {
  if (!Array.isArray(input)) return [];

  const sessions = [];
  const seenIds = new Set();

  for (const session of input) {
    const normalized = normalizeJournalSession(session);
    if (!normalized || seenIds.has(normalized.id)) continue;
    seenIds.add(normalized.id);
    sessions.push(normalized);
  }

  return pruneJournal(sessions);
}

function normalizeExerciseEntry(exercise) {
  if (!isRecord(exercise)) return null;

  const exerciseKey = typeof exercise.exerciseKey === 'string' ? exercise.exerciseKey.trim() : '';
  const date = typeof exercise.date === 'string' ? exercise.date.trim() : '';
  if (!exerciseKey || !date) return null;
  if (!isPositiveNumber(exercise.testWeight)) return null;
  if (!isNonNegativeInteger(exercise.testReps) || exercise.testReps < 1) return null;
  if (!isPositiveNumber(exercise.oneRM)) return null;

  const normalized = {
    exerciseKey,
    testWeight: exercise.testWeight,
    testReps: exercise.testReps,
    oneRM: exercise.oneRM,
    date,
  };

  if (exercise.bodyWeight !== undefined && isPositiveNumber(exercise.bodyWeight)) {
    normalized.bodyWeight = exercise.bodyWeight;
  }

  return normalized;
}

function normalizeSplitDay(day) {
  if (!isRecord(day)) return null;
  const dayNumber = day.dayNumber;
  if (dayNumber !== 1 && dayNumber !== 2 && dayNumber !== 3 && dayNumber !== 4) return null;
  if (!Array.isArray(day.muscles) || day.muscles.length === 0) return null;

  const muscles = [];
  for (const muscle of day.muscles) {
    if (typeof muscle !== 'string' || !isSplitMuscle(muscle.trim())) return null;
    const id = muscle.trim();
    if (muscles.includes(id)) return null;
    muscles.push(id);
  }

  const normalized = {dayNumber, muscles};
  if (typeof day.label === 'string' && day.label.trim()) {
    normalized.label = day.label.trim().slice(0, SPLIT_LIMITS.MAX_DAY_LABEL_LENGTH);
  }
  return normalized;
}

const DEFAULT_PROFILE_ID = 'profile-osnovnoy';
const DEFAULT_PROFILE_NAME = 'Основной';
const MAX_PROFILES = 50;

function cleanProfileId(value) {
  return typeof value === 'string' ? value.trim().slice(0, 80) : '';
}

function normalizeProfile(profile) {
  if (!isRecord(profile)) return null;
  const id = cleanProfileId(profile.id);
  const name = typeof profile.name === 'string' ? profile.name.trim().slice(0, 40) : '';
  const createdAt = typeof profile.createdAt === 'string' ? profile.createdAt.trim() : '';
  const updatedAt = typeof profile.updatedAt === 'string' ? profile.updatedAt.trim() : '';
  if (!id || !name || !createdAt || !updatedAt) return null;
  return {id, name, createdAt, updatedAt};
}

function normalizeProfilesArray(input) {
  if (!Array.isArray(input)) return [];
  const profiles = [];
  const seen = new Set();
  for (const entry of input) {
    const profile = normalizeProfile(entry);
    if (!profile || seen.has(profile.id)) continue;
    seen.add(profile.id);
    profiles.push(profile);
    if (profiles.length >= MAX_PROFILES) break;
  }
  return profiles;
}

function assignOrphanProfiles(profiles, splits, calculations) {
  const nextProfiles = profiles.map(profile => ({...profile}));
  const seen = new Set(nextProfiles.map(profile => profile.id));
  const nextSplits = splits.map(split => ({...split}));
  const nextCalculations = calculations.map(entry => ({...entry, split: {...entry.split}}));
  const orphans = [
    ...nextSplits.filter(split => !cleanProfileId(split.profileId)),
    ...nextCalculations.map(entry => entry.split).filter(split => !cleanProfileId(split.profileId)),
  ];

  if (orphans.length > 0) {
    let defaultProfile = nextProfiles.find(profile => profile.name === DEFAULT_PROFILE_NAME);
    if (!defaultProfile) {
      const stamp = orphans[0]?.createdAt || '1970-01-01T00:00:00.000Z';
      let id = DEFAULT_PROFILE_ID;
      if (seen.has(id)) id = `${DEFAULT_PROFILE_ID}-${orphans[0]?.id || 'split'}`;
      defaultProfile = {id, name: DEFAULT_PROFILE_NAME, createdAt: stamp, updatedAt: stamp};
      nextProfiles.unshift(defaultProfile);
      seen.add(id);
    }
    for (const split of nextSplits) {
      if (!cleanProfileId(split.profileId)) split.profileId = defaultProfile.id;
    }
    for (const entry of nextCalculations) {
      if (!cleanProfileId(entry.split.profileId)) entry.split.profileId = defaultProfile.id;
    }
  }

  for (const split of [...nextSplits, ...nextCalculations.map(entry => entry.split)]) {
    const profileId = cleanProfileId(split.profileId);
    if (profileId) split.profileId = profileId;
    if (!profileId || seen.has(profileId)) continue;
    nextProfiles.push({
      id: profileId,
      name: 'Профиль',
      createdAt: split.createdAt,
      updatedAt: split.updatedAt || split.createdAt,
    });
    seen.add(profileId);
  }

  return {profiles: nextProfiles, splits: nextSplits, calculations: nextCalculations};
}

function resolveActiveProfileId(input, profiles, activeSplitId, splits) {
  const requested = cleanProfileId(input);
  if (requested && profiles.some(profile => profile.id === requested)) return requested;
  const activeSplit = splits.find(split => split.id === activeSplitId);
  const fromSplit = cleanProfileId(activeSplit?.profileId);
  if (fromSplit && profiles.some(profile => profile.id === fromSplit)) return fromSplit;
  return profiles[0]?.id || null;
}

function normalizeSplit(split) {
  if (!isRecord(split)) return null;

  const id = typeof split.id === 'string' ? split.id.trim() : '';
  const name =
    typeof split.name === 'string' ? split.name.trim().slice(0, SPLIT_LIMITS.MAX_NAME_LENGTH) : '';
  const createdAt = typeof split.createdAt === 'string' ? split.createdAt.trim() : '';
  const updatedAt = typeof split.updatedAt === 'string' ? split.updatedAt.trim() : '';
  const daysPerWeek = split.daysPerWeek;

  if (!id || !name || !createdAt || !updatedAt) return null;
  if (daysPerWeek !== 2 && daysPerWeek !== 3 && daysPerWeek !== 4) return null;
  if (typeof split.varyIntensity !== 'boolean') return null;
  if (!isWeightMode(split.weightMode)) return null;
  if (!Array.isArray(split.days) || split.days.length !== daysPerWeek) return null;

  const days = split.days.map(normalizeSplitDay).filter(Boolean);
  if (days.length !== daysPerWeek) return null;

  const normalized = {
    id,
    name,
    daysPerWeek,
    days,
    varyIntensity: split.varyIntensity,
    weightMode: split.weightMode,
    createdAt,
    updatedAt,
  };

  const profileId = cleanProfileId(split.profileId);
  if (profileId) normalized.profileId = profileId;

  if (isRecord(split.fixedWeights)) {
    const fixedWeights = {};
    for (const [key, values] of Object.entries(split.fixedWeights)) {
      if (typeof key !== 'string' || !key.trim() || !Array.isArray(values)) continue;
      const weeks = values.filter(value => isPositiveNumber(value)).slice(0, 8);
      if (weeks.length === 8) fixedWeights[key.trim()] = weeks;
    }
    if (Object.keys(fixedWeights).length > 0) normalized.fixedWeights = fixedWeights;
  }

  if (isRecord(split.exerciseDayOverrides)) {
    const exerciseDayOverrides = {};
    for (const [key, dayNum] of Object.entries(split.exerciseDayOverrides)) {
      if (typeof key !== 'string' || !key.trim()) continue;
      if (dayNum !== 1 && dayNum !== 2 && dayNum !== 3) continue;
      exerciseDayOverrides[key.trim()] = dayNum;
    }
    if (Object.keys(exerciseDayOverrides).length > 0) {
      normalized.exerciseDayOverrides = exerciseDayOverrides;
    }
  }

  if (isRecord(split.excludedExercisesByDay)) {
    const excludedExercisesByDay = {};
    for (const dayNum of [1, 2, 3]) {
      const keys = split.excludedExercisesByDay[dayNum];
      if (!Array.isArray(keys)) continue;
      const trimmed = keys
        .filter(key => typeof key === 'string' && key.trim())
        .map(key => key.trim());
      if (trimmed.length > 0) excludedExercisesByDay[dayNum] = trimmed;
    }
    if (Object.keys(excludedExercisesByDay).length > 0) {
      normalized.excludedExercisesByDay = excludedExercisesByDay;
    }
  }

  const legExercises = normalizeLegExercisesArray(split.legExercises);
  if (legExercises) normalized.legExercises = legExercises;

  if (isRecord(split.customExercisesByDay)) {
    const customExercisesByDay = {};
    for (const dayNum of [1, 2, 3]) {
      const keys = split.customExercisesByDay[dayNum];
      if (!Array.isArray(keys)) continue;
      const trimmed = keys
        .filter(key => typeof key === 'string' && key.trim())
        .map(key => key.trim());
      if (trimmed.length > 0) customExercisesByDay[dayNum] = trimmed;
    }
    if (Object.keys(customExercisesByDay).length > 0) {
      normalized.customExercisesByDay = customExercisesByDay;
    }
  }

  if (Array.isArray(split.completedWeeks)) {
    const completedWeeks = [
      ...new Set(
        split.completedWeeks
          .filter(week => Number.isInteger(week) && week >= 0 && week <= 7)
          .map(week => Number(week)),
      ),
    ].sort((a, b) => a - b);
    if (completedWeeks.length > 0) normalized.completedWeeks = completedWeeks;
  }

  if (Array.isArray(split.completedDays)) {
    const seen = new Set();
    const completedDays = [];
    for (const entry of split.completedDays) {
      if (!isRecord(entry)) continue;
      const week = entry.week;
      const day = entry.day;
      if (!Number.isInteger(week) || week < 0 || week > 7) continue;
      if (day !== 1 && day !== 2 && day !== 3) continue;
      const key = `${week}:${day}`;
      if (seen.has(key)) continue;
      seen.add(key);
      completedDays.push({week, day});
    }
    completedDays.sort((a, b) => a.week - b.week || a.day - b.day);
    if (completedDays.length > 0) normalized.completedDays = completedDays;
  }

  return normalized;
}

function normalizeSplitsArray(input) {
  if (!Array.isArray(input)) return [];

  const splits = [];
  const seenIds = new Set();

  for (const split of input) {
    const normalized = normalizeSplit(split);
    if (!normalized || seenIds.has(normalized.id)) continue;
    seenIds.add(normalized.id);
    splits.push(normalized);
  }

  return pruneSplits(splits);
}

function normalizeSplitCalculationsArray(input) {
  if (!Array.isArray(input)) return [];

  const calculations = [];
  const seenIds = new Set();

  for (const entry of input) {
    if (!isRecord(entry)) continue;
    const id = typeof entry.id === 'string' ? entry.id.trim() : '';
    const calculatedAt = typeof entry.calculatedAt === 'string' ? entry.calculatedAt.trim() : '';
    const split = normalizeSplit(entry.split);
    if (!id || !calculatedAt || !split || seenIds.has(id)) continue;

    const exercises = Array.isArray(entry.exercises)
      ? entry.exercises.map(normalizeExerciseEntry).filter(Boolean)
      : [];
    seenIds.add(id);
    const splitId =
      typeof entry.splitId === 'string' && entry.splitId.trim() ? entry.splitId.trim() : split.id;
    calculations.push({id, splitId, calculatedAt, split, exercises});
  }

  return calculations
    .sort((a, b) => b.calculatedAt.localeCompare(a.calculatedAt))
    .slice(0, SPLIT_LIMITS.MAX_CALCULATIONS);
}

function normalizeTrainingPreferences(input) {
  if (!isRecord(input)) return undefined;

  const progressionMode = input.progressionMode === 'pyramid' ? 'pyramid' : 'linear';
  const pyramidType = 'descending';
  const rpeBase =
    typeof input.rpeBase === 'number' && input.rpeBase >= 7 && input.rpeBase <= 9
      ? Math.round(input.rpeBase)
      : 8;

  return {progressionMode, pyramidType, rpeBase};
}

const TEST_WEEKS = new Set([4, 8, 12, 16]);
const ACTIVE_PROGRAMS = new Set(['2.0', '3.0']);

function normalizeTestResultsArray(input) {
  if (!Array.isArray(input)) return [];

  const results = [];
  const seen = new Set();

  for (const entry of input) {
    if (!isRecord(entry)) continue;

    const exerciseKey = typeof entry.exerciseKey === 'string' ? entry.exerciseKey.trim() : '';
    const testWeek = entry.testWeek;
    const date = typeof entry.date === 'string' ? entry.date.trim() : '';

    if (!exerciseKey || !date) continue;
    if (!TEST_WEEKS.has(testWeek)) continue;
    if (!isPositiveNumber(entry.weight)) continue;
    if (!isNonNegativeInteger(entry.reps) || entry.reps < 1) continue;

    const dedupeKey = `${exerciseKey}:${testWeek}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    results.push({
      exerciseKey,
      testWeek,
      weight: entry.weight,
      reps: entry.reps,
      date,
    });
  }

  return results;
}

function normalizeTrainingProgressByProgram(input) {
  if (!isRecord(input)) return undefined;

  const normalized = {};
  for (const program of ['2.0', '3.0']) {
    const block = input[program];
    if (!isRecord(block)) continue;
    if (!isNonNegativeInteger(block.completedSessions)) continue;
    normalized[program] = {completedSessions: block.completedSessions};
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeExercisesByProfileId(input) {
  if (!isRecord(input)) return undefined;
  const out = {};
  for (const [key, value] of Object.entries(input)) {
    const profileId = cleanProfileId(key);
    if (!profileId || !Array.isArray(value)) continue;
    const list = value.map(normalizeExerciseEntry).filter(Boolean);
    if (list.length > 0) out[profileId] = list;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function buildStoredUser(
  name,
  exercises,
  trainingProgress,
  trainingPreferences,
  journal,
  splits,
  activeSplitId,
  activeProgram,
  trainingProgressByProgram,
  testResults,
  splitCalculations,
  activeSplitCalculationId,
  profiles,
  activeProfileId,
  exercisesByProfileId,
) {
  const data = {name, exercises};
  if (exercisesByProfileId) data.exercisesByProfileId = exercisesByProfileId;
  if (trainingProgress) data.trainingProgress = trainingProgress;
  if (trainingPreferences) data.trainingPreferences = trainingPreferences;
  if (journal.length > 0) data.journal = journal;
  if (splits.length > 0) data.splits = splits;
  if (profiles && profiles.length > 0) data.profiles = profiles;
  if (activeProfileId) data.activeProfileId = activeProfileId;
  if (activeSplitId) data.activeSplitId = activeSplitId;
  if (activeProgram) data.activeProgram = activeProgram;
  if (trainingProgressByProgram) data.trainingProgressByProgram = trainingProgressByProgram;
  if (testResults.length > 0) data.testResults = testResults;
  if (splitCalculations.length > 0) data.splitCalculations = splitCalculations;
  if (activeSplitCalculationId) data.activeSplitCalculationId = activeSplitCalculationId;
  return data;
}

export function normalizeStoredUserData(input, fallbackName) {
  if (!isRecord(input)) {
    return {name: fallbackName, exercises: []};
  }

  const name =
    typeof input.name === 'string' && input.name.trim() ? input.name.trim() : fallbackName;

  const exercises = Array.isArray(input.exercises)
    ? input.exercises.map(normalizeExerciseEntry).filter(Boolean)
    : [];

  const journal = normalizeJournalArray(input.journal);
  const normalizedSplits = normalizeSplitsArray(input.splits);
  const normalizedCalculations = normalizeSplitCalculationsArray(input.splitCalculations);
  const assigned = assignOrphanProfiles(
    normalizeProfilesArray(input.profiles),
    normalizedSplits,
    normalizedCalculations,
  );
  const splits = assigned.splits;
  const splitCalculations = assigned.calculations;
  const profiles = assigned.profiles;
  const activeSplitId =
    typeof input.activeSplitId === 'string' && input.activeSplitId.trim()
      ? input.activeSplitId.trim()
      : null;
  const activeProfileId = resolveActiveProfileId(
    input.activeProfileId,
    profiles,
    activeSplitId,
    splits,
  );
  const activeSplitCalculationId =
    typeof input.activeSplitCalculationId === 'string' && input.activeSplitCalculationId.trim()
      ? input.activeSplitCalculationId.trim()
      : null;

  const trainingProgress =
    isRecord(input.trainingProgress) &&
    isNonNegativeInteger(input.trainingProgress.completedSessions)
      ? {completedSessions: input.trainingProgress.completedSessions}
      : undefined;

  const trainingPreferences = normalizeTrainingPreferences(input.trainingPreferences);

  const activeProgram = ACTIVE_PROGRAMS.has(input.activeProgram) ? input.activeProgram : undefined;
  const trainingProgressByProgram = normalizeTrainingProgressByProgram(
    input.trainingProgressByProgram,
  );
  const testResults = normalizeTestResultsArray(input.testResults);
  const exercisesByProfileId = normalizeExercisesByProfileId(input.exercisesByProfileId);

  return buildStoredUser(
    name,
    exercises,
    trainingProgress,
    trainingPreferences,
    journal,
    splits,
    activeSplitId,
    activeProgram,
    trainingProgressByProgram,
    testResults,
    splitCalculations,
    activeSplitCalculationId,
    profiles,
    activeProfileId,
    exercisesByProfileId,
  );
}

export function normalizeUserData(input, expectedName) {
  if (!isRecord(input)) return invalid('Некорректные данные пользователя');

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) return invalid('Некорректное имя пользователя');
  if (name !== expectedName) return invalid('Имя пользователя не совпадает с токеном');

  if (!Array.isArray(input.exercises)) {
    return invalid('Поле exercises должно быть массивом');
  }

  const exercises = [];
  const seenKeys = new Set();

  for (const exercise of input.exercises) {
    if (!isRecord(exercise)) return invalid('Некорректная запись упражнения');

    const exerciseKey = typeof exercise.exerciseKey === 'string' ? exercise.exerciseKey.trim() : '';
    if (!exerciseKey) return invalid('У упражнения должен быть ключ');
    if (seenKeys.has(exerciseKey)) return invalid('Упражнения не должны дублироваться');
    seenKeys.add(exerciseKey);

    if (!isPositiveNumber(exercise.testWeight)) return invalid('Некорректный testWeight');
    if (!isNonNegativeInteger(exercise.testReps) || exercise.testReps < 1)
      return invalid('Некорректный testReps');
    if (!isPositiveNumber(exercise.oneRM)) return invalid('Некорректный oneRM');

    const date = typeof exercise.date === 'string' ? exercise.date.trim() : '';
    if (!date) return invalid('У упражнения должна быть дата');

    let bodyWeight;
    if (exercise.bodyWeight !== undefined) {
      if (!isPositiveNumber(exercise.bodyWeight)) return invalid('Некорректный bodyWeight');
      bodyWeight = exercise.bodyWeight;
    }

    exercises.push(
      normalizeExerciseEntry({
        exerciseKey,
        testWeight: exercise.testWeight,
        testReps: exercise.testReps,
        oneRM: exercise.oneRM,
        date,
        ...(bodyWeight !== undefined ? {bodyWeight} : {}),
      }),
    );
  }

  let trainingProgress;
  if (input.trainingProgress !== undefined) {
    if (!isRecord(input.trainingProgress)) return invalid('Некорректный trainingProgress');
    if (!isNonNegativeInteger(input.trainingProgress.completedSessions)) {
      return invalid('completedSessions должен быть неотрицательным целым числом');
    }
    trainingProgress = {completedSessions: input.trainingProgress.completedSessions};
  }

  let trainingPreferences;
  if (input.trainingPreferences !== undefined) {
    trainingPreferences = normalizeTrainingPreferences(input.trainingPreferences);
    if (!trainingPreferences) return invalid('Некорректный trainingPreferences');
  }

  let journal = [];
  if (input.journal !== undefined) {
    if (!Array.isArray(input.journal)) return invalid('Поле journal должно быть массивом');

    const seenJournalIds = new Set();
    for (const session of input.journal) {
      if (!isRecord(session)) return invalid('Некорректная запись журнала');

      const id = typeof session.id === 'string' ? session.id.trim() : '';
      if (!id) return invalid('У сессии журнала должен быть id');
      if (seenJournalIds.has(id)) return invalid('Сессии журнала не должны дублировать id');
      seenJournalIds.add(id);

      const exerciseKey = typeof session.exerciseKey === 'string' ? session.exerciseKey.trim() : '';
      if (!exerciseKey) return invalid('У сессии журнала должен быть exerciseKey');

      const date = typeof session.date === 'string' ? session.date.trim() : '';
      if (!date || !ISO_DATE_RE.test(date)) return invalid('Некорректная дата сессии журнала');

      const createdAt = typeof session.createdAt === 'string' ? session.createdAt.trim() : '';
      if (!createdAt) return invalid('У сессии журнала должен быть createdAt');

      if (!Array.isArray(session.sets)) return invalid('У сессии журнала должен быть массив sets');
      if (session.sets.length === 0)
        return invalid('Сессия журнала должна содержать хотя бы один подход');
      if (session.sets.length > JOURNAL_LIMITS.MAX_SETS_PER_SESSION) {
        return invalid(`Не более ${JOURNAL_LIMITS.MAX_SETS_PER_SESSION} подходов в сессии`);
      }

      const sets = [];
      for (let index = 0; index < session.sets.length; index += 1) {
        const set = session.sets[index];
        if (!isRecord(set)) return invalid('Некорректный подход в журнале');
        if (!isPositiveNumber(set.weight)) return invalid('Некорректный вес подхода');
        if (!isNonNegativeInteger(set.reps) || set.reps < 1)
          return invalid('Некорректные повторения');
        if (set.rpe !== undefined && (!Number.isFinite(set.rpe) || set.rpe < 6 || set.rpe > 10)) {
          return invalid('RPE должен быть от 6 до 10');
        }
        if (set.note !== undefined && typeof set.note !== 'string') {
          return invalid('Некорректная заметка подхода');
        }
        if (
          typeof set.note === 'string' &&
          set.note.trim().length > JOURNAL_LIMITS.MAX_NOTE_LENGTH
        ) {
          return invalid('Заметка подхода слишком длинная');
        }
        if (set.additionalWeight !== undefined && !isPositiveNumber(set.additionalWeight)) {
          return invalid('Некорректный дополнительный вес');
        }

        const normalizedSet = normalizeJournalSet(set, index);
        if (!normalizedSet) return invalid('Некорректный подход в журнале');
        sets.push(normalizedSet);
      }

      const normalizedSession = {
        id,
        exerciseKey,
        date,
        sets,
        createdAt,
      };

      const sessionNote = trimNote(session.sessionNote);
      if (sessionNote) normalizedSession.sessionNote = sessionNote;

      if (typeof session.updatedAt === 'string' && session.updatedAt.trim()) {
        normalizedSession.updatedAt = session.updatedAt.trim();
      }

      journal.push(normalizedSession);
    }

    journal = pruneJournal(journal);
  }

  let splits = [];
  if (input.splits !== undefined) {
    if (!Array.isArray(input.splits)) return invalid('Поле splits должно быть массивом');

    const seenSplitIds = new Set();
    for (const split of input.splits) {
      if (!isRecord(split)) return invalid('Некорректная запись сплита');

      const id = typeof split.id === 'string' ? split.id.trim() : '';
      if (!id) return invalid('У сплита должен быть id');
      if (seenSplitIds.has(id)) return invalid('Сплиты не должны дублировать id');
      seenSplitIds.add(id);

      const normalized = normalizeSplit(split);
      if (!normalized) return invalid('Некорректная конфигурация сплита');
      splits.push(normalized);
    }

    splits = pruneSplits(splits);
  }

  let activeSplitId = null;
  if (input.activeSplitId !== undefined && input.activeSplitId !== null) {
    if (typeof input.activeSplitId !== 'string' || !input.activeSplitId.trim()) {
      return invalid('Некорректный activeSplitId');
    }
    activeSplitId = input.activeSplitId.trim();
  }

  let splitCalculations = [];
  if (input.splitCalculations !== undefined) {
    if (!Array.isArray(input.splitCalculations)) {
      return invalid('Поле splitCalculations должно быть массивом');
    }
    splitCalculations = normalizeSplitCalculationsArray(input.splitCalculations);
    if (input.splitCalculations.length > 0 && splitCalculations.length === 0) {
      return invalid('Некорректная история расчётов сплита');
    }
  }

  let profiles = [];
  if (input.profiles !== undefined) {
    if (!Array.isArray(input.profiles)) return invalid('Поле profiles должно быть массивом');
    const seenProfileIds = new Set();
    for (const entry of input.profiles) {
      const profile = normalizeProfile(entry);
      if (!profile) return invalid('Некорректный профиль');
      if (seenProfileIds.has(profile.id)) return invalid('Профили не должны дублировать id');
      seenProfileIds.add(profile.id);
      profiles.push(profile);
    }
    if (profiles.length > MAX_PROFILES) return invalid('Слишком много профилей');
  }

  const assignedProfiles = assignOrphanProfiles(profiles, splits, splitCalculations);
  profiles = assignedProfiles.profiles;
  splits = assignedProfiles.splits;
  splitCalculations = assignedProfiles.calculations;

  let activeProfileId = null;
  if (input.activeProfileId !== undefined && input.activeProfileId !== null) {
    if (typeof input.activeProfileId !== 'string' || !cleanProfileId(input.activeProfileId)) {
      return invalid('Некорректный activeProfileId');
    }
    activeProfileId = cleanProfileId(input.activeProfileId);
    if (profiles.length > 0 && !profiles.some(profile => profile.id === activeProfileId)) {
      return invalid('activeProfileId не найден среди профилей');
    }
  } else {
    activeProfileId = resolveActiveProfileId(null, profiles, activeSplitId, splits);
  }

  let activeSplitCalculationId = null;
  if (input.activeSplitCalculationId !== undefined && input.activeSplitCalculationId !== null) {
    if (
      typeof input.activeSplitCalculationId !== 'string' ||
      !input.activeSplitCalculationId.trim()
    ) {
      return invalid('Некорректный activeSplitCalculationId');
    }
    activeSplitCalculationId = input.activeSplitCalculationId.trim();
  }

  let activeProgram;
  if (input.activeProgram !== undefined) {
    if (!ACTIVE_PROGRAMS.has(input.activeProgram)) {
      return invalid('activeProgram должен быть 2.0 или 3.0');
    }
    activeProgram = input.activeProgram;
  }

  let trainingProgressByProgram;
  if (input.trainingProgressByProgram !== undefined) {
    trainingProgressByProgram = normalizeTrainingProgressByProgram(input.trainingProgressByProgram);
    if (!trainingProgressByProgram) {
      return invalid('Некорректный trainingProgressByProgram');
    }
  }

  let testResults = [];
  if (input.testResults !== undefined) {
    if (!Array.isArray(input.testResults)) return invalid('Поле testResults должно быть массивом');
    testResults = normalizeTestResultsArray(input.testResults);
    if (input.testResults.length > 0 && testResults.length === 0) {
      return invalid('Некорректные testResults');
    }
    if (testResults.length > 80) return invalid('Слишком много testResults');
  }

  let exercisesByProfileId;
  if (input.exercisesByProfileId !== undefined) {
    exercisesByProfileId = normalizeExercisesByProfileId(input.exercisesByProfileId);
    if (!isRecord(input.exercisesByProfileId)) {
      return invalid('Поле exercisesByProfileId должно быть объектом');
    }
  }

  return {
    data: buildStoredUser(
      name,
      exercises,
      trainingProgress,
      trainingPreferences,
      journal,
      splits,
      activeSplitId,
      activeProgram,
      trainingProgressByProgram,
      testResults,
      splitCalculations,
      activeSplitCalculationId,
      profiles,
      activeProfileId,
      exercisesByProfileId,
    ),
  };
}
