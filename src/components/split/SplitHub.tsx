import {useState} from 'react';
import type {SplitCalculation, TrainingProfile} from '../../types';
import type {CustomSplit} from '../../types';
import {GlobalExerciseAdder} from './GlobalExerciseAdder.tsx';
import {ProfileWeightBaseSheet} from './ProfileWeightBaseSheet.tsx';
import {SplitCalculationPanel} from './SplitCalculationPanel.tsx';
import {Button} from '../ui/Button.tsx';
import {DeleteIcon} from '../ui/DeleteIcon.tsx';
import '../../styles/components/split/split-hub.css';

type ConstructorApi = {
  profiles: TrainingProfile[];
  activeProfileId: string;
  profileName: string;
  profileExercises: import('../../types').SavedExercise[];
  savedSplits: CustomSplit[];
  selectedSplitId: string | null;
  calculations: SplitCalculation[];
  calculationsForSelectedSplit: SplitCalculation[];
  activeCalculation?: SplitCalculation;
  isDraftingNewCalculation: boolean;
  weightBaseOpen: boolean;
  setWeightBaseOpen: (open: boolean) => void;
  renameProfile: (name: string) => void;
  commitProfileName: () => void;
  selectProfile: (id: string) => void;
  createProfile: () => void;
  deleteProfileById: (id: string) => void | Promise<void>;
  selectSplit: (id: string) => void;
  createNewSplit: () => void;
  openSplitEditor: (id?: string) => void;
  deleteSplitById: (id: string) => void | Promise<void>;
  createCalculationFromBase: () => void;
  selectCalculation: (id: string) => void;
  deleteCalculation: (id: string) => void | Promise<void>;
  setExerciseOneRM: (
    exerciseKey: string,
    oneRM: number,
    testWeight?: number,
    testReps?: number,
    bodyWeight?: number,
  ) => void;
  setCalculationExerciseOneRM: (
    exerciseKey: string,
    oneRM: number,
    testWeight?: number,
    testReps?: number,
    bodyWeight?: number,
  ) => void;
  previewSplit: CustomSplit;
  previewWeek: number;
  setPreviewWeek: (week: number) => void;
  dayPreviews: Parameters<typeof SplitCalculationPanel>[0]['dayPreviews'];
  previewExercises: import('../../types').SavedExercise[];
  missingWeightKeys: string[];
  weightsReady: boolean;
  setFixedWeight: (exerciseKey: string, weekIndex: number, weight: number) => void;
  toggleCompletedWeek: (week: number) => void;
  toggleCompletedDay: (week: number, day: 1 | 2 | 3 | 4) => void;
};

interface SplitHubProps {
  constructor: ConstructorApi;
}

function daysLabel(days: number): string {
  if (days === 2) return '2 дня';
  if (days === 3) return '3 дня';
  return '4 дня';
}

