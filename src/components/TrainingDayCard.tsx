import {useState, type FocusEvent} from 'react';
import {CATALOG_EXERCISES, TYPE_LABELS} from '../data/exercises';
import {EXERCISES_V3} from '@training/shared/program/v3';
import {PlateDiagram} from './PlateDiagram';
import {PairStack} from './training/PairStack';
import '../styles/components/training/stack.css';
import type {ExerciseConfig, TrainingDayDef} from '../types';
import type {Block} from '@training/shared/types';
import type {TrainingExerciseRow} from '../utils/training';
import {calcWarmupSets} from '../utils/calc';
import {buildLinearWorkingSets, buildPyramid} from '@training/shared/utils/pyramid';
import {buildClusterSets} from '@training/shared/utils/cluster';
import {autoPairDay} from '@training/shared/utils/pair-engine';
import {intensityTone, clusterAllowed} from '@training/shared/utils/intensity';

/** Which working-set row currently drives the plate diagram (pyramid ≠ one static kg). */
type PlateFocus = {key: string; weight: number};

function formatWeight(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function barWeightForType(type: 'A' | 'B' | 'C' | 'D'): number {
  return type === 'B' ? 10 : 20;
}

function loadNoteForExercise(config: ExerciseConfig | undefined): string {
  if (!config) return 'Это упражнение: схема блинов не применяется.';

  if (config.usesBodyWeight) {
    return 'Для упражнений с весом тела рабочая нагрузка показана как доп. вес к весу тела.';
  }

  if (config.type === 'D') {
    return `${TYPE_LABELS[config.type]}: подбери удобное положение. Амплитуда не слишком большая и не слишком маленькая; идеально — 90–120 градусов.`;
  }

  return `${TYPE_LABELS[config.type]}: схема блинов не применяется.`;
}

function exerciseConfigForKey(key: string): ExerciseConfig | undefined {
  const catalog = CATALOG_EXERCISES[key];
  if (catalog) return catalog;

  const v3 = EXERCISES_V3[key];
  if (!v3) return undefined;

  const step = v3.step > 0 ? v3.step : 2.5;
  return {
    name: v3.name,
    type: (step >= 2.5 ? 'A' : 'C') as 'A' | 'B' | 'C' | 'D',
    step,
    warmupStep: step,
    primaryMuscle: v3.primaryMuscle,
    percentages: [],
    weekSchemes: [],
    usesBodyWeight: Boolean(v3.isPullup),
    isPullup: Boolean(v3.isPullup),
  };
}

function formatDisplayWeight(ex: TrainingExerciseRow, hideWeights: boolean): string {
  if (ex.loadHint && ex.weight <= 0) return ex.loadHint;
  if (hideWeights || ex.weight <= 0) return '—';
  if (ex.usesBodyWeight && ex.extraWeight != null) {
    return ex.extraWeight >= 0 ? `+${ex.extraWeight.toFixed(1)}` : ex.extraWeight.toFixed(1);
  }
  return ex.weight.toFixed(1);
}

function schemeLabel(ex: TrainingExerciseRow): string {
  if (ex.progressionMode === 'pyramid') {
    return '↓ пирамида';
  }
  if (ex.scheme.sets !== 4) {
    return `${ex.scheme.sets} × ${ex.scheme.reps}`;
  }
  return `${ex.scheme.sets} × ${ex.scheme.reps}`;
}

function workingSetWeightLabel(
  set: {weight: number},
  ex: TrainingExerciseRow,
  hideWeights: boolean,
): string {
  if (hideWeights) return '—';
  if (ex.usesBodyWeight && ex.extraWeight != null) {
    const extra = ex.extraWeight + (set.weight - ex.weight);
    if (!Number.isFinite(extra)) return '—';
    return extra >= 0 ? `+${extra.toFixed(1)}` : extra.toFixed(1);
  }
  if (!(set.weight > 0) || !Number.isFinite(set.weight)) return '—';
  return formatWeight(set.weight);
}

function WorkingSetItem({
  setKey,
  set,
  ex,
  hideWeights,
  interactive,
  isActive,
  onPreview,
  onClearPreview,
  onSelect,
}: {
  setKey: string;
  set: {set: number; weight: number; reps: number};
  ex: TrainingExerciseRow;
  hideWeights: boolean;
  interactive: boolean;
  isActive: boolean;
  onPreview: (focus: PlateFocus) => void;
  onClearPreview: () => void;
  onSelect: (focus: PlateFocus) => void;
}) {
  const label = workingSetWeightLabel(set, ex, hideWeights);
  const itemClass = [
    'training-working-sets__item',
    isActive ? 'is-active' : '',
    interactive ? 'is-interactive' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="training-working-sets__set">#{set.set}</span>
      <span className="training-working-sets__weight u-num">{label} кг</span>
      <span className="training-working-sets__reps u-num">{set.reps} повт</span>
    </>
  );

  if (!interactive) {
    return <li className={itemClass}>{content}</li>;
  }

  const focus: PlateFocus = {key: setKey, weight: set.weight};

  const clearIfLeftWorkingSets = (event: FocusEvent<HTMLButtonElement>) => {
    const related = event.relatedTarget;
    if (related instanceof HTMLElement && related.closest('.training-working-sets')) {
      return;
    }
    onClearPreview();
  };

  return (
    <li className="training-working-sets__slot">
      <button
        type="button"
        className={itemClass}
        aria-pressed={isActive}
        aria-label={`Подход ${set.set}: ${label} кг, ${set.reps} повторений. Показать схему блинов.`}
        onMouseEnter={() => onPreview(focus)}
        onFocus={() => onPreview(focus)}
        onBlur={clearIfLeftWorkingSets}
        onClick={() => onSelect(focus)}>
        {content}
      </button>
    </li>
  );
}

export default function TrainingDayCard({
  dayDef,
  weekIndex,
  exercises,
  isPreview,
  hideWeights,
  variant = 'default',
  persistedBlocks,
  onSetModeChange,
}: {
  dayDef: TrainingDayDef;
  weekIndex: number;
  exercises: TrainingExerciseRow[];
  isPreview?: boolean;
  hideWeights?: boolean;
  variant?: 'default' | 'split-preview';
  persistedBlocks?: Block[];
  onSetModeChange?: (blockId: string, setMode: 'linear' | 'pyramid' | 'cluster', cluster?: {miniReps: number; intraRestSec: number}) => void;
}) {
  const [openExerciseKey, setOpenExerciseKey] = useState<string | null>(null);
  const [setMode, setSetMode] = useState<'linear' | 'pyramid' | 'cluster'>('linear');
  const [plateHovered, setPlateHovered] = useState<PlateFocus | null>(null);
  const [plateLocked, setPlateLocked] = useState<PlateFocus | null>(null);

  const cardClass = [
    'training-card',
    isPreview ? 'training-card-preview' : '',
    variant === 'split-preview' ? 'training-card--split-preview' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Группируем упражнения в стеки (автопары), мержим сохранённый setMode по id.
  const autoBlocks = autoPairDay(exercises.map(e => e.key));
  const blocks = autoBlocks.map(b => {
    const saved = persistedBlocks?.find(p => p.id === b.id);
    return saved ? {...b, setMode: saved.setMode ?? b.setMode, cluster: saved.cluster ?? b.cluster} : b;
  });

  return (
    <div className={cardClass}>
      <div className="training-card-head">
        <span className="training-card-day">День {dayDef.dayNumber}</span>
        {dayDef.name.trim() !== `День ${dayDef.dayNumber}` ? (
          <span className="training-card-name">{dayDef.name}</span>
        ) : (
          <span className="training-card-name" aria-hidden="true" />
        )}
        <span className="training-card-week">Нед {weekIndex + 1}</span>
      </div>

      <div className="training-stacks">
        {blocks.map(block => {
          const blockExercises = block.exerciseKeys
            .map(k => exercises.find(e => e.key === k))
            .filter(Boolean) as TrainingExerciseRow[];

          const blockPct = blockExercises.length > 0
            ? Math.max(...blockExercises.map(e => e.intensityPct ?? 75))
            : 75;
          const tone = intensityTone(blockPct);
          const clusterOk = clusterAllowed(blockPct);

          return (
            <PairStack key={block.id} block={block} tone={tone} meta={block.type === 'pair' ? 'пара' : undefined}>
              {blockExercises.map(ex => {
                const config = exerciseConfigForKey(ex.key);
                const isOpen = openExerciseKey === ex.key;
                const displayWeight = formatDisplayWeight(ex, !!hideWeights);
                const barWeight = config ? barWeightForType(config.type) : 20;
                const canShowPlates =
                  !!config && !config.usesBodyWeight && (config.type === 'A' || config.type === 'B');
                const warmups = config
                  ? calcWarmupSets(ex.warmupTopWeight, config).map(set => ({
                      ...set,
                      weight: canShowPlates ? Math.max(set.weight, barWeight) : set.weight,
                    }))
                  : [];
                const isPyramid = ex.progressionMode === 'pyramid';
                const computedPyramidSets = config
                  ? buildPyramid(
                      {
                        targetWeight: ex.weight,
                        targetSets: ex.scheme.sets,
                        targetReps: ex.scheme.reps,
                        type: 'descending',
                        rpeBase: 8,
                      },
                      config,
                    ).workingSets
                  : [];
                const plateFocus = plateHovered ?? plateLocked;
                const plateWeight = plateFocus?.weight ?? ex.warmupTopWeight;
                const clearPlatePreview = () => setPlateHovered(null);
                const previewPlate = (focus: PlateFocus) => setPlateHovered(focus);
                const selectPlate = (focus: PlateFocus) => {
                  setPlateLocked(focus);
                  setPlateHovered(null);
                };
                const toggleExercise = () => {
                  setOpenExerciseKey(isOpen ? null : ex.key);
                  // инициализация setMode из Block.setMode (если есть)
                  const containingBlock = blocks.find(b => b.exerciseKeys.includes(ex.key));
                  setSetMode((containingBlock?.setMode as 'linear' | 'pyramid' | 'cluster') ?? 'linear');
                  setPlateHovered(null);
                  setPlateLocked(null);
                };
                const renderWorkingSet = (
                  set: {set: number; weight: number; reps: number},
                  setKey: string,
                ) => (
                  <WorkingSetItem
                    key={setKey}
                    setKey={setKey}
                    set={set}
                    ex={ex}
                    hideWeights={!!hideWeights}
                    interactive={canShowPlates && !hideWeights && set.weight > 0}
                    isActive={plateFocus?.key === setKey}
                    onPreview={previewPlate}
                    onClearPreview={clearPlatePreview}
                    onSelect={selectPlate}
                  />
                );

                return (
                  <div key={ex.key} className={`stack__exercise ${isOpen ? 'is-expanded' : ''}`}>
                    <button
                      type="button"
                      className="stack__ex"
                      aria-expanded={isOpen}
                      onClick={toggleExercise}>
                      <span className="stack__dot" />
                      <span>{ex.name}</span>
                      <span className="stack__kg u-num">{formatDisplayWeight(ex, !!hideWeights)} кг</span>
                      <span className="stack__scheme">
                        {isPyramid ? schemeLabel(ex) : `${ex.scheme.sets} × ${ex.scheme.reps}`}
                      </span>
                      <span className="stack__reps u-num">{ex.totalReps} повт</span>
                    </button>

                    {isOpen && (
                      <div
                        className="ta-shell training-load-menu"
                        role="region"
                        aria-label={`Схема и разминка: ${ex.name}`}>
                        <div className="training-load-menu__head">
                          <div>
                            <div className="training-load-menu__eyebrow">
                              {isPyramid ? 'Пирамида нагрузки' : 'Схема подхода'}
                            </div>
                            <h3 className="training-load-menu__title">{ex.name}</h3>
                          </div>
                          <div className="training-load-menu__work">
                            <span>
                              {plateFocus && canShowPlates
                                ? formatWeight(plateWeight)
                                : displayWeight}
                            </span>
                            <small>
                              кг ·{' '}
                              {isPyramid
                                ? schemeLabel(ex)
                                : `${ex.scheme.sets} × ${ex.scheme.reps}`}
                            </small>
                          </div>
                        </div>

                        <div className="training-load-menu__section">
                          <div className="training-load-menu__eyebrow">Рабочие подходы</div>
                          <div className="training-setmode" role="group" aria-label="Режим подходов">
                            {(['linear', 'pyramid', 'cluster'] as const).map(mode => {
                              const disabled = mode === 'cluster' && !clusterOk;
                              const labels = {linear: 'Константа', pyramid: 'Пирамида', cluster: 'Блоковая'};
                              return (
                                <button
                                  key={mode}
                                  type="button"
                                  className={`training-setmode__btn${setMode === mode ? ' is-active' : ''}`}
                                  disabled={disabled}
                                  title={disabled ? `Блоковая доступна при >80% — сейчас ${Math.round(blockPct)}%` : undefined}
                                  onClick={() => {
                                    setSetMode(mode);
                                    const blockId = block.id;
                                    const clusterCfg = mode === 'cluster' ? {miniReps: 2, intraRestSec: 30} : undefined;
                                    onSetModeChange?.(blockId, mode, clusterCfg);
                                  }}>
                                  {labels[mode]}
                                </button>
                              );
                            })}
                          </div>
                          {variant === 'split-preview' ? (
                            <div className="training-load-menu__split-schemes">
                              <div className="training-load-menu__scheme-col">
                                <div className="training-load-menu__scheme-col-title">
                                  Линейная схема
                                </div>
                                <ul
                                  className="training-working-sets"
                                  aria-label={`Линейные подходы: ${ex.name}`}
                                  onMouseLeave={clearPlatePreview}>
                                  {buildLinearWorkingSets(
                                    ex.weight,
                                    ex.scheme.sets,
                                    ex.scheme.reps,
                                  ).map(set =>
                                    renderWorkingSet(set, `${ex.key}-linear-set-${set.set}`),
                                  )}
                                </ul>
                              </div>
                              <div className="training-load-menu__scheme-col">
                                <div className="training-load-menu__scheme-col-title">
                                  Пирамида нагрузки
                                </div>
                                <ul
                                  className="training-working-sets training-working-sets--pyramid"
                                  aria-label={`Пирамидальные подходы: ${ex.name}`}
                                  onMouseLeave={clearPlatePreview}>
                                  {computedPyramidSets.map(set =>
                                    renderWorkingSet(set, `${ex.key}-pyramid-set-${set.set}`),
                                  )}
                                </ul>
                              </div>
                            </div>
                          ) : setMode === 'cluster' ? (
                            <ul
                              className="training-working-sets"
                              aria-label={`Блоковые подходы: ${ex.name}`}
                              onMouseLeave={clearPlatePreview}>
                              {buildClusterSets({
                                weight: ex.weight,
                                sets: ex.scheme.sets,
                                reps: ex.scheme.reps,
                                cluster: {miniReps: 2, intraRestSec: 30},
                              }).map(cs => (
                                <li
                                  key={`${ex.key}-cluster-set-${cs.set}`}
                                  className="training-working-sets__item">
                                  <span className="training-working-sets__set">#{cs.set}</span>
                                  <span className="training-working-sets__weight u-num">
                                    {cs.mini.join(' + ')} повт
                                  </span>
                                  <span className="training-working-sets__reps u-num">
                                    {cs.intraRestSec}с отдых
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : setMode === 'pyramid' ? (
                            <ul
                              className="training-working-sets training-working-sets--pyramid"
                              aria-label={`Пирамидальные подходы: ${ex.name}`}
                              onMouseLeave={clearPlatePreview}>
                              {computedPyramidSets.map(set =>
                                renderWorkingSet(set, `${ex.key}-pyramid-set-${set.set}`),
                              )}
                            </ul>
                          ) : (
                            <ul
                              className="training-working-sets"
                              aria-label={`Рабочие подходы: ${ex.name}`}
                              onMouseLeave={clearPlatePreview}>
                              {buildLinearWorkingSets(ex.weight, ex.scheme.sets, ex.scheme.reps).map(
                                set => renderWorkingSet(set, `${ex.key}-set-${set.set}`),
                              )}
                            </ul>
                          )}
                        </div>

                        {canShowPlates ? (
                          <PlateDiagram weight={plateWeight} barWeight={barWeight} />
                        ) : (
                          <div className="training-load-menu__note">
                            {loadNoteForExercise(config)}
                          </div>
                        )}

                        <div className="training-load-menu__section">
                          <div className="training-load-menu__eyebrow">Разминочные подходы</div>
                          {warmups.length > 0 ? (
                            <ul
                              className="training-warmups"
                              aria-label={`Разминочные подходы для ${ex.name}`}>
                              {warmups.map(warmup => (
                                <li
                                  className="training-warmups__item"
                                  key={`${warmup.label}-${warmup.weight}-${warmup.reps}`}>
                                  <span className="training-warmups__label">{warmup.label}</span>
                                  <span className="training-warmups__weight u-num">
                                    {formatWeight(warmup.weight)} кг
                                  </span>
                                  <span className="training-warmups__reps u-num">
                                    {warmup.reps} повт
                                  </span>
                                  <span className="training-warmups__rest u-num">
                                    {warmup.rest}
                                  </span>
                                  <span className="training-warmups__purpose">
                                    {warmup.purpose}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="training-load-menu__note">
                              Разминка: 2–3 лёгких подхода с собственным весом, затем рабочая схема.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </PairStack>
          );
        })}
      </div>
    </div>
  );
}