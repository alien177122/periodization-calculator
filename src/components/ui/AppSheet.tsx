import {useCallback, useEffect, useId, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {useBodyScrollLock} from '../../hooks/useBodyScrollLock.ts';
import {useSheetGesture} from '../../hooks/useSheetGesture.ts';
import type {SheetDetent} from '../../hooks/sheetPhysics.ts';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DEFAULT_DETENTS = ['medium', 'large'] as const;

export interface AppSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  detents?: readonly SheetDetent[];
  initialDetent?: SheetDetent;
  dismissOnScrim?: boolean;
  children: ReactNode;
}

function focusableIn(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    node => node.tabIndex >= 0 && !node.closest('[aria-hidden="true"]'),
  );
}

export function AppSheet({
  open,
  onClose,
  title,
  ariaLabel,
  detents = DEFAULT_DETENTS,
  initialDetent = 'medium',
  dismissOnScrim = true,
  children,
}: AppSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const grabberRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  if (open && !mounted) {
    setMounted(true);
  }

  const onExited = useCallback(() => {
    setMounted(false);
  }, []);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (open) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      return;
    }
    if (!mounted) restoreFocusRef.current?.focus();
  }, [mounted, open]);

  const gesture = useSheetGesture({
    open,
    detents,
    initialDetent,
    reducedMotion,
    sheetRef,
    headerRef,
    bodyRef,
    grabberRef,
    onDismiss: onClose,
    onExited,
  });

  useBodyScrollLock(mounted);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!mounted || !open) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const nodes = focusableIn(sheet);
    const initial =
      sheet.querySelector<HTMLElement>('input, textarea, select') ?? nodes[0] ?? sheet;
    initial.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = focusableIn(sheet);
      if (focusable.length === 0) {
        event.preventDefault();
        sheet.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !sheet.contains(active))) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && (active === last || !sheet.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mounted, open]);

  if (!mounted || typeof document === 'undefined') return null;

  const labelProps = title ? {'aria-labelledby': titleId} : {'aria-label': ariaLabel ?? 'Диалог'};
  const travel = gesture.motionMode === 'travel';

  return createPortal(
    <div className={`app-sheet-root${open ? ' is-open' : ''}`} data-reduced-motion={reducedMotion}>
      <button
        type="button"
        className="app-sheet-backdrop"
        aria-label="Закрыть"
        tabIndex={-1}
        onClick={dismissOnScrim ? onClose : undefined}
      />
      <section
        ref={sheetRef}
        className={`app-sheet${gesture.dragging ? ' is-dragging' : ''}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-detent={gesture.detent}
        style={{
          height: `${gesture.maxHeight}px`,
          transform: travel ? `translate3d(0, ${gesture.y}px, 0)` : 'none',
        }}
        onPointerDown={gesture.onPointerDown}
        onPointerMove={gesture.onPointerMove}
        onPointerUp={gesture.onPointerUp}
        onPointerCancel={gesture.onPointerCancel}
        {...labelProps}>
        <button
          ref={grabberRef}
          type="button"
          className="app-sheet__grabber"
          aria-label="Закрыть"
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onClose();
            }
          }}>
          <span className="app-sheet__grabber-bar" />
        </button>
        <header ref={headerRef} className="app-sheet__header">
          {title ? (
            <h2 id={titleId} className="app-sheet__title">
              {title}
            </h2>
          ) : (
            <span className="app-sheet__title" />
          )}
          <button type="button" className="app-sheet__close" onClick={onClose}>
            Закрыть
          </button>
        </header>
        <div ref={bodyRef} className="app-sheet__body">
          {children}
        </div>
      </section>
    </div>,
    document.body,
  );
}
