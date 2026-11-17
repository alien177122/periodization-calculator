import type {ComponentType} from 'react';
import type {AppTab} from './tabs';
import {
  TabIconSplit,
  TabIconTheory,
} from './TabNavIcons';

const TAB_ICONS: Record<AppTab, ComponentType<{className?: string}>> = {
  split: TabIconSplit,
  theory: TabIconTheory,
};

interface TabNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export function TabNav({activeTab, onTabChange}: TabNavProps) {
  return (
    <nav className="tab-bar ta-mode-nav app-shell__nav" aria-label="Разделы приложения">
      <TabButton
        label="Тренировка"
        tab="split"
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      <TabButton label="Теория" tab="theory" activeTab={activeTab} onTabChange={onTabChange} />
    </nav>
  );
}

interface TabButtonProps {
  label: string;
  tab: AppTab;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

function TabButton({label, tab, activeTab, onTabChange}: TabButtonProps) {
  const active = activeTab === tab;
  const Icon = TAB_ICONS[tab];
  return (
    <button
      type="button"
      className={`tab-btn ta-mode-nav__item${active ? ' tab-active is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      onClick={() => onTabChange(tab)}>
      <span className="tab-btn-stack ta-mode-nav__stack">
        <span className="tab-btn-icon ta-mode-nav__icon" aria-hidden="true">
          <Icon className="tab-btn-icon__svg" />
        </span>
        <span className="tab-btn-label ta-mode-nav__label">{label}</span>
      </span>
    </button>
  );
}
