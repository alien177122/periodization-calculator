import type {CustomSplit} from '../types/index.ts';

/** Resolve which saved split to load from URL/active id; exported for unit tests. */
export function resolveSavedSplitSelection(
  savedSplits: CustomSplit[],
  preferredId: string | null | undefined,
  activeSplitId: string | null,
): CustomSplit | undefined {
  if (preferredId) {
    const matched = savedSplits.find(split => split.id === preferredId);
    if (matched) return matched;
    return undefined;
  }

  if (activeSplitId) {
    const matched = savedSplits.find(split => split.id === activeSplitId);
    if (matched) return matched;
  }

  return savedSplits[0];
}

/** Find a deep-link split by id across every profile, not only the active one. */
export function resolveDeepLinkSplit(
  allSplits: CustomSplit[],
  preferredId: string | null | undefined,
): CustomSplit | undefined {
  if (!preferredId) return undefined;
  return allSplits.find(split => split.id === preferredId);
}
