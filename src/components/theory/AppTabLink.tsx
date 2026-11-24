import type {ReactNode} from 'react';
import type {AppTab} from '../app/tabs';
import {useURLState, navigateSearch} from '../../hooks/useURLState';

interface AppTabLinkProps {
  tab: AppTab;
  view?: string;
  children: ReactNode;
  ariaLabel?: string;
}

export function AppTabLink({tab, view, children, ariaLabel}: AppTabLinkProps) {
  const {setValue} = useURLState<AppTab>('tab');

  return (
    <button
      type="button"
      className="ta-see-also-link"
      onClick={() => {
        if (view) navigateSearch({tab, view});
        else setValue(tab);
      }}
      aria-label={ariaLabel}>
      {children}
    </button>
  );
}
