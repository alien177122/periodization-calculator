import type {SavedExercise, UserData} from '../types/index.ts';
import {DEFAULT_PROFILE_ID, ensureTrainingProfiles} from './training-profiles.ts';

const MAX_EXERCISES = 200;

function cloneExercises(list: SavedExercise[]): SavedExercise[] {
  return list.map(entry => ({...entry}));
}

/** Merge legacy global exercises into per-profile storage on read. */
export function ensureExercisesByProfile(user: UserData): Record<string, SavedExercise[]> {
  const ensured = ensureTrainingProfiles(user);
  const map: Record<string, SavedExercise[]> = {...(user.exercisesByProfileId ?? {})};

  for (const profile of ensured.profiles) {
    if (!map[profile.id]) map[profile.id] = [];
  }

  const legacy = user.exercises ?? [];
  if (legacy.length === 0) return map;

  const targetId = ensured.activeProfileId ?? ensured.profiles[0]?.id ?? DEFAULT_PROFILE_ID;
  const existing = map[targetId] ?? [];
  if (existing.length === 0) {
    map[targetId] = cloneExercises(legacy);
  }

  return map;
}

export function getProfileExercises(user: UserData, profileId: string): SavedExercise[] {
  const map = ensureExercisesByProfile(user);
  return map[profileId] ?? [];
}

export function upsertProfileExercise(
  user: UserData,
  profileId: string,
  saved: SavedExercise,
): UserData {
  const map = ensureExercisesByProfile(user);
  const list = [
    ...(map[profileId] ?? []).filter(e => e.exerciseKey !== saved.exerciseKey),
    saved,
  ].slice(0, MAX_EXERCISES);
  return {
    ...user,
    exercisesByProfileId: {...map, [profileId]: list},
  };
}

export function removeProfileExercises(user: UserData, profileId: string): UserData {
  if (!user.exercisesByProfileId?.[profileId]) return user;
  const next = {...user.exercisesByProfileId};
  delete next[profileId];
  return {
    ...user,
    exercisesByProfileId: Object.keys(next).length > 0 ? next : undefined,
  };
}