export function SplitHub({constructor: c}: SplitHubProps) {
  const [renamingProfileId, setRenamingProfileId] = useState<string | null>(null);
  const activeProfile = c.profiles.find(profile => profile.id === c.activeProfileId);
  const profileLabel = activeProfile?.name ?? c.profileName;

  return (
    <div className="split-hub app-tab-section">
      <div className="split-hub__cta">
        <Button
          type="button"
          className="calc-test__submit split-hub__add"
          disabled={!c.activeProfileId}
          onClick={() => c.setWeightBaseOpen(true)}>
          База силовых профиля
        </Button>
        <p className="split-hub__cta-hint">
          Дефолтные веса для новых расчётов профиля «{profileLabel}».
        </p>
      </div>

      <ProfileWeightBaseSheet
        open={c.weightBaseOpen}
        profileLabel={profileLabel}
        savedExercises={c.profileExercises}
        onClose={() => c.setWeightBaseOpen(false)}
        onOneRMChange={c.setExerciseOneRM}
      />

      <div className="split-hub__block">
        <h3 className="split-hub__block-title">Профили</h3>
        <ul className="split-hub__list">
          {c.profiles.map(profile => {
            const selected = profile.id === c.activeProfileId;
            return (
              <li
                key={profile.id}
                className={`split-hub__row${selected ? ' split-hub__row--selected' : ''}`}>
                {renamingProfileId === profile.id ? (
                  <input
                    className="split-hub__rename-input"
                    defaultValue={profile.name}
                    autoFocus
                    onBlur={event => {
                      c.renameProfile(event.target.value);
                      c.commitProfileName();
                      setRenamingProfileId(null);
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="split-hub__row-main"
                    onClick={() => c.selectProfile(profile.id)}>
                    <span className="split-hub__row-title">{profile.name}</span>
                  </button>
                )}
                <div className="split-hub__row-actions">
                  <button
                    type="button"
                    className="split-hub__icon-btn"
                    aria-label="Переименовать профиль"
                    onClick={() => setRenamingProfileId(profile.id)}>
                    ✎
                  </button>
                  <button
                    type="button"
                    className="split-hub__icon-btn"
                    aria-label="Удалить профиль"
                    onClick={() => {
                      if (window.confirm(`Удалить профиль «${profile.name}» и все его сплиты?`)) {
                        void c.deleteProfileById(profile.id);
                      }
                    }}>
                    <DeleteIcon />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="split-toolbar__action split-hub__add"
          onClick={c.createProfile}>
          + Профиль
        </button>
      </div>

      {c.activeProfileId ? (
        <div className="split-hub__block">
          <h3 className="split-hub__block-title">Сплиты · {profileLabel}</h3>
          {c.savedSplits.length === 0 ? (
            <p className="split-hub__placeholder">Нет сплитов — создайте первый.</p>
          ) : (
            <ul className="split-hub__list">
              {c.savedSplits.map(split => {
                const selected = split.id === c.selectedSplitId;
                const calcCount = c.calculations.filter(
                  entry => (entry.splitId ?? entry.split.id) === split.id,
                ).length;
                const meta =
                  calcCount > 0
                    ? `${daysLabel(split.daysPerWeek)} · ${calcCount} расч.`
                    : daysLabel(split.daysPerWeek);
                return (
                  <li
                    key={split.id}
                    className={`split-hub__row${selected ? ' split-hub__row--selected' : ''}`}>
                    <button
                      type="button"
                      className="split-hub__row-main"
                      onClick={() => c.selectSplit(split.id)}>
                      <span className="split-hub__row-title">{split.name}</span>
                      <span className="split-hub__row-meta">{meta}</span>
                    </button>
                    <div className="split-hub__row-actions">
                      <button
                        type="button"
                        className="split-hub__icon-btn"
                        onClick={() => c.openSplitEditor(split.id)}>
                        Ред.
                      </button>
                      <button
                        type="button"
                        className="split-hub__icon-btn"
                        onClick={() => {
                          if (window.confirm(`Удалить сплит «${split.name}»?`)) {
                            void c.deleteSplitById(split.id);
                          }
                        }}>
                        <DeleteIcon />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            className="split-toolbar__action split-hub__add"
            onClick={c.createNewSplit}>
            + Новый сплит
          </button>
        </div>
      ) : (
        <p className="split-hub__placeholder">Выберите профиль</p>
      )}

      {c.selectedSplitId ? (
        <div className="split-hub__block">
          <h3 className="split-hub__block-title">
            Расчёты · {c.savedSplits.find(s => s.id === c.selectedSplitId)?.name ?? 'Сплит'}
          </h3>
          {c.calculationsForSelectedSplit.length === 0 ? (
            <p className="split-hub__placeholder">Выберите расчёт или создайте новый.</p>
          ) : (
            <ul className="split-hub__list">
              {c.calculationsForSelectedSplit.map(entry => {
                const selected = entry.id === c.activeCalculation?.id;
                const sample = entry.exercises[0];
                const sampleLabel = sample
                  ? `${sample.testWeight} кг × ${sample.testReps}`
                  : 'без весов';
                return (
                  <li
                    key={entry.id}
                    className={`split-hub__row${selected ? ' split-hub__row--selected' : ''}`}>
                    <button
                      type="button"
                      className="split-hub__row-main"
                      onClick={() => c.selectCalculation(entry.id)}>
                      <span className="split-hub__row-title">
                        {new Date(entry.calculatedAt).toLocaleString('ru-RU')}
                      </span>
                      <span className="split-hub__row-meta">{sampleLabel}</span>
                    </button>
                    <div className="split-hub__row-actions">
                      <button
                        type="button"
                        className="split-hub__icon-btn"
                        aria-label="Удалить расчёт"
                        onClick={() => void c.deleteCalculation(entry.id)}>
                        <DeleteIcon />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            className="split-toolbar__action split-hub__add"
            onClick={c.createCalculationFromBase}>
            + Новый расчёт
          </button>

          {c.activeCalculation || c.isDraftingNewCalculation ? (
            <>
              {c.isDraftingNewCalculation ? (
                <GlobalExerciseAdder
                  savedExercises={c.previewExercises}
                  daysPerWeek={2}
                  onAddExercise={() => {}}
                  onOneRMChange={c.setCalculationExerciseOneRM}
                  profileBaseOnly
                />
              ) : null}
              <SplitCalculationPanel
                split={c.previewSplit}
                previewWeek={c.previewWeek}
                dayPreviews={c.dayPreviews}
                previewExercises={c.previewExercises}
                missingWeightKeys={c.missingWeightKeys}
                weightsReady={c.weightsReady}
                onWeekChange={c.setPreviewWeek}
                onToggleWeekDone={c.toggleCompletedWeek}
                onToggleDayDone={c.toggleCompletedDay}
                onFixedWeightChange={c.setFixedWeight}
              />
            </>
          ) : null}
        </div>
      ) : c.activeProfileId ? (
        <p className="split-hub__placeholder">Выберите сплит</p>
      ) : null}
    </div>
  );
}
