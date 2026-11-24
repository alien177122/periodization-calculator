import type {CustomSplit, SplitCalculation, TrainingProfile, UserData} from '../types/index.ts';

export const DEFAULT_PROFILE_ID = 'profile-osnovnoy';
export const DEFAULT_PROFILE_NAME = 'Основной';

const MAX_PROFILE_NAME = 40;
const MAX_PROFILE_ID = 80;

export interface EnsuredProfiles {
  profiles: TrainingProfile[];
  activeProfileId: string | null;
  splits: CustomSplit[];
  splitCalculations: SplitCalculation[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanId(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_PROFILE_ID) : '';
}

function cleanName(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_PROFILE_NAME) : '';
}

export function normalizeProfile(input: unknown): TrainingProfile | null {
  if (!isRecord(input)) return null;
  const id = cleanId(input.id);
  const name = cleanName(input.name);
  const createdAt = typeof input.createdAt === 'string' ? input.createdAt.trim() : '';
  const updatedAt = typeof input.updatedAt === 'string' ? input.updatedAt.trim() : '';
  if (!id || !name || !createdAt || !updatedAt) return null;
  return {id, name, createdAt, updatedAt};
}

/**
 * Keep every split. Ones without profileId share a single «Основной» profile.
 * Splits that already have profileId stay on that profile.
 */
export function ensureTrainingProfiles(user: {
  profiles?: unknown;
  splits?: CustomSplit[] | null;
  splitCalculations?: SplitCalculation[] | null;
  activeProfileId?: string | null;
  activeSplitId?: string | null;
}): EnsuredProfiles {
  const profiles: TrainingProfile[] = [];
  const seen = new Set<string>();
  const rawProfiles = Array.isArray(user.profiles) ? user.profiles : [];
  for (const entry of rawProfiles) {
    const profile = normalizeProfile(entry);
    if (!profile || seen.has(profile.id)) continue;
    seen.add(profile.id);
    profiles.push(profile);
  }

  const splits = (user.splits ?? []).map(split => ({...split}));
  const splitCalculations = (user.splitCalculations ?? []).map(entry => ({
    ...entry,
    splitId: entry.splitId ?? entry.split?.id,
    split: {...entry.split},
  }));

  const orphans = [
    ...splits.filter(split => !cleanId(split.profileId)),
    ...splitCalculations.map(entry => entry.split).filter(split => !cleanId(split.profileId)),
  ];

  let defaultProfile = profiles.find(profile => profile.name === DEFAULT_PROFILE_NAME);
  if (orphans.length > 0) {
    if (!defaultProfile) {
      const stamp = orphans[0]?.createdAt || new Date(0).toISOString();
      let id = DEFAULT_PROFILE_ID;
      if (seen.has(id)) id = `${DEFAULT_PROFILE_ID}-${orphans[0]?.id ?? 'split'}`;
      defaultProfile = {
        id,
        name: DEFAULT_PROFILE_NAME,
        createdAt: stamp,
        updatedAt: stamp,
      };
      profiles.unshift(defaultProfile);
      seen.add(defaultProfile.id);
    }
    for (const split of splits) {
      if (!cleanId(split.profileId)) split.profileId = defaultProfile.id;
    }
    for (const entry of splitCalculations) {
      if (!cleanId(entry.split.profileId)) entry.split.profileId = defaultProfile.id;
    }
  } else {
    for (const split of splits) {
      const profileId = cleanId(split.profileId);
      if (profileId) split.profileId = profileId;
    }
    for (const entry of splitCalculations) {
      const profileId = cleanId(entry.split.profileId);
      if (profileId) entry.split.profileId = profileId;
    }
  }

  for (const split of [...splits, ...splitCalculations.map(entry => entry.split)]) {
    const profileId = cleanId(split.profileId);
    if (!profileId || seen.has(profileId)) continue;
    profiles.push({
      id: profileId,
      name: 'Профиль',
      createdAt: split.createdAt,
      updatedAt: split.updatedAt || split.createdAt,
    });
    seen.add(profileId);
  }

  let activeProfileId = cleanId(user.activeProfileId);
  if (!activeProfileId || !seen.has(activeProfileId)) {
    const activeSplit = splits.find(split => split.id === user.activeSplitId);
    const fromSplit = cleanId(activeSplit?.profileId);
    activeProfileId = fromSplit && seen.has(fromSplit) ? fromSplit : (profiles[0]?.id ?? '');
  }

  return {
    profiles,
    activeProfileId: activeProfileId || null,
    splits,
    splitCalculations,
  };
}

/** Replace one split and keep every other profile's splits. */
export function upsertSplit(allSplits: readonly CustomSplit[], draft: CustomSplit): CustomSplit[] {
  return [...allSplits.filter(split => split.id !== draft.id), draft];
}

export function profileNameOrFallback(name: string, profileId: string): string {
  const trimmed = name.trim().slice(0, MAX_PROFILE_NAME);
  if (trimmed) return trimmed;
  return profileId === DEFAULT_PROFILE_ID ? DEFAULT_PROFILE_NAME : 'Профиль';
}

export function withEnsuredProfiles(user: UserData): UserData {
  const ensured = ensureTrainingProfiles(user);
  if (ensured.profiles.length === 0) return user;
  return {
    ...user,
    profiles: ensured.profiles,
    activeProfileId: ensured.activeProfileId,
    splits: ensured.splits,
    ...(user.splitCalculations ? {splitCalculations: ensured.splitCalculations} : {}),
  };
}
