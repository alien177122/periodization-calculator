import type {TrainingProfile} from '../../types';
import {AppSheet} from '../ui/AppSheet.tsx';

interface ProfilesSheetProps {
  open: boolean;
  profiles: TrainingProfile[];
  activeProfileId: string;
  selectProfile: (id: string) => void;
  createProfile: () => void;
  onClose: () => void;
}

/** iOS-шит «Профили» (АppSheet): выбор активного профиля из модального окна.
 *  По клику на профиль в блоке «ПРОФИЛИ» или на «+ Профиль». */
export function ProfilesSheet({
  open,
  profiles,
  activeProfileId,
  selectProfile,
  createProfile,
  onClose,
}: ProfilesSheetProps) {
  return (
    <AppSheet open={open} onClose={onClose} title="Профили">
      <ul className="profile-sheet__list">
        {profiles.map(profile => {
          const selected = profile.id === activeProfileId;
          return (
            <li key={profile.id} className="profile-sheet__item">
              <button
                type="button"
                className="profile-sheet__row"
                onClick={() => {
                  if (!selected) selectProfile(profile.id);
                  onClose();
                }}>
                <span className="profile-sheet__name">{profile.name}</span>
                {selected ? (
                  <span className="profile-sheet__badge" aria-current="true">
                    Открыт
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
        <li className="profile-sheet__item profile-sheet__item--add">
          <button
            type="button"
            className="profile-sheet__row profile-sheet__row--add"
            onClick={() => {
              createProfile();
              onClose();
            }}>
            <span aria-hidden="true">+</span> Новый профиль
          </button>
        </li>
      </ul>
    </AppSheet>
  );
}
