import {useState} from 'react';
import type {TrainingProfile} from '../../types';
import {Button} from '../ui/Button.tsx';
import {DeleteIcon} from '../ui/DeleteIcon.tsx';
import {ProfilesSheet} from './ProfilesSheet.tsx';
import {ProfileWeightBaseSheet} from './ProfileWeightBaseSheet.tsx';
import '../../styles/components/split/split-hub.css';

interface SplitProfilePanelProps {
  profiles: TrainingProfile[];
  activeProfileId: string;
  profileName: string;
  profileExercises: import('../../types').SavedExercise[];
  weightBaseOpen: boolean;
  setWeightBaseOpen: (open: boolean) => void;
  renameProfile: (name: string) => void;
  commitProfileName: () => void;
  selectProfile: (id: string) => void;
  createProfile: () => void;
  deleteProfileById: (id: string) => void | Promise<void>;
  setExerciseOneRM: (
    exerciseKey: string,
    oneRM: number,
    testWeight?: number,
    testReps?: number,
    bodyWeight?: number,
  ) => void;
}

export function SplitProfilePanel({
  profiles,
  activeProfileId,
  profileName,
  profileExercises,
  weightBaseOpen,
  setWeightBaseOpen,
  renameProfile,
  commitProfileName,
  selectProfile,
  createProfile,
  deleteProfileById,
  setExerciseOneRM,
}: SplitProfilePanelProps) {
  const [renamingProfileId, setRenamingProfileId] = useState<string | null>(null);
  const [profilesSheetOpen, setProfilesSheetOpen] = useState(false);
  const activeProfile = profiles.find(profile => profile.id === activeProfileId);
  const profileLabel = activeProfile?.name ?? profileName;

  return (
    <div className="split-hub split-hub--profile-only">
      <div className="split-hub__cta">
        <Button
          type="button"
          className="calc-test__submit split-hub__add"
          disabled={!activeProfileId}
          onClick={() => setWeightBaseOpen(true)}>
          База силовых профиля
        </Button>
        <p className="split-hub__cta-hint">
          Дефолтные веса для новых расчётов профиля «{profileLabel}».
        </p>
      </div>

      <ProfileWeightBaseSheet
        open={weightBaseOpen}
        profileLabel={profileLabel}
        savedExercises={profileExercises}
        onClose={() => setWeightBaseOpen(false)}
        onOneRMChange={setExerciseOneRM}
      />

      <div className="split-hub__block split-hub__block--profiles">
        <h3 className="split-hub__block-title">Профили</h3>
        <ul className="split-hub__list">
          {profiles.map(profile => {
            const selected = profile.id === activeProfileId;
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
                      renameProfile(event.target.value);
                      commitProfileName();
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
                    onClick={() => setProfilesSheetOpen(true)}>
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
                        void deleteProfileById(profile.id);
                      }
                    }}>
                    <DeleteIcon />
                  </button>
                </div>
              </li>
            );
          })}
          <li className="split-hub__list-item--add">
            <button
              type="button"
              className="split-toolbar__action split-hub__add"
              onClick={() => setProfilesSheetOpen(true)}>
              + Профиль
            </button>
          </li>
        </ul>
      </div>

      <ProfilesSheet
        open={profilesSheetOpen}
        profiles={profiles}
        activeProfileId={activeProfileId}
        selectProfile={selectProfile}
        createProfile={createProfile}
        onClose={() => setProfilesSheetOpen(false)}
      />
    </div>
  );
}
