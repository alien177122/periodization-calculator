import {useCallback, useEffect, useRef, useState} from 'react';
import type {BillingStatus, CheckoutResponse} from '../types/billing.ts';

export type BillingHookState =
  | {status: 'loading'}
  | {status: 'ready'; billing: BillingStatus}
  | {status: 'error'; message: string};

export interface UseBillingOptions {
  token: string;
  getBillingStatus: (token: string) => Promise<BillingStatus>;
  createCheckout: (token: string) => Promise<CheckoutResponse>;
  redirectToPayment?: (paymentUrl: string) => void;
  pollIntervalMs?: number;
  maxPollAttempts?: number;
}

const DEFAULT_POLL_INTERVAL_MS = 3000;
const DEFAULT_MAX_POLL_ATTEMPTS = 10;

export function useBilling({
  token,
  getBillingStatus,
  createCheckout,
  redirectToPayment,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxPollAttempts = DEFAULT_MAX_POLL_ATTEMPTS,
}: UseBillingOptions) {
  const [state, setState] = useState<BillingHookState>({status: 'loading'});
  const [isPolling, setIsPolling] = useState(false);
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const refresh = useCallback(async (): Promise<BillingStatus | null> => {
    if (!token) {
      setState({status: 'error', message: 'Нет активной сессии'});
      return null;
    }

    try {
      const billing = await getBillingStatus(token);
      setState({status: 'ready', billing});
      return billing;
    } catch {
      setState({status: 'error', message: 'Не удалось получить статус оплаты'});
      return null;
    }
  }, [getBillingStatus, token]);

  const startPolling = useCallback(() => {
    stopPolling();
    setIsPolling(true);

    let attempts = 0;

    const poll = async () => {
      const billing = await refresh();
      if (billing?.premium) {
        stopPolling();
        return;
      }

      attempts += 1;
      if (attempts < maxPollAttempts && billing?.pendingPayment) {
        pollingTimerRef.current = setTimeout(() => {
          void poll();
        }, pollIntervalMs);
        return;
      }

      stopPolling();
    };

    void poll();
  }, [maxPollAttempts, pollIntervalMs, refresh, stopPolling]);

  const openCheckout = useCallback(async (): Promise<CheckoutResponse | null> => {
    if (!token) {
      setState({status: 'error', message: 'Нет активной сессии'});
      return null;
    }

    try {
      const checkout = await createCheckout(token);
      if (redirectToPayment) {
        redirectToPayment(checkout.paymentUrl);
      } else if (typeof window !== 'undefined') {
        window.location.assign(checkout.paymentUrl);
      }
      return checkout;
    } catch {
      setState({status: 'error', message: 'Не удалось создать платёж. Попробуй ещё раз.'});
      return null;
    }
  }, [createCheckout, redirectToPayment, token]);

  const handleReturnFromPayment = useCallback(
    (queryParam: string | null) => {
      if (queryParam === 'success') {
        startPolling();
        return;
      }
      void refresh();
    },
    [refresh, startPolling],
  );

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void refresh();
    });
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [refresh, stopPolling]);

  return {
    state,
    isPolling,
    refresh,
    startPolling,
    stopPolling,
    openCheckout,
    handleReturnFromPayment,
  };
}
