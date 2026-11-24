import {useMemo} from 'react';
import {buildDayPreview} from '@training/shared/utils/split-constructor';
import {splitDayNumbers} from '@training/shared/utils/split-weight-readiness';
import type {CustomSplit, SavedExercise} from '../types';

const WEEK_COUNT = 8;

export interface SplitForecastWeek {
  week: number;
  tonnage: number;
  x: number;
  y: number;
  barX: number;
  barY: number;
  barHeight: number;
}

export interface SplitForecastChartModel {
  weeks: SplitForecastWeek[];
  minTonnage: number;
  maxTonnage: number;
  hasExercises: boolean;
  viewBox: string;
  grid: number[];
  linePath: string;
  areaPath: string;
}

/** Same plot box as PeriodizationChart / `.ta-period` (viewBox 800×280). */
const VIEW = {left: 56, right: 56, top: 28, bottom: 238, width: 800, barWidth: 40};

function linePath(points: Array<{x: number; y: number}>): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function areaPath(points: Array<{x: number; y: number}>): string {
  if (points.length === 0) return '';
  const base = VIEW.bottom;
  return `${linePath(points)} L ${points[points.length - 1].x.toFixed(1)} ${base} L ${points[0].x.toFixed(1)} ${base} Z`;
}

function plotY(value: number, min: number, span: number): number {
  return VIEW.bottom - ((value - min) / span) * (VIEW.bottom - VIEW.top);
}

export function buildSplitForecastChart(
  split: CustomSplit,
  savedExercises: SavedExercise[],
): SplitForecastChartModel {
  const chartWidth = VIEW.width - VIEW.left - VIEW.right;
  const stepX = chartWidth / Math.max(1, WEEK_COUNT - 1);
  const days = splitDayNumbers(split);

  const weeksDraft: Array<{week: number; tonnage: number}> = [];
  let hasExercises = false;
  for (let weekIndex = 0; weekIndex < WEEK_COUNT; weekIndex += 1) {
    let tonnage = 0;
    for (const day of days) {
      const rows = buildDayPreview({split, dayNumber: day, weekIndex, savedExercises});
      if (rows.length > 0) hasExercises = true;
      for (const row of rows) {
        tonnage += row.weight * row.scheme.reps * row.scheme.sets;
      }
    }
    weeksDraft.push({week: weekIndex + 1, tonnage});
  }

  const tonnages = weeksDraft.map(entry => entry.tonnage);
  const maxTonnage = tonnages.length ? Math.max(...tonnages) : 0;
  const minTonnage = tonnages.length ? Math.min(...tonnages) : 0;
  const plotMin = maxTonnage - minTonnage < 1 ? 0 : minTonnage;
  const plotMax = Math.max(maxTonnage, 1);
  const span = Math.max(plotMax - plotMin, 1);
  const chartHeight = VIEW.bottom - VIEW.top;

  const weeks: SplitForecastWeek[] = weeksDraft.map((entry, index) => {
    const x = VIEW.left + stepX * index;
    const y = plotY(entry.tonnage, plotMin, span);
    const barHeight = VIEW.bottom - y;
    return {
      ...entry,
      x,
      y,
      barX: x - VIEW.barWidth / 2,
      barY: y,
      barHeight,
    };
  });

  const tonnagePoints = weeks.map(({x, y}) => ({x, y}));

  return {
    weeks,
    minTonnage,
    maxTonnage,
    hasExercises,
    viewBox: `0 0 ${VIEW.width} 280`,
    grid: Array.from({length: 7}, (_, i) => VIEW.top + i * (chartHeight / 6)),
    linePath: linePath(tonnagePoints),
    areaPath: areaPath(tonnagePoints),
  };
}

export function useSplitForecastChart(
  split: CustomSplit,
  savedExercises: SavedExercise[],
): SplitForecastChartModel {
  return useMemo(() => buildSplitForecastChart(split, savedExercises), [savedExercises, split]);
}
