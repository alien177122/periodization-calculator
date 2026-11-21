import {ThemeToggle} from '../shared/ThemeToggle';
import {Button} from '../ui/Button';
import type {BillingHookState} from '@training/shared/hooks/useBilling';

interface AccountMenuProps {
  userName: string;
  billingState?: BillingHookState;
  checkoutDisabled?: boolean;
  isPolling?: boolean;
  onLogout: () => void;
  onOpenCheckout?: () => void;
  onRefreshBilling?: () => void;
}

export function AccountMenu({
  userName,
  billingState,
  checkoutDisabled = false,
  isPolling = false,
  onLogout,
  onOpenCheckout,
  onRefreshBilling,
}: AccountMenuProps) {
  const billingReady = billingState?.status === 'ready' ? billingState.billing : null;

  let billingLabel = 'Безлимит';
  let billingAction: (() => void) | undefined = onOpenCheckout;
  let billingDisabled = checkoutDisabled || isPolling;

  if (billingReady?.premium) {
    billingLabel = 'Безлимит ✓';
    billingAction = undefined;
    billingDisabled = true;
  } else if (billingReady?.pendingPayment) {
    billingLabel = isPolling ? 'Проверяем…' : 'Проверить';
    billingAction = onRefreshBilling;
  }

  return (
    <div className="account-menu" role="group" aria-label="Аккаунт">
      <ThemeToggle />
      <span className="account-menu__name" title={userName}>
        {userName}
      </span>
      {billingState && billingAction ? (
        <Button size="sm" variant="ghost" disabled={billingDisabled} onClick={billingAction}>
          {billingLabel}
        </Button>
      ) : billingState && billingReady?.premium ? (
        <span className="account-menu__badge">Безлимит</span>
      ) : null}
      <button type="button" className="account-menu__exit" onClick={onLogout} aria-label="Выйти">
        Выйти
      </button>
    </div>
  );
}