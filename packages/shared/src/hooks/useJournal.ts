import {useCallback, useMemo, useState} from 'react';
import type {JournalSession, JournalSet, UserData} from '../types/index.ts';
import {JOURNAL_LIMITS, todayLocalDate} from '../utils/journalLimits.ts';
import {buildPeakSeries, sessionPeak} from '../utils/journalMetrics.ts';

export interface UseJournalOptions {
  userData: UserData;
  exerciseKey: string;
  setUserData: (value: UserData) => void;
  saveUser: (data: UserData, token: string) => Promise<{ok: boolean; error?: string} | void>;
  token: string;
  onSaveError?: (message: string) => void;
}

export interface DraftSet {
  id: string;
  weight: string;
  reps: string;
  rpe: string;
  note: string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const emptyDraft = (): DraftSet => ({id: generateId(), weight: '', reps: '', rpe: '', note: ''});

export function useJournal({
  userData,
  exerciseKey,
  setUserData,
  saveUser,
  token,
  onSaveError,
}: UseJournalOptions) {
  const today = todayLocalDate();
  const [draftSets, setDraftSets] = useState<DraftSet[]>([]);
  const [sessionNote, setSessionNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const sessions = useMemo(
    () => (userData.journal ?? []).filter(session => session.exerciseKey === exerciseKey),
    [userData.journal, exerciseKey],
  );

  const todaySession = useMemo(
    () => sessions.find(session => session.date === today),
    [sessions, today],
  );

  const editingSession = useMemo(
    () => (editingSessionId ? sessions.find(session => session.id === editingSessionId) : null),
    [editingSessionId, sessions],
  );

  const chartPoints = useMemo(() => buildPeakSeries(sessions, 8), [sessions]);

  const history = useMemo(
    () => [...sessions].sort((a, b) => b.date.localeCompare(a.date)),
    [sessions],
  );

  const toDraftSets = useCallback(
    (sets: JournalSet[]): DraftSet[] =>
      sets.map(set => ({
        id: generateId(),
        weight: String(set.weight),
        reps: String(set.reps),
        rpe: set.rpe != null ? String(set.rpe) : '',
        note: set.note ?? '',
      })),
    [],
  );

  const loadTodayIntoDraft = useCallback(() => {
    if (todaySession) {
      setDraftSets(toDraftSets(todaySession.sets));
      setSessionNote(todaySession.sessionNote ?? '');
      return;
    }
    setDraftSets([]);
    setSessionNote('');
  }, [todaySession, toDraftSets]);

  const [prevExerciseKey, setPrevExerciseKey] = useState(exerciseKey);
  if (exerciseKey !== prevExerciseKey) {
    setPrevExerciseKey(exerciseKey);
    setEditingSessionId(null);
    if (todaySession) {
      setDraftSets(toDraftSets(todaySession.sets));
      setSessionNote(todaySession.sessionNote ?? '');
    } else {
      setDraftSets([]);
      setSessionNote('');
    }
  }

  const copyLastSession = useCallback(() => {
    const last = history.find(session => session.date !== today) ?? history[0];
    if (!last) return;
    setEditingSessionId(null);
    setDraftSets(toDraftSets(last.sets));
    setSessionNote(last.sessionNote ?? '');
  }, [history, today, toDraftSets]);

  const loadSessionIntoDraft = useCallback(
    (session: JournalSession) => {
      setEditingSessionId(session.id);
      setDraftSets(toDraftSets(session.sets));
      setSessionNote(session.sessionNote ?? '');
    },
    [toDraftSets],
  );

  const cancelEdit = useCallback(() => {
    setEditingSessionId(null);
    loadTodayIntoDraft();
  }, [loadTodayIntoDraft]);

  const addDraftRow = useCallback(() => {
    setDraftSets(current => {
      if (current.length >= JOURNAL_LIMITS.MAX_SETS_PER_SESSION) return current;
      return [...current, emptyDraft()];
    });
  }, []);

  const updateDraftSet = useCallback((index: number, patch: Partial<DraftSet>) => {
    setDraftSets(current =>
      current.map((set, setIndex) => (setIndex === index ? {...set, ...patch} : set)),
    );
  }, []);

  const removeDraftSet = useCallback((index: number) => {
    setDraftSets(current => current.filter((_, setIndex) => setIndex !== index));
  }, []);

  const persistJournal = useCallback(
    async (journal: JournalSession[]) => {
      const updated: UserData = {...userData, journal};
      setSaving(true);
      setUserData(updated);
      try {
        const result = await saveUser(updated, token);
        if (result && 'ok' in result && !result.ok) {
      const errMsg = 'error' in result && typeof result.error === 'string' ? result.error : 'Failed to save';
          throw new Error(errMsg);
        }
      } catch (e) {
        console.error('persistJournal error:', e);
        const isNetworkError = e instanceof Error && (
          e.message.toLowerCase().includes('fetch') ||
          e.message.toLowerCase().includes('network') ||
          e.message.toLowerCase().includes('load') ||
          e.message.toLowerCase().includes('http') ||
          e.message.toLowerCase().includes('status')
        );
        if (!isNetworkError) {
          onSaveError?.('Не удалось сохранить журнал. Попробуй снова.');
        } else {
          console.warn('Network error when saving journal (saved locally):', e);
        }
      } finally {
        setSaving(false);
      }
    },
    [onSaveError, saveUser, setUserData, token, userData],
  );

  const saveSession = useCallback(async () => {
    const sets = draftSets
      .map((set, index) => {
        const weight = parseFloat(set.weight);
        const reps = parseInt(set.reps, 10);
        if (!weight || weight <= 0 || !reps || reps < 1) return null;
        const normalized: JournalSet = {
          setIndex: index + 1,
          weight,
          reps,
        };
        const rpe = parseFloat(set.rpe);
        if (set.rpe.trim() && rpe >= 6 && rpe <= 10) normalized.rpe = rpe;
        if (set.note.trim()) {
          normalized.note = set.note.trim().slice(0, JOURNAL_LIMITS.MAX_SET_NOTE_LENGTH);
        }
        return normalized;
      })
      .filter((set): set is JournalSet => set !== null);

    if (sets.length === 0) {
      onSaveError?.('Добавь хотя бы один подход с весом и повторениями');
      return;
    }

    const now = new Date().toISOString();
    const targetSession = editingSession ?? todaySession;
    const sessionDate = editingSession?.date ?? today;

    const session: JournalSession = {
      id: targetSession?.id ?? crypto.randomUUID(),
      exerciseKey,
      date: sessionDate,
      sets,
      createdAt: targetSession?.createdAt ?? now,
      updatedAt: now,
      ...(sessionNote.trim()
        ? {sessionNote: sessionNote.trim().slice(0, JOURNAL_LIMITS.MAX_NOTE_LENGTH)}
        : {}),
    };

    const other = (userData.journal ?? []).filter(entry => entry.id !== session.id);
    await persistJournal([...other, session]);
    setEditingSessionId(null);
    if (session.date === today) {
      loadTodayIntoDraft();
    } else {
      setDraftSets([]);
      setSessionNote('');
    }
  }, [
    draftSets,
    editingSession,
    exerciseKey,
    loadTodayIntoDraft,
    onSaveError,
    persistJournal,
    sessionNote,
    today,
    todaySession,
    userData.journal,
  ]);

  const deleteSession = useCallback(
    async (id: string) => {
      const other = (userData.journal ?? []).filter(entry => entry.id !== id);
      await persistJournal(other);
      if (editingSessionId === id) {
        setEditingSessionId(null);
        loadTodayIntoDraft();
      }
    },
    [editingSessionId, loadTodayIntoDraft, persistJournal, userData.journal],
  );

  return {
    today,
    draftSets,
    sessionNote,
    setSessionNote,
    chartPoints,
    history,
    saving,
    editingSessionId,
    editingSession,
    peakLabel:
      draftSets.length > 0
        ? sessionPeak(
            draftSets.flatMap((set, index) => {
              const weight = parseFloat(set.weight);
              const reps = parseInt(set.reps, 10);
              if (!weight || !reps) return [];
              return [{setIndex: index + 1, weight, reps}];
            }),
          )
        : 0,
    loadTodayIntoDraft,
    copyLastSession,
    loadSessionIntoDraft,
    cancelEdit,
    addDraftRow,
    updateDraftSet,
    removeDraftSet,
    saveSession,
    deleteSession,
    emptyDraft,
  };
}
