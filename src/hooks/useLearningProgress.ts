import {useCallback, useState} from 'react';
import type {LearningItemProgress, LearningProgress, UserData} from '../types';
import {saveUser} from '../utils/api';

export type LearningMark = 'read' | 'ok' | 'retry';

interface UseLearningProgressOptions {
  userData: UserData;
  setUserData: (value: UserData) => void;
  token: string;
  onSaveError?: (message: string) => void;
}

/**
 * Прогресс маршрута обучения (L2/L3).
 *
 * Пишет в `UserData.learningProgress` и сразу синкает через общий saveUser:
 * офлайн-очередь уже встроена в API-клиент, поэтому отдельный путь не нужен.
 * Отметка «прочитано» не открывает следующий шаг — это делает только
 * `checked: 'ok'` (см. isLearningStepUnlocked в learning-track.ts).
 */
export function useLearningProgress({
  userData,
  setUserData,
  token,
  onSaveError,
}: UseLearningProgressOptions) {
  const [saving, setSaving] = useState(false);
  const progress: LearningProgress = userData.learningProgress ?? {};

  const markStep = useCallback(
    async (stepId: string, mark: LearningMark) => {
      const previous = userData.learningProgress?.[stepId];
      const updatedAt = new Date().toISOString();
      const item: LearningItemProgress = {
        read: true,
        updatedAt,
        ...(mark === 'read'
          ? previous?.checked
            ? {checked: previous.checked}
            : {}
          : {checked: mark}),
      };
      const updated: UserData = {
        ...userData,
        learningProgress: {
          ...userData.learningProgress,
          [stepId]: item,
        },
      };

      setUserData(updated);
      if (!token) return;

      setSaving(true);
      try {
        const result = await saveUser(updated, token);
        if (result && 'ok' in result && !result.ok) {
          onSaveError?.('Не удалось сохранить прогресс обучения. Попробуй снова.');
        }
      } catch (error) {
        console.error('learning progress save error:', error);
        onSaveError?.('Не удалось сохранить прогресс обучения. Попробуй снова.');
      } finally {
        setSaving(false);
      }
    },
    [onSaveError, setUserData, token, userData],
  );

  return {progress, saving, markStep};
}
