import {animate} from 'framer-motion';
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {PointerEvent, RefObject} from 'react';
import type {SheetDetent} from './sheetPhysics.ts';
import {
  SHEET_HYSTERESIS_PX,
  SHEET_REDUCED_MOTION_MS,
  applyRubberY,
  buildSheetLayout,
  detentForRestY,
  resolveSheetRelease,
  sheetMotionMode,
} from './sheetPhysics.ts';

type AnimationPlayback = {stop: () => void};

export interface UseSheetGestureOptions {
  open: boolean;
  detents: readonly SheetDetent[];
  initialDetent: SheetDetent;
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLElement | null>;
  headerRef: RefObject<HTMLElement | null>;
  bodyRef: RefObject<HTMLElement | null>;
  grabberRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
  onExited: () => void;
}

interface PointerSample {
  y: number;
  t: number;
}

function viewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight;
}

function velocityFromSamples(samples: readonly PointerSample[]): number {
  if (samples.length < 2) return 0;
  const first = samples[0];
  const last = samples[samples.length - 1];
  const dt = last.t - first.t;
  if (dt <= 0) return 0;
  return ((last.y - first.y) / dt) * 1000;
}

export function useSheetGesture({
  open,
  detents,
  initialDetent,
  reducedMotion,
  sheetRef,
  headerRef,
  bodyRef,
  grabberRef,
  onDismiss,
  onExited,
}: UseSheetGestureOptions) {
  const layout = buildSheetLayout(detents, typeof window === 'undefined' ? 800 : viewportHeight());
  const startDetent = detents.includes(initialDetent) ? initialDetent : (detents[0] ?? 'medium');
  const [y, setY] = useState(layout.dismissY);
  const [detent, setDetent] = useState<SheetDetent>(startDetent);
  const [dragging, setDragging] = useState(false);
  const [maxHeight, setMaxHeight] = useState(layout.maxHeight);

  const yRef = useRef(y);
  const detentRef = useRef(detent);
  const layoutRef = useRef(layout);
  const draggingRef = useRef(false);
  const animationRef = useRef<AnimationPlayback | null>(null);
  const samplesRef = useRef<PointerSample[]>([]);
  const startPointerYRef = useRef(0);
  const startSheetYRef = useRef(0);
  const startRestYRef = useRef(layout.restYByDetent[startDetent]);
  const pendingRef = useRef<{pointerId: number; y: number} | null>(null);
  const openRef = useRef(open);
  const exitedRef = useRef(false);
  const prevOpenRef = useRef<boolean | null>(null);
  const exitTimerRef = useRef<number>(0);
  const detentsRef = useRef(detents);
  const onDismissRef = useRef(onDismiss);
  const onExitedRef = useRef(onExited);

  useLayoutEffect(() => {
    yRef.current = y;
    detentRef.current = detent;
    openRef.current = open;
    detentsRef.current = detents;
    onDismissRef.current = onDismiss;
    onExitedRef.current = onExited;
  });

  const stopAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  const springTo = useCallback(
    (target: number, velocity: number, duration: number, onComplete?: () => void) => {
      stopAnimation();
      if (sheetMotionMode(reducedMotion) === 'fade') {
        yRef.current = target;
        setY(target);
        onComplete?.();
        return;
      }
      const playback = animate(yRef.current, target, {
        type: 'spring',
        bounce: 0,
        duration,
        velocity,
        onUpdate: latest => {
          yRef.current = latest;
          setY(latest);
        },
        onComplete: () => {
          animationRef.current = null;
          yRef.current = target;
          setY(target);
          onComplete?.();
        },
      });
      animationRef.current = playback;
    },
    [reducedMotion, stopAnimation],
  );

  const measure = useCallback(() => {
    const next = buildSheetLayout(detentsRef.current, viewportHeight());
    layoutRef.current = next;
    setMaxHeight(next.maxHeight);
    return next;
  }, []);

  useLayoutEffect(() => {
    const next = measure();
    const restY = next.restYByDetent[detentRef.current] ?? next.restYs[0] ?? 0;
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (open) {
      exitedRef.current = false;
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = 0;
      }
      if (wasOpen === true) return;
      if (sheetMotionMode(reducedMotion) === 'fade') {
        yRef.current = restY;
        setY(restY);
        return;
      }
      yRef.current = next.dismissY;
      setY(next.dismissY);
      springTo(restY, 0, 0.4);
      return;
    }

    if (wasOpen !== true) {
      yRef.current = next.dismissY;
      setY(next.dismissY);
      return;
    }

    if (sheetMotionMode(reducedMotion) === 'fade') {
      yRef.current = restY;
      setY(restY);
      if (!exitedRef.current) {
        exitTimerRef.current = window.setTimeout(() => {
          exitTimerRef.current = 0;
          if (!exitedRef.current) {
            exitedRef.current = true;
            onExitedRef.current();
          }
        }, SHEET_REDUCED_MOTION_MS);
      }
      return;
    }
    springTo(next.dismissY, 0, 0.25, () => {
      if (!exitedRef.current) {
        exitedRef.current = true;
        onExitedRef.current();
      }
    });
  }, [measure, open, reducedMotion, springTo]);

  useEffect(() => {
    const onResize = () => {
      if (draggingRef.current) return;
      const next = measure();
      const restY = next.restYByDetent[detentRef.current] ?? next.restYs[0] ?? 0;
      if (!openRef.current) {
        yRef.current = next.dismissY;
        setY(next.dismissY);
        return;
      }
      yRef.current = restY;
      setY(restY);
    };
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, [measure]);

  useEffect(
    () => () => {
      stopAnimation();
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    },
    [stopAnimation],
  );

  const beginDrag = useCallback(
    (pointerY: number, pointerId: number, target: HTMLElement) => {
      stopAnimation();
      draggingRef.current = true;
      setDragging(true);
      startPointerYRef.current = pointerY;
      startSheetYRef.current = yRef.current;
      startRestYRef.current =
        layoutRef.current.restYByDetent[detentRef.current] ?? layoutRef.current.restYs[0] ?? 0;
      samplesRef.current = [{y: pointerY, t: performance.now()}];
      pendingRef.current = null;
      if (target.hasPointerCapture?.(pointerId) !== true) {
        target.setPointerCapture(pointerId);
      }
    },
    [stopAnimation],
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      const target = event.target as Node;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const fromHandle =
        Boolean(grabberRef.current?.contains(target)) ||
        Boolean(headerRef.current?.contains(target));
      const fromBody = Boolean(bodyRef.current?.contains(target));
      if (fromHandle) {
        event.preventDefault();
        beginDrag(event.clientY, event.pointerId, sheet);
        return;
      }
      if (fromBody) {
        pendingRef.current = {pointerId: event.pointerId, y: event.clientY};
      }
    },
    [beginDrag, bodyRef, grabberRef, headerRef, sheetRef],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const pending = pendingRef.current;
      if (pending && pending.pointerId === event.pointerId && !draggingRef.current) {
        const dy = event.clientY - pending.y;
        const scrollTop = bodyRef.current?.scrollTop ?? 0;
        if (scrollTop > 0 || dy < -SHEET_HYSTERESIS_PX) {
          pendingRef.current = null;
          return;
        }
        if (dy > SHEET_HYSTERESIS_PX && sheetRef.current) {
          event.preventDefault();
          beginDrag(pending.y, event.pointerId, sheetRef.current);
        } else {
          return;
        }
      }
      if (!draggingRef.current) return;
      event.preventDefault();
      const rawY = startSheetYRef.current + (event.clientY - startPointerYRef.current);
      const {restYs, dismissY, maxHeight: dim} = layoutRef.current;
      const minY = restYs[0] ?? 0;
      const nextY = applyRubberY(rawY, minY, dismissY, dim);
      yRef.current = nextY;
      setY(nextY);
      const samples = samplesRef.current;
      samples.push({y: event.clientY, t: performance.now()});
      if (samples.length > 5) samples.shift();
    },
    [beginDrag, bodyRef, sheetRef],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      pendingRef.current = null;
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      const sheet = sheetRef.current;
      if (sheet?.hasPointerCapture(event.pointerId)) {
        sheet.releasePointerCapture(event.pointerId);
      }
      const velocityY = velocityFromSamples(samplesRef.current);
      samplesRef.current = [];
      const currentY = yRef.current;
      const dy = currentY - startRestYRef.current;
      const decision = resolveSheetRelease({
        dy,
        velocityY,
        currentY,
        restYs: layoutRef.current.restYs,
        dismissY: layoutRef.current.dismissY,
      });
      if (decision === 'dismiss') {
        onDismissRef.current();
        return;
      }
      const nextDetent = detentForRestY(
        decision,
        layoutRef.current.restYByDetent,
        detentsRef.current,
      );
      setDetent(nextDetent);
      detentRef.current = nextDetent;
      springTo(decision, velocityY, 0.4);
    },
    [sheetRef, springTo],
  );

  return {
    y,
    detent,
    dragging,
    maxHeight,
    motionMode: sheetMotionMode(reducedMotion),
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };
}
