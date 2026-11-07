import type {AppTab} from './tabs';

const TAB_LABELS: Record<AppTab, string> = {
  calculator: 'Калькулятор',
  theory: 'Теория',
  training: 'Тренировка',
  split: 'Сплит',
  journal: 'Журнал',
};

interface TabPanelFallbackProps {
  tab: AppTab;
}

/** Small spinning mark while a lazy tab chunk loads. */
export function TabPanelFallback({tab}: TabPanelFallbackProps) {
  return (
    <div className="tab-panel-fallback" role="status" aria-live="polite" aria-busy="true">
      <p className="tab-panel-fallback__status">Загрузка: {TAB_LABELS[tab]}</p>
      <span className="tab-panel-fallback__spinner" aria-hidden="true" />
    </div>
  );
}
