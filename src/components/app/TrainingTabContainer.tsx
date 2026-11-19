import TrainingTab from '../../screens/TrainingTab';
import '../../styles/tabs/training-tab.css';
import {useTrainingProgram} from '../../hooks/useTrainingProgram';
import {PROGRAM_DAYS_PER_WEEK} from '../../types';
import type {UserData} from '../../types';
import {blocksForDay} from '@training/shared/data/split-blocks';
import {withBlockSetMode} from '@training/shared/data/split-blocks';
import type {SplitDayNumber} from '@training/shared/types';

interface TrainingTabContainerProps {
  userData: UserData;
  token: string;
  setUserData: (value: UserData | null) => void;
  onGoCalculator: () => void;
  programSubtitle?: string;
}

/** Lazy boundary: keeps training program logic out of the initial shell chunk. */
export default function TrainingTabContainer({
  userData,
  token,
  setUserData,
  onGoCalculator,
  programSubtitle = `8 недель · ${PROGRAM_DAYS_PER_WEEK} дня · волновая прогрессия`,
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

  const currentBlocks = activeSplit
    ? blocksForDay(activeSplit, (training.currentDayIdx + 1) as SplitDayNumber)
    : undefined;
  const nextBlocks = activeSplit
    ? blocksForDay(activeSplit, (training.nextDayIdx + 1) as SplitDayNumber)
    : undefined;

  const handleSetMode = (blockId: string, setMode: 'linear' | 'pyramid' | 'cluster', cluster?: {miniReps: number; intraRestSec: number}) => {
    if (!activeSplit) return;
    const dayNumber = (training.currentDayIdx + 1) as SplitDayNumber;
    const next = withBlockSetMode(activeSplit, dayNumber, blockId, setMode, cluster);
    if (setUserData) {
      setUserData({...userData, splits: (userData.splits ?? []).map(s => (s.id === next.id ? next : s))});
    }
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
    />
  );
}
