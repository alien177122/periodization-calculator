/**
 * Сравнение циклов (Фаза 10 плана training-minimal).
 *
 * Цикл = 4 недели от даты первой сессии упражнения.
 * Тест-окно = последние 7 дней блока.
 */

import type {JournalSession} from '../types/index.ts';
import {sessionPeakWithReserve} from './reserve.ts';

export interface CyclePoint {
  cycle: number;
  raw: number;
  adjusted: number | null;
  rir: number | null;
  deltaRaw: number | null;
  deltaAdjusted: number | null;
}

const CYCLE_DAYS = 28;
const TEST_WINDOW_DAYS = 7;

function parseDate(s: string): number {
  const d = new Date(s + 'T00:00:00Z');
  return Number.isFinite(d.getTime()) ? d.getTime() : 0;
}

export function buildCycleSeries(sessions: JournalSession[]): CyclePoint[] {
  if (!sessions || sessions.length === 0) return [];
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const first = parseDate(sorted[0].date);
  if (!first) return [];

  // group sessions by cycle
  const cycles = new Map<number, JournalSession[]>();
  for (const s of sorted) {
    const days = Math.floor((parseDate(s.date) - first) / (24 * 60 * 60 * 1000));
    const cycle = Math.floor(days / CYCLE_DAYS) + 1;
    if (!cycles.has(cycle)) cycles.set(cycle, []);
    cycles.get(cycle)!.push(s);
  }

  const result: CyclePoint[] = [];
  let prevRaw: number | null = null;
  let prevAdjusted: number | null = null;

  for (const [cycle, sess] of [...cycles.entries()].sort((a, b) => a[0] - b[0])) {
    // test window: last 7 days of the cycle
    const cycleStart = first + (cycle - 1) * CYCLE_DAYS * 24 * 60 * 60 * 1000;
    const windowStart = cycleStart + (CYCLE_DAYS - TEST_WINDOW_DAYS) * 24 * 60 * 60 * 1000;
    const windowSessions = sess.filter(s => parseDate(s.date) >= windowStart);

    let raw = 0;
    let adjusted: number | null = null;
    let rir: number | null = null;
    for (const s of windowSessions.length > 0 ? windowSessions : sess) {
      const peak = sessionPeakWithReserve(s.sets);
      if (!peak) continue;
      if (peak.raw > raw) raw = peak.raw;
      if (peak.adjusted != null && (adjusted == null || peak.adjusted > adjusted)) {
        adjusted = peak.adjusted;
        rir = peak.rir;
      }
    }

    result.push({
      cycle,
      raw: Math.round(raw * 10) / 10,
      adjusted,
      rir,
      deltaRaw: prevRaw != null ? Math.round((raw - prevRaw) * 10) / 10 : null,
      deltaAdjusted: prevAdjusted != null && adjusted != null
        ? Math.round((adjusted - prevAdjusted) * 10) / 10
        : null,
    });

    prevRaw = raw;
    if (adjusted != null) prevAdjusted = adjusted;
  }

  return result;
}