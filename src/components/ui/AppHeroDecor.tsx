import type {AppTab} from '../app/tabs';
import {parseAppHeroTitle} from './appHeroParsing';
import {AppHeroRotatingBento} from './AppHeroRotatingBento';

interface AppHeroAmbientProps {
  className?: string;
}

/** Minimal ambient wash — ambient shell orbs carry depth; hero stays frosted, not glowy. */
export function AppHeroAmbient({className}: AppHeroAmbientProps) {
  return (
    <div className={`app-hero__ambient${className ? ` ${className}` : ''}`} aria-hidden="true">
      <div className="app-hero__ambient-wash app-hero__ambient-wash--enter" />
    </div>
  );
}

type TitleElementProps = React.HTMLAttributes<HTMLHeadingElement> & {
  title: string;
};

function AppHeroTitleContent({title, className, ...rest}: TitleElementProps) {
  const parsed = parseAppHeroTitle(title);

  if (!parsed.num) {
    return (
      <h1 id="app-hero-title" className={className} {...rest}>
        {title}
      </h1>
    );
  }

  return (
    <h1 id="app-hero-title" className={`${className ?? ''} app-hero__title`} {...rest}>
      <span className="app-hero__title-lead">{parsed.lead}</span>
      <span className="app-hero__title-accent app-hero__title-accent--enter">{parsed.num}</span>
      {parsed.tail ? <span className="app-hero__title-tail">{parsed.tail}</span> : null}
    </h1>
  );
}

interface AppHeroBodyProps {
  label: string;
  title: string;
  subtitle: string;
  tab?: AppTab;
  onTitleClick?: () => void;
}

export function AppHeroBody({label, title, subtitle, tab, onTitleClick}: AppHeroBodyProps) {
  const parsed = parseAppHeroTitle(title);
  const isInteractive = Boolean(onTitleClick);
  // Calculator first viewport: title + one subtitle line, no tip cards / aside chrome.
  const compact = false;
  const showAside = Boolean(parsed.ringLabel) && !compact;
  const showBento = Boolean(tab) && !compact;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onTitleClick) {
      e.preventDefault();
      onTitleClick();
    }
  };

  const titleClass = `theory-hero-title app-hero__title-block${
    isInteractive ? ' theory-hero-title--interactive' : ''
  }`;

  const titleProps = {
    title,
    className: titleClass,
    onClick: onTitleClick,
    onKeyDown: handleKeyDown,
    role: isInteractive ? ('button' as const) : undefined,
    tabIndex: isInteractive ? 0 : undefined,
    style: isInteractive ? {cursor: 'pointer' as const} : undefined,
  };

  return (
    <>
      <AppHeroAmbient />
      <div className={`app-hero__glass${compact ? ' app-hero__glass--compact' : ''}`}>
        <div
          className={`app-hero__editorial app-hero__editorial--enter${
            compact ? ' app-hero__editorial--compact' : ''
          }`}>
          {showAside ? (
            <aside className="app-hero__aside app-hero__stagger-1" aria-hidden="true">
              <span className="app-hero__aside-kicker">{label}</span>
              <span className="app-hero__aside-value">{parsed.ringLabel}</span>
            </aside>
          ) : null}

          <span className="app-hero__label app-hero__stagger-2">{label}</span>

          <AppHeroTitleContent {...titleProps} />

          {showBento ? (
            <AppHeroRotatingBento key={tab} tab={tab!} />
          ) : subtitle ? (
            <p
              className={`theory-hero-subtitle app-hero__subtitle app-hero__stagger-4${
                compact
                  ? ' app-hero__subtitle--compact'
                  : ' app-hero__bento-cell app-hero__bento-cell--wide'
              }`}>
              {subtitle}
            </p>
          ) : null}

          <div
            className="theory-hero-line app-hero__line app-hero__line--enter"
            aria-hidden="true"
          />
        </div>
      </div>
    </>
  );
}
