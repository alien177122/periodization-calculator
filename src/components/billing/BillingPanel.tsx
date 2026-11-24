import type {BillingStatus} from '@training/shared/types/billing';
import {Button} from '../ui/Button';

export interface BillingPanelProps {
  status: BillingStatus | null;
  loading: boolean;
  errorMessage?: string | null;
  isPolling: boolean;
  checkoutDisabled?: boolean;
  onCheckout: () => void;
  onRefresh: () => void;
}

export function BillingPanel({
  status,
  loading,
  errorMessage,
  isPolling,
  checkoutDisabled = false,
  onCheckout,
  onRefresh,
}: BillingPanelProps) {
  if (loading && !status) {
    return (
      <section className="billing-panel billing-panel--loading" aria-live="polite">
        <p className="billing-panel__meta">Загрузка статуса оплаты…</p>
      </section>
    );
  }

  if (!status) {
    return (
      <section className="billing-panel billing-panel--error" aria-live="polite">
        <p className="billing-panel__meta">{errorMessage ?? 'Статус оплаты недоступен'}</p>
        <Button size="sm" variant="ghost" type="button" onClick={onRefresh}>
          Обновить статус
        </Button>
      </section>
    );
  }

  // Premium already shown in UserBar badge — keep first viewport quiet.
  if (status.premium) {
    return null;
  }

  return (
    <section className="billing-panel" aria-label="Лимит бесплатных расчётов">
      <div className="billing-panel__header">
        <p className="billing-panel__title">Бесплатные расчёты 1ПМ</p>
        <p className="billing-panel__meta">
          Осталось {status.remaining} из {status.freeLimit}. Разовая оплата {status.price}{' '}
          {status.currency} — безлимит навсегда.
        </p>
      </div>

      {status.pendingPayment ? (
        <p className="billing-panel__notice" role="status">
          Ожидаем подтверждение оплаты{isPolling ? '…' : ''}.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="billing-panel__error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="billing-panel__actions">
        <Button
          type="button"
          className="billing-panel__checkout"
          disabled={checkoutDisabled || isPolling}
          onClick={onCheckout}>
          Открыть безлимитные расчёты
        </Button>
        {status.pendingPayment ? (
          <Button type="button" size="sm" variant="ghost" disabled={isPolling} onClick={onRefresh}>
            Проверить оплату
          </Button>
        ) : null}
      </div>
    </section>
  );
}
