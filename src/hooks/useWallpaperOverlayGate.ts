import {useEffect, useSyncExternalStore} from 'react';

/** Selectors for UI stacked above the wallpaper (modals, sheets) — not the login form itself. */
const BLOCKING_OVERLAY_SELECTORS = [
  '[role="dialog"]',
  '[aria-modal="true"]',
  '.split-hub__sheet-backdrop',
  '.progression-dialog-backdrop',
  '.split-calculation-delete-dialog',
] as const;

const OVERLAY_OBSERVE_OPTIONS: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'style', 'aria-hidden', 'open', 'hidden'],
};

function isElementVisible(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest('[aria-hidden="true"]')) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const opacity = Number.parseFloat(style.opacity);
  if (!Number.isNaN(opacity) && opacity === 0) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function hasBlockingUiOverlay(root: ParentNode = document): boolean {
  for (const selector of BLOCKING_OVERLAY_SELECTORS) {
    for (const node of root.querySelectorAll(selector)) {
      if (isElementVisible(node)) return true;
    }
  }
  return false;
}

function subscribeOverlays(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, OVERLAY_OBSERVE_OPTIONS);
  window.addEventListener('focus', onStoreChange);
  document.addEventListener('focusin', onStoreChange);
  return () => {
    observer.disconnect();
    window.removeEventListener('focus', onStoreChange);
    document.removeEventListener('focusin', onStoreChange);
  };
}

function subscribeDisabled(): () => void {
  return () => {};
}

function getOverlaySnapshot(): boolean {
  return hasBlockingUiOverlay(document);
}

function getDisabledSnapshot(): boolean {
  return false;
}

/**
 * True when wallpaper video may play with sound (no modal / sheet stacked above wallpaper).
 */
export function useWallpaperOverlayGate(enabled: boolean): boolean {
  const blocked = useSyncExternalStore(
    enabled ? subscribeOverlays : subscribeDisabled,
    enabled ? getOverlaySnapshot : getDisabledSnapshot,
    getDisabledSnapshot,
  );

  useEffect(() => {
    if (!enabled || blocked) {
      if (!enabled) {
        document.documentElement.removeAttribute('data-wallpaper-audio-blocked');
        return;
      }
      document.documentElement.setAttribute('data-wallpaper-audio-blocked', 'true');
      return;
    }
    document.documentElement.removeAttribute('data-wallpaper-audio-blocked');
  }, [blocked, enabled]);

  return enabled && !blocked;
}
