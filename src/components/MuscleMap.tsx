import {useMemo, useState} from 'react';
import type {SVGProps} from 'react';
import {MUSCLE_META, MUSCLE_ORDER} from '@training/shared/data/muscles';
import {
  MUSCLE_MAPS,
  MUSCLE_EXTRA_LABELS,
  sourceBadge,
} from '../data/muscleMaps';
import {EXERCISE_INSIGHTS} from '../data/exerciseInsights';
import '../styles/components/calculator/muscle-map.css';

interface Zone {
  muscle: string;
  shape: 'rect' | 'ellipse';
  x: number;
  y: number;
  w?: number;
  h?: number;
  rx?: number;
  r?: number;
}

const BODY_BASE: Zone[] = [
  {muscle: '', shape: 'ellipse', x: 45, y: 14, r: 9},
  {muscle: '', shape: 'rect', x: 41, y: 23, w: 8, h: 7, rx: 2},
  {muscle: '', shape: 'rect', x: 27, y: 29, w: 36, h: 52, rx: 8},
  {muscle: '', shape: 'rect', x: 14, y: 34, w: 9, h: 44, rx: 4.5},
  {muscle: '', shape: 'rect', x: 67, y: 34, w: 9, h: 44, rx: 4.5},
  {muscle: '', shape: 'ellipse', x: 18.5, y: 82, r: 4},
  {muscle: '', shape: 'ellipse', x: 71.5, y: 82, r: 4},
  {muscle: '', shape: 'rect', x: 30, y: 80, w: 30, h: 16, rx: 6},
  {muscle: '', shape: 'rect', x: 31, y: 96, w: 11, h: 52, rx: 5.5},
  {muscle: '', shape: 'rect', x: 48, y: 96, w: 11, h: 52, rx: 5.5},
  {muscle: '', shape: 'rect', x: 31, y: 150, w: 11, h: 8, rx: 3},
  {muscle: '', shape: 'rect', x: 48, y: 150, w: 11, h: 8, rx: 3},
];

const FRONT_ZONES: Zone[] = [
  {muscle: 'chest', shape: 'rect', x: 30, y: 36, w: 14, h: 15, rx: 4},
  {muscle: 'chest', shape: 'rect', x: 46, y: 36, w: 14, h: 15, rx: 4},
  {muscle: 'front_delt', shape: 'ellipse', x: 27, y: 37, r: 5.5},
  {muscle: 'front_delt', shape: 'ellipse', x: 63, y: 37, r: 5.5},
  {muscle: 'biceps', shape: 'rect', x: 15, y: 42, w: 7, h: 16, rx: 3.5},
  {muscle: 'biceps', shape: 'rect', x: 68, y: 42, w: 7, h: 16, rx: 3.5},
  {muscle: 'quads', shape: 'rect', x: 32, y: 98, w: 9, h: 28, rx: 4.5},
  {muscle: 'quads', shape: 'rect', x: 49, y: 98, w: 9, h: 28, rx: 4.5},
  {muscle: 'calves', shape: 'rect', x: 33, y: 128, w: 8, h: 18, rx: 4},
  {muscle: 'calves', shape: 'rect', x: 49, y: 128, w: 8, h: 18, rx: 4},
];

const BACK_ZONES: Zone[] = [
  {muscle: 'traps', shape: 'rect', x: 33, y: 29, w: 24, h: 10, rx: 4},
  {muscle: 'rear_delt', shape: 'ellipse', x: 27, y: 37, r: 5.5},
  {muscle: 'rear_delt', shape: 'ellipse', x: 63, y: 37, r: 5.5},
  {muscle: 'lats', shape: 'rect', x: 29, y: 42, w: 13, h: 22, rx: 5},
  {muscle: 'lats', shape: 'rect', x: 48, y: 42, w: 13, h: 22, rx: 5},
  {muscle: 'triceps', shape: 'rect', x: 15, y: 42, w: 7, h: 18, rx: 3.5},
  {muscle: 'triceps', shape: 'rect', x: 68, y: 42, w: 7, h: 18, rx: 3.5},
  {muscle: 'glutes', shape: 'rect', x: 31, y: 82, w: 13, h: 14, rx: 5},
  {muscle: 'glutes', shape: 'rect', x: 46, y: 82, w: 13, h: 14, rx: 5},
  {muscle: 'hamstrings', shape: 'rect', x: 32, y: 98, w: 9, h: 28, rx: 4.5},
  {muscle: 'hamstrings', shape: 'rect', x: 49, y: 98, w: 9, h: 28, rx: 4.5},
  {muscle: 'calves', shape: 'rect', x: 33, y: 128, w: 8, h: 18, rx: 4},
  {muscle: 'calves', shape: 'rect', x: 49, y: 128, w: 8, h: 18, rx: 4},
];

