import {
  PRIORITY_ORDER,
  STRENGTH_AUTOREG_CHECKLIST,
  STRENGTH_BICEPS_NOTE,
  STRENGTH_FACTOR_TIERS,
  STRENGTH_FORMULA_OVERVIEW,
  STRENGTH_PROTOCOL_STEPS,
  STRENGTH_SCIENCE_CARDS,
  STRENGTH_WARMUP_STACK,
  STRENGTH_WAVE_PHASES,
  type PriorityLevel,
  type StrengthScienceCard,
} from '@training/shared/data/strength-formula';
import type {MouseEvent, ReactNode} from 'react';
import {useDetailsState} from '../hooks/useDetailsState';
import {TierPyramid, type TierEntry} from './TierPyramid';

const INTERNAL_NAV = [
  {id: 'principles', label: 'Принципы'},
  {id: 'wave', label: 'Волна'},
  {id: 'warmup', label: 'Разминка'},
  {id: 'autoreg', label: 'Авторегуляция'},
  {id: 'science', label: 'Наука'},
] as const;

const LEVEL_LABELS: Record<PriorityLevel, string> = {
  foundation: 'Фундамент',
  optimization: 'Оптимизация',
  tuning: 'Тюнинг',
  advanced: 'Только опытным',
  remove: 'Убрать',
};

const AUTOREG_COLUMNS = [
  {id: 'before', title: 'До', items: STRENGTH_AUTOREG_CHECKLIST.before},
  {id: 'during', title: 'Во время', items: STRENGTH_AUTOREG_CHECKLIST.during},
  {id: 'after', title: 'После', items: STRENGTH_AUTOREG_CHECKLIST.after},
] as const;

const FORMULA_OPERATORS = ['×', '×', '×', '−'] as const;

const FORMULA_PARTS = [...STRENGTH_FORMULA_OVERVIEW.formulaParts].sort(
  (a, b) => a.visualOrder - b.visualOrder,
);

const PRIORITY_FACTORS = [...STRENGTH_FACTOR_TIERS].sort(
  (a, b) => PRIORITY_ORDER[a.level] - PRIORITY_ORDER[b.level],
);

/** Same card language as Tier List: badge + chips + readable note. */
const PRIORITY_TIERS: readonly TierEntry[] = PRIORITY_FACTORS.map(tier => ({
  tier: tier.rank.replace('-TIER', ''),
  color: tier.color,
  textColor: tier.textColor,
  label: `${LEVEL_LABELS[tier.level]}: ${tier.plainLabel}`,
  items: tier.keyParameters,
  note: `${tier.detail} ${tier.action}`,
}));

const SCIENCE_CARD_GROUPS = Array.from(
  STRENGTH_SCIENCE_CARDS.reduce((groups, card) => {
    const currentGroup = groups.get(card.group) ?? [];
    currentGroup.push(card);
    groups.set(card.group, currentGroup);
    return groups;
  }, new Map<string, StrengthScienceCard[]>()),
);

function groupStorageId(group: string) {
  return (
    group
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, '-')
      .replace(/^-|-$/g, '') || 'science'
  );
}

