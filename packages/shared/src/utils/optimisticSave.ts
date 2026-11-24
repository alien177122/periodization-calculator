import type {UserData} from '../types/index.ts';

export async function optimisticSaveUser(
  previous: UserData,
  updated: UserData,
  setUserData: (value: UserData) => void,
  saveUser: (
    data: UserData,
    token: string,
  ) => Promise<{ok: boolean; pending?: boolean} | void> | void,
  token: string,
  onError?: (message: string) => void,
  errorMessage = 'Не удалось сохранить',
): Promise<boolean> {
  setUserData(updated);
  try {
    const result = await Promise.resolve(saveUser(updated, token));
    if (result && result.pending) {
      return true;
    }
    if (result && result.ok === false) {
      throw new Error('Failed to save');
    }
    return true;
  } catch {
    setUserData(previous);
    onError?.(errorMessage);
    return false;
  }
}