function zoneNode(zone: Zone, props: SVGProps<SVGRectElement | SVGEllipseElement>, key: string) {
  if (zone.shape === 'ellipse') {
    return (
      <ellipse
        key={key}
        cx={zone.x}
        cy={zone.y}
        rx={zone.r}
        ry={(zone.r ?? 0) * 0.9}
        {...(props as SVGProps<SVGEllipseElement>)}
      />
    );
  }
  return (
    <rect
      key={key}
      x={zone.x}
      y={zone.y}
      width={zone.w}
      height={zone.h}
      rx={zone.rx}
      {...(props as SVGProps<SVGRectElement>)}
    />
  );
}

function Silhouette({label, zones, stimulus}: {label: string; zones: Zone[]; stimulus: Record<string, number>}) {
  return (
    <figure className="pv-bodymap__figure">
      <svg viewBox="0 0 90 180" role="img" aria-label={`Силуэт ${label}: стимул мышц`} className="pv-bodymap__svg">
        {BODY_BASE.map((zone, index) =>
          zoneNode(zone, {fill: 'var(--ta-surface-2)', stroke: 'var(--ta-border)', strokeWidth: 1}, `${label}-base-${index}`),
        )}
        {zones.map(zone => {
          const value = stimulus[zone.muscle];
          const meta = (MUSCLE_META as Record<string, {label: string; color: string}>)[zone.muscle];
          if (!meta || value === undefined || value <= 0) return null;
          return zoneNode(zone, {fill: meta.color, opacity: 0.25 + 0.75 * (value / 100)}, `${label}-${zone.muscle}-${zone.x}`);
        })}
      </svg>
      <figcaption className="pv-bodymap__caption">{label}</figcaption>
    </figure>
  );
}

const CALC_TO_MUSCLE: Record<string, string> = {
  bench: 'bench-press',
  squat: 'squat',
  row: 'barbell-row',
  ohp: 'ohp',
  curl: 'standing-curl',
  dbPress: 'db-press',
  lateralRaise: 'lateral-raise',
  legPress: 'leg-press-high-foot',
  legExt: 'leg-extension',
  legCurl: 'leg-curl',
  gluteBridge: 'glute-bridge',
  pullUp: 'pull-up',
};

