import { useCallback, useSyncExternalStore } from 'react'

const URL_STATE_EVENT = 'urlstatechange'
const HISTORY_WRITE_INTERVAL_MS = 150

let replaceTimer: number | undefined
let lastReplaceAt = -HISTORY_WRITE_INTERVAL_MS

function getSearchSnapshot(): string {
  if (typeof window === 'undefined') return ''
  return window.location.search
}

function getServerSnapshot(): string {
  return ''
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('popstate', onStoreChange)
  window.addEventListener(URL_STATE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('popstate', onStoreChange)
    window.removeEventListener(URL_STATE_EVENT, onStoreChange)
  }
}

function readParam<T extends string>(search: string, key: string): T | null {
  return new URLSearchParams(search).get(key) as T | null
}

function dispatchURLStateChange(): void {
  window.dispatchEvent(new Event(URL_STATE_EVENT))
}

function replaceStateThrottled(next: string): void {
  const now = performance.now()
  const delay = Math.max(0, HISTORY_WRITE_INTERVAL_MS - (now - lastReplaceAt))

  window.clearTimeout(replaceTimer)

  const write = () => {
    replaceTimer = undefined
    lastReplaceAt = performance.now()
    window.history.replaceState(null, '', next)
    dispatchURLStateChange()
  }

  if (delay === 0) {
    write()
    return
  }

  replaceTimer = window.setTimeout(write, delay)
}

function writeParam(key: string, value: string | null, push: boolean): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  if (value === null || value === '') {
    params.delete(key)
  } else {
    params.set(key, value)
  }

  const query = params.toString()
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`

  if (push) {
    window.clearTimeout(replaceTimer)
    replaceTimer = undefined
    window.history.pushState(null, '', next)
    dispatchURLStateChange()
    return
  }

  replaceStateThrottled(next)
}

export interface URLStateAPI<T extends string> {
  value: T | null
  setValue: (next: T | null) => void
  commitHistory: () => void
}

/**
 * Атомарно меняет несколько параметров поиска и будит подписчиков.
 * Нужен там, где два setValue подряд не работают: writeParam откладывает
 * replaceState, поэтому второй вызов читает ещё старый URL и первый теряется.
 */
export function navigateSearch(
  updates: Readonly<Record<string, string | null>>,
  push = false,
): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '') params.delete(key)
    else params.set(key, value)
  }

  const query = params.toString()
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`

  if (push) {
    window.history.pushState(null, '', next)
  } else {
    window.history.replaceState(null, '', next)
  }
  dispatchURLStateChange()
}

export function useURLState<T extends string = string>(key: string): URLStateAPI<T> {
  const search = useSyncExternalStore(subscribe, getSearchSnapshot, getServerSnapshot)
  const value = readParam<T>(search, key)

  const setValue = useCallback(
    (next: T | null) => writeParam(key, next, false),
    [key],
  )

  const commitHistory = useCallback(() => {
    if (typeof window === 'undefined') return
    window.history.pushState(null, '', window.location.href)
    dispatchURLStateChange()
  }, [])

  return { value, setValue, commitHistory }
}
