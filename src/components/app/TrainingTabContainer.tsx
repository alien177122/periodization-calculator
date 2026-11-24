import type {ReactNode} from 'react';
import TrainingTab from '../../screens/TrainingTab';
import '../../styles/tabs/training-tab.css';
import {useTrainingProgram} from '../../hooks/useTrainingProgram';
import {saveUser} from '../../utils/api';
import {TRAINING_DAYS} from '@training/shared/data/exercises';
import {PROGRAM_DAYS_PER_WEEK} from '../../types';
import type {CustomSplit, UserData} from '../../types';
import {blocksForDay} from '@training/shared/data/split-blocks';
import {withBlockSetMode} from '@training/shared/data/split-blocks';
import {SplitWeekSection} from '../training/SplitWeekSection';
import type {SplitDayNumber} from '@training/shared/types';

interface TrainingTabContainerProps {
  userData: UserData;
  token: string;
  setUserData: (value: UserData | null) => void;
  onGoCalculator: () => void;
  programSubtitle?: string;
  /** Секции под программой (расчёты), передаются из SplitTab. */
  extraSections?: ReactNode;
}

/** Lazy boundary: keeps training program logic out of the initial shell chunk. */
export default function TrainingTabContainer({
  userData,
  token,
  setUserData,
  onGoCalculator,
  programSubtitle = `8 недель · ${PROGRAM_DAYS_PER_WEEK} дня · волновая прогрессия`,
  extraSections,
}: TrainingTabContainerProps) {
  const training = useTrainingProgram({
    token,
    userData,
    setUserData,
  });

  const activeSplit =
    (userData.splits ?? []).find(s => s.id === userData.activeSplitId) ??
    (userData.splits ?? [])[0] ??
    null;

  const currentTrainingDay = TRAINING_DAYS[training.currentDayIdx];
  const nextTrainingDay = TRAINING_DAYS[training.nextDayIdx];
  const currentBlocks = activeSplit && currentTrainingDay
    ? blocksForDay(activeSplit, currentTrainingDay.dayNumber as SplitDayNumber)
    : undefined;
  const nextBlocks = activeSplit && nextTrainingDay
    ? blocksForDay(activeSplit, nextTrainingDay.dayNumber as SplitDayNumber)
    : undefined;

  const persistSplit = (next: CustomSplit) => {
    const updated: UserData = {
      ...userData,
      splits: (userData.splits ?? []).map(s => (s.id === next.id ? next : s)),
    };
    setUserData(updated);
    void saveUser(updated, token);
  };

  const handleSetMode = (dayNumber: number, blockId: string, setMode: 'linear' | 'pyramid' | 'cluster', cluster?: {miniReps: number; intraRestSec: number}) => {
    if (!activeSplit) return;
    const dn = dayNumber as SplitDayNumber;
    const next = withBlockSetMode(activeSplit, dn, blockId, setMode, cluster);
    persistSplit(next);
  };

  return (
    <TrainingTab
      userData={userData}
      {...training}
      onGoCalculator={onGoCalculator}
      totalSessions={training.totalSessions ?? 16}
      programSubtitle={programSubtitle}
      currentBlocks={currentBlocks}
      nextBlocks={nextBlocks}
      onSetModeChange={handleSetMode}
      extraSections={
        <>
          {extraSections}
          {activeSplit ? (
            <SplitWeekSection
              split={activeSplit}
              savedExercises={userData.exercises}
              initialWeek={training.currentWeekIdx}
              onSplitChange={persistSplit}
              onSetModeChange={handleSetMode}
            />
          ) : null}
        </>
      }
    />
  );
}