export function MuscleMap({selectedExercise}: {selectedExercise?: string}) {
  const exercises = MUSCLE_MAPS.exercises;
  const mapped = selectedExercise ? CALC_TO_MUSCLE[selectedExercise] : undefined;
  const [internalId, setInternalId] = useState(exercises[0]?.id ?? '');
  const [compareId, setCompareId] = useState<string | null>(null);
  // selectedExercise takes precedence; otherwise keep the user's manual pick
  const activeId =
    mapped && exercises.some(e => e.id === mapped) ? mapped : internalId;
  const active = useMemo(() => exercises.find(e => e.id === activeId) ?? exercises[0], [exercises, activeId]);

  if (!active) return null;

  const rows = [
    ...MUSCLE_ORDER.filter(id => active.stimulus[id] !== undefined),
    ...Object.keys(active.stimulus).filter(id => !MUSCLE_ORDER.includes(id)),
  ].sort((a, b) => active.stimulus[b] - active.stimulus[a]);
  const badge = sourceBadge(active.sources);

  return (
    <div className="pv-mmap">
      <div className="pv-mmap__switch" role="tablist" aria-label="Упражнение">
        {exercises.map((ex, index) => (
          <button
            key={ex.id}
            type="button"
            role="tab"
            aria-selected={ex.id === active.id}
            aria-label={`Показать карту стимула: ${ex.name}`}
            tabIndex={ex.id === active.id ? 0 : -1}
            className={`pv-mmap__chip${ex.id === active.id ? ' pv-mmap__chip--on' : ''}`}
            onClick={() => setInternalId(ex.id)}
            onKeyDown={event => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                const next = exercises[(index + 1) % exercises.length];
                if (next) setInternalId(next.id);
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                const prev = exercises[(index - 1 + exercises.length) % exercises.length];
                if (prev) setInternalId(prev.id);
              }
            }}>
            {ex.name}
          </button>
        ))}
      </div>

      <div className="pv-mmap__compare">
        <label className="pv-mmap__compare-label" htmlFor="pv-mmap-compare">
          Сравнить с:
        </label>
        <select
          id="pv-mmap-compare"
          className="pv-mmap__compare-select"
          value={compareId ?? ''}
          onChange={event => setCompareId(event.target.value || null)}>
          <option value="">— не сравнивать —</option>
          {exercises
            .filter(ex => ex.id !== active.id)
            .map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
        </select>
      </div>

      <div className="pv-mmap__head">
        <h4 className="pv-mmap__name">{active.name}</h4>
        <span className={`pv-mmap__badge${badge === 'репо' ? ' pv-mmap__badge--repo' : ''}`}>{badge}</span>
      </div>
      <p className="pv-mmap__comment">{active.comment}</p>
      {EXERCISE_INSIGHTS[active.id] && (
        <div className="pv-mmap__insight">
          <p className="pv-mmap__insight-text">{EXERCISE_INSIGHTS[active.id].insight}</p>
          <p className="pv-mmap__insight-meta">
            <b>Роль:</b> {EXERCISE_INSIGHTS[active.id].role}
            {EXERCISE_INSIGHTS[active.id].compare ? ` · ${EXERCISE_INSIGHTS[active.id].compare}` : ''}
          </p>
          {EXERCISE_INSIGHTS[active.id].norm ? (
            <p className="pv-mmap__insight-norm">{EXERCISE_INSIGHTS[active.id].norm}</p>
          ) : null}
          <p className="pv-mmap__insight-source">{EXERCISE_INSIGHTS[active.id].source}</p>
        </div>
      )}
      {active.anthropometrySensitive && (
        <p className="pv-mmap__anthro">
          Антропометрия ({MUSCLE_MAPS.anthropometry.label}): {MUSCLE_MAPS.anthropometry.note}
        </p>
      )}

      <div className="pv-bodymap">
        <Silhouette label="Фронт" zones={FRONT_ZONES} stimulus={active.stimulus} />
        <Silhouette label="Тыл" zones={BACK_ZONES} stimulus={active.stimulus} />
      </div>

      <div className="pv-bars" role="img" aria-label={`Стимул мышц: ${active.name}`}>
        {rows.map(id => {
          const value = active.stimulus[id];
          const meta = (MUSCLE_META as Record<string, {label: string; color: string}>)[id];
          const label = (MUSCLE_EXTRA_LABELS as Record<string, string>)[id] ?? meta?.label ?? id;
          return (
            <div key={id} className="pv-bars__row">
              <span className="pv-bars__label">{label}</span>
              <span className="pv-bars__track">
                <span className="pv-bars__fill" style={{width: `${Math.max(value, 2)}%`, background: meta?.color ?? 'var(--ta-sec-01)'}} />
              </span>
              <span className="pv-bars__value">{value}</span>
            </div>
          );
        })}
      </div>

      {compareId && (() => {
        const other = exercises.find(e => e.id === compareId);
        if (!other) return null;
        const muscles = Array.from(new Set([...Object.keys(active.stimulus), ...Object.keys(other.stimulus)]))
          .filter(m => (active.stimulus[m] ?? 0) > 0 || (other.stimulus[m] ?? 0) > 0)
          .sort((a, b) => (other.stimulus[b] ?? 0) + (active.stimulus[b] ?? 0) - ((other.stimulus[a] ?? 0) + (active.stimulus[a] ?? 0)));
        return (
          <div className="pv-mmap__compare-block" aria-label={`Сравнение ${active.name} и ${other.name}`}>
            <h5 className="pv-mmap__compare-title">{active.name} vs {other.name}</h5>
            <div className="pv-bars">
              {muscles.map(id => {
                const a = active.stimulus[id] ?? 0;
                const b = other.stimulus[id] ?? 0;
                const meta = (MUSCLE_META as Record<string, {label: string; color: string}>)[id];
                const label = (MUSCLE_EXTRA_LABELS as Record<string, string>)[id] ?? meta?.label ?? id;
                return (
                  <div key={id} className="pv-bars__row pv-bars__row--compare">
                    <span className="pv-bars__label">{label}</span>
                    <span className="pv-bars__track">
                      <span className="pv-bars__fill" style={{width: `${Math.max(a, 2)}%`, background: meta?.color ?? 'var(--ta-sec-01)', opacity: 0.9}} />
                    </span>
                    <span className="pv-bars__value">{a} / {b}</span>
                  </div>
                );
              })}
            </div>
            <p className="pv-mmap__compare-hint">Значения: {active.name} / {other.name} (0–100).</p>
          </div>
        );
      })()}

      <p className="pv-mmap__scale">Шкала 0–100 — степень стимула мышцы в упражнении ({MUSCLE_MAPS.scale}).</p>
    </div>
  );
}