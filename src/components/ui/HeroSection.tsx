import {memo} from 'react';
import type {AppTab} from '../app/tabs';
import {AppHeroBody} from './AppHeroDecor.tsx';

export interface HeroSectionProps {
  label: string;
  title: string;
  subtitle: string;
  tab?: AppTab;
  onTitleClick?: () => void;
  className?: string;
}

/** App shell hero — CSS-only entrance (no framer-motion in eager chunk). */
export const HeroSection = memo(function HeroSection({
  label,
  title,
  subtitle,
  tab,
  onTitleClick,
  className,
}: HeroSectionProps) {
  const compact = false;
  const headerClass = `theory-hero app-hero app-hero--live app-hero--enter${
    compact ? ' app-hero--compact' : ''
  }${className ? ` ${className}` : ''}`;

  return (
    <header className={headerClass} role="region" aria-labelledby="app-hero-title">
      <AppHeroBody
        label={label}
        title={title}
        subtitle={subtitle}
        tab={tab}
        onTitleClick={onTitleClick}
      />
    </header>
  );
});
