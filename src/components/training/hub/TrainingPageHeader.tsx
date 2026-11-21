import type {ReactNode} from 'react';

interface TrainingPageHeaderProps {
  title: string;
  backLabel?: string;
  onBack?: () => void;
  trailing?: ReactNode;
}

export function TrainingPageHeader({title, backLabel = 'Назад', onBack, trailing}: TrainingPageHeaderProps) {
  return (
    <header className="training-page-header">
      <div className="training-page-header__inner">
        {onBack ? (
          <button
            type="button"
            className="training-page-header__back"
            onClick={onBack}
            aria-label={backLabel}>
            <svg className="training-page-header__chevron" width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
              <path d="M8.5 1.5 L1.5 8 L8.5 14.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{backLabel}</span>
          </button>
        ) : (
          <span className="training-page-header__spacer" aria-hidden="true" />
        )}
        <h1 className="training-page-header__title">{title}</h1>
        <div className="training-page-header__trailing">{trailing}</div>
      </div>
    </header>
  );
}