function StrengthBlock({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="ta-strength-block" aria-labelledby={`${id}-heading`}>
      <div className="ta-strength-block__head">
        <span className="ta-strength-eyebrow">{eyebrow}</span>
        <h3 id={`${id}-heading`} className="ta-strength-block__title">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <div className="ta-strength-info-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ScienceDetailsGroup({
  group,
  cards,
  defaultOpen,
}: {
  group: string;
  cards: StrengthScienceCard[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useDetailsState(groupStorageId(group), defaultOpen);

  const handleSummaryClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setOpen(current => !current);
  };

  const contentId = `strength-science-${groupStorageId(group)}`;

  return (
    <details className={`ta-strength-science-group${open ? ' is-open' : ''}`} open={open}>
      <summary
        className="ta-strength-science-group__summary"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={handleSummaryClick}>
        <span className="ta-strength-science-group__title">{group}</span>
        <span className="ta-strength-science-group__count">
          {cards.length} {cards.length === 1 ? 'карточка' : 'карточек'}
        </span>
      </summary>

      <div id={contentId} className="ta-strength-science-group__content">
        <div className="ta-strength-science-group__inner">
          {cards.map(card => (
            <article key={card.id} className="ta-strength-science-card">
              <div className="ta-strength-science-card__meta">
                <span>{card.category}</span>
                <span>Diff {card.difficulty}/3</span>
              </div>
              <h4 className="ta-strength-science-card__question">{card.question}</h4>
              <p className="ta-strength-copy">{card.answer}</p>
              <p className="ta-strength-science-card__apply">
                <strong>Как применить:</strong> {card.application}
              </p>
              <footer className="ta-strength-science-card__source">
                <span>{card.source}</span>
                <span>{card.tags.map(tag => `#${tag}`).join(' ')}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </details>
  );
}

export function StrengthFormulaSection() {
  return (
    <div className="ta-strength">
      <section className="ta-strength-hero" aria-labelledby="strength-system-heading">
        <span className="ta-strength-eyebrow">Формула</span>
        <h3 id="strength-system-heading" className="ta-strength-title">
          Сила — это система
        </h3>
        <p className="ta-strength-lede">{STRENGTH_FORMULA_OVERVIEW.thesis}</p>

        <div
          className="ta-strength-formula"
          aria-label="Формула силы: специфичность умножить на тяжёлые экспозиции, умножить на восстановление, умножить на качество повторений, минус лишняя усталость">
          {FORMULA_PARTS.map((part, index) => (
            <span key={part.id} className="ta-strength-formula__pair">
              <span
                className="ta-strength-formula__term"
                data-part={part.id}
                data-tone={part.tone}
                title={part.hint}>
                {part.label}
              </span>
              {FORMULA_OPERATORS[index] ? (
                <span
                  className="ta-strength-formula__op"
                  data-op={FORMULA_OPERATORS[index] === '−' ? 'minus' : 'multiply'}
                  aria-hidden="true">
                  {FORMULA_OPERATORS[index]}
                </span>
              ) : null}
            </span>
          ))}
        </div>

        <div className="ta-strength-hero__footer">
          <div className="ta-strength-chip-row" aria-label="Пример исходных данных">
            {STRENGTH_FORMULA_OVERVIEW.parameters.map(item => (
              <span key={item} className="ta-strength-chip">
                {item}
              </span>
            ))}
          </div>
          <div className="ta-strength-meta-pair">
            <span>Логика</span>
            <strong>{STRENGTH_FORMULA_OVERVIEW.logic}</strong>
          </div>
        </div>
      </section>

      <nav className="ta-strength-nav" aria-label="Разделы главы Формула силы">
        {INTERNAL_NAV.map(item => (
          <a key={item.id} className="ta-strength-nav__link" href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>

      <StrengthBlock id="principles" eyebrow="Приоритеты" title="Что двигает силу первым">
        <TierPyramid tiers={PRIORITY_TIERS} />
      </StrengthBlock>

      <StrengthBlock id="wave" eyebrow="Периодизация" title="8-недельная волна">
        <div className="ta-strength-wave">
          <div className="ta-strength-wave__rail" aria-hidden="true">
            <span />
          </div>
          <ol className="ta-strength-wave__phases">
            {STRENGTH_WAVE_PHASES.map(phase => (
              <li key={phase.id} className="ta-strength-wave__phase" data-phase={phase.id}>
                <header className="ta-strength-wave__head">
                  <span className="ta-strength-wave__weeks">Недели {phase.weeks}</span>
                  <h4>{phase.phase}</h4>
                </header>
                <p className="ta-strength-wave__goal">{phase.goal}</p>
                <dl className="ta-strength-wave__meta">
                  <InfoRow label="Интенсивность" value={phase.intensity} />
                  <InfoRow label="Схема" value={phase.scheme} />
                  <InfoRow label="Объём" value={phase.volume} />
                  <InfoRow label="Стоп-правило" value={phase.stopRule} />
                </dl>
                <p className="ta-strength-copy">{phase.focus}</p>
              </li>
            ))}
          </ol>
        </div>

        <aside className="ta-strength-note" aria-label="Примечание по объёму бицепса">
          <span>Отдельно</span>
          <p>{STRENGTH_BICEPS_NOTE}</p>
        </aside>
      </StrengthBlock>

      <StrengthBlock id="warmup" eyebrow="Подготовка" title="Разминка как лестница">
        <ul className="ta-strength-ladder" role="list">
          {STRENGTH_WARMUP_STACK.map(step => (
            <li
              key={step.stage}
              className={`ta-strength-ladder__step${step.isWorkSet ? ' is-working' : ''}`}>
              <span className="ta-strength-ladder__stage">{step.stage}</span>
              <span className="ta-strength-ladder__weight">{step.weight || '\u00a0'}</span>
              <span className="ta-strength-ladder__goal">{step.goal}</span>
              <span className="ta-strength-ladder__rest">{step.rest || '\u00a0'}</span>
              <span className="ta-strength-ladder__reps">{step.reps} повт</span>
              {step.isWorkSet ? (
                <span className="ta-strength-ladder__badge">Рабочий подход</span>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="ta-strength-note ta-strength-note--compact">
          Вес округляется вверх к ближайшим 2,5 кг: {STRENGTH_FORMULA_OVERVIEW.rounding}.
        </p>
        <p className="ta-strength-note ta-strength-note--compact" style={{ marginTop: '8px' }}>
          💡 За сессию обычно достаточно 1–2 качественных тяжёлых прямых подходов в упражнении;
          объём добирается back-off подходами.
        </p>
      </StrengthBlock>

      <StrengthBlock id="autoreg" eyebrow="Контроль нагрузки" title="Авторегуляция без героизма">
        <div className="ta-strength-autoreg">
          {AUTOREG_COLUMNS.map(column => (
            <section
              key={column.id}
              className="ta-strength-autoreg__column"
              aria-labelledby={`autoreg-${column.id}`}>
              <h4 id={`autoreg-${column.id}`}>{column.title}</h4>
              <ul role="list">
                {column.items.map(item => (
                  <li key={item} className="ta-strength-autoreg__item">
                    <span className="ta-strength-autoreg__check" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="ta-strength-protocol" aria-label="Протокол запуска">
          {STRENGTH_PROTOCOL_STEPS.map(step => (
            <article key={step.step} className="ta-strength-protocol__step">
              <span>{step.step}</span>
              <h4>{step.title}</h4>
              {step.description ? <p>{step.description}</p> : null}
              {step.bullets ? (
                <ul role="list">
                  {step.bullets.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </StrengthBlock>

      <StrengthBlock id="science" eyebrow="Доказательная база" title="Научные карточки">
        <div className="ta-strength-science">
          {SCIENCE_CARD_GROUPS.map(([group, cards], index) => (
            <ScienceDetailsGroup
              key={group}
              group={group}
              cards={cards}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </StrengthBlock>
    </div>
  );
}
