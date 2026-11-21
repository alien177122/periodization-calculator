import {useMemo} from 'react';
import type {JournalSession} from '../types/index.ts';
import {
  sessionPeak,
  sessionHasWeights,
  sessionTopWeight,
  sessionTotalReps,
  sessionVolume,
} from '../utils/journalMetrics.ts';
import {sessionPeakWithReserve} from '../utils/reserve.ts';

const VIEW = {left: 56, right: 56, top: 28, bottom: 238, width: 800, barWidth: 40};
const DEFAULT_WEEK_COUNT = 8;
/** Horizontal Y-grid + left-axis labels — denser than 4, still readable (~35px gaps). */
const Y_GRID_COUNT = 7;
const Y_GRID_DIVISIONS = Y_GRID_COUNT - 1;
/** Extra SVG height under the plot for date + rest-gap labels. */
const VIEW_HEIGHT = 296;
const MS_PER_DAY = 86_400_000;

function calendarDaysBetween(prevDate: string, nextDate: string): number | null {
  const prev = Date.parse(`${prevDate}T12:00:00`);
  const next = Date.parse(`${nextDate}T12:00:00`);
  if (!Number.isFinite(prev) || !Number.isFinite(next)) return null;
  return Math.max(0, Math.round((next - prev) / MS_PER_DAY));
}

export interface JournalChartWeek {
  week: number;
  date: string | null;
  peak: number | null;
  peakAdjusted: number | null;
  rir: number | null;
  topWeight: number | null;
  totalReps: number | null;
  volume: number | null;
  setCount: number;
  hasData: boolean;
  /** Calendar days since the previous plotted session; null for the first. */
  restDaysSincePrev: number | null;
  x: number;
  y: number | null;
  yAdjusted: number | null;
  barX: number;
  barY: number | null;
  barHeight: number | null;
}

export interface JournalProgressChartModel {
  weekCount: number;
  journalWeeks: JournalChartWeek[];
  journalLinePath: string;
  journalAdjustedLinePath: string;
  viewBox: string;
  grid: number[];
  weightTicks: {y: number; value: number}[];
  latestPeak: number | null;
}

function linePath(points: {x: number; y: number}[]): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function mapSessionsToWeeks(
  sessions: JournalSession[],
  weekCount: number,
): Map<number, JournalSession> {
  const sorted = [...sessions]
    .filter(sessionHasWeights)
    .sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-weekCount);
  const map = new Map<number, JournalSession>();
  recent.forEach((session, index) => {
    map.set(index + 1, session);
  });
  return map;
}

export function buildJournalProgressChartModel(
  sessions: JournalSession[],
  weekCount: number = DEFAULT_WEEK_COUNT,
): JournalProgressChartModel {
  const slots = Math.max(weekCount, 1);
  const chartWidth = VIEW.width - VIEW.left - VIEW.right;
  const stepX = chartWidth / Math.max(1, slots - 1);
  const chartHeight = VIEW.bottom - VIEW.top;
  const sessionByWeek = mapSessionsToWeeks(sessions, slots);

  const journalPeaks = [...sessionByWeek.values()].map(session => sessionPeak(session.sets));
  const journalAdjustedPeaks = [...sessionByWeek.values()].map(session => sessionPeakWithReserve(session.sets)?.adjusted ?? null);
  const journalVolumes = [...sessionByWeek.values()].map(session => sessionVolume(session.sets));
  const maxJournalVolume = Math.max(...journalVolumes, 1);

  const allWeightValues = [...journalPeaks, ...journalAdjustedPeaks].filter(
    (value): value is number => Number.isFinite(value) && (value ?? 0) > 0,
  );
  const minWeight = allWeightValues.length ? Math.min(...allWeightValues) : 0;
  const maxWeight = allWeightValues.length ? Math.max(...allWeightValues) : 1;
  const weightSpan = Math.max(maxWeight - minWeight, 1);
  const weightTicks = Array.from({length: Y_GRID_COUNT}, (_, index) => {
    const ratio = 1 - index / Y_GRID_DIVISIONS;
    return {
      y: VIEW.top + index * (chartHeight / Y_GRID_DIVISIONS),
      value: Math.round((minWeight + weightSpan * ratio) * 10) / 10,
    };
  });

  const journalWeeks: JournalChartWeek[] = Array.from({length: slots}, (_, index) => {
    const week = index + 1;
    const session = sessionByWeek.get(week);
    const x = VIEW.left + stepX * index;
    const prevSession = index > 0 ? sessionByWeek.get(week - 1) : undefined;
    const restDaysSincePrev =
      session && prevSession
        ? calendarDaysBetween(prevSession.date, session.date)
        : null;

    if (!session) {
      return {
        week,
        date: null,
        peak: null,
        peakAdjusted: null,
        rir: null,
        topWeight: null,
        totalReps: null,
        volume: null,
        setCount: 0,
        hasData: false,
        restDaysSincePrev: null,
        x,
        y: null,
        yAdjusted: null,
        barX: x - VIEW.barWidth / 2,
        barY: null,
        barHeight: null,
      };
    }

    const peak = sessionPeak(session.sets);
    const reserve = sessionPeakWithReserve(session.sets);
    const peakAdjusted = reserve?.adjusted ?? null;
    const rir = reserve?.rir ?? null;
    const totalReps = sessionTotalReps(session.sets);
    const volume = sessionVolume(session.sets);
    const barHeight = (volume / maxJournalVolume) * chartHeight;

    return {
      week,
      date: session.date,
      peak,
      peakAdjusted,
      rir,
      topWeight: sessionTopWeight(session.sets),
      totalReps,
      volume,
      setCount: session.sets.length,
      hasData: true,
      restDaysSincePrev,
      x,
      y: VIEW.bottom - ((peak - minWeight) / weightSpan) * chartHeight,
      yAdjusted:
        peakAdjusted != null
          ? VIEW.bottom - ((peakAdjusted - minWeight) / weightSpan) * chartHeight
          : null,
      barX: x - VIEW.barWidth / 2,
      barY: VIEW.bottom - barHeight,
      barHeight,
    };
  });

  const journalPoints = journalWeeks
    .filter(week => week.hasData && week.y != null)
    .map(week => ({x: week.x, y: week.y!}));

  const journalAdjustedPoints = journalWeeks
    .filter(week => week.hasData && week.yAdjusted != null)
    .map(week => ({x: week.x, y: week.yAdjusted!}));

  const latestWithData = [...journalWeeks]
    .reverse()
    .find(week => week.hasData && week.peak != null);

  return {
    weekCount: slots,
    journalWeeks,
    journalLinePath: linePath(journalPoints),
    journalAdjustedLinePath: linePath(journalAdjustedPoints),
    viewBox: `0 0 ${VIEW.width} ${VIEW_HEIGHT}`,
    grid: Array.from(
      {length: Y_GRID_COUNT},
      (_, i) => VIEW.top + i * (chartHeight / Y_GRID_DIVISIONS),
    ),
    weightTicks,
    latestPeak: latestWithData?.peak ?? null,
  };
}

export function useJournalProgressChart(sessions: JournalSession[]) {
  return useMemo(() => buildJournalProgressChartModel(sessions), [sessions]);
}
