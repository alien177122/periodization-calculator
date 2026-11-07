import type {Block, InlineSpan} from '../lib/md';
import {parseInline} from '../lib/md';
import type {Article} from '../lib/content';
import {articleTitle} from '../lib/content';
import {parseMermaidDiagram} from '../lib/mermaid';
import type {ChartBar, ChartSeries} from '../../src/components/theory/DiagramChart';
import {DiagramChart} from '../../src/components/theory/DiagramChart';
import {DiagramBlock} from '../../src/components/theory/DiagramBlock';
import {DiagramFlow} from '../../src/components/theory/DiagramFlow';

type LevelTag = 'basic' | 'detailed' | 'deep' | 'remember' | null;

interface Section {
  title: string;
  tag: LevelTag;
  blocks: Block[];
}

const LEVEL_CHIP_CLASS: Record<'basic' | 'detailed' | 'deep', string> = {
  basic: 'ss-level-chip ss-level-chip--basic',
  detailed: 'ss-level-chip ss-level-chip--detailed',
  deep: 'ss-level-chip ss-level-chip--deep',
};

const LEVEL_TEXT: Record<'basic' | 'detailed' | 'deep', string> = {
  basic: 'Просто',
  detailed: 'Подробно',
  deep: 'Вглубь',
};

function tagOfHeading(text: string): LevelTag {
  const t = text.toLowerCase();
  if (/запомнить/.test(t)) return 'remember';
  if (/вглуб/.test(t)) return 'deep';
  if (/подробн/.test(t)) return 'detailed';
  if (/прост/.test(t)) return 'basic';
  return null;
}

/** «Уровень 1 — Просто: …» → «Просто» + чистый заголовок. */
function stripLevelPrefix(title: string, tag: LevelTag): string {
  if (tag !== 'basic' && tag !== 'detailed' && tag !== 'deep') return title;
  return title
    .replace(/^уровень\s*\d+\s*[—–-]\s*(?:просто|подробно|вглуб(?:ь|е))\s*:\s*/i, '')
    .trim();
}

/** Разбивка блоков статьи на секции по заголовкам ≤3 уровня. */
function splitSections(blocks: Block[]): Section[] {
  const sections: Section[] = [];
  let current: Section = {title: '', tag: null, blocks: []};
  for (const b of blocks) {
    if (b.kind === 'heading' && b.depth <= 3) {
      if (current.blocks.length > 0 || current.title !== '') sections.push(current);
      current = {
        title: stripLevelPrefix(b.text, tagOfHeading(b.text)),
        tag: tagOfHeading(b.text),
        blocks: [],
      };
    } else {
      current.blocks.push(b);
    }
  }
  if (current.blocks.length > 0) sections.push(current);
  return sections;
}

function Spans({spans}: {spans: InlineSpan[]}) {
  return (
    <>
      {spans.map((s, i) => {
        if (s.t === 'code') return <code key={i}>{s.v}</code>;
        if (s.t === 'bold') return <strong key={i}>{s.v}</strong>;
        if (s.t === 'italic') return <em key={i}>{s.v}</em>;
        if (s.t === 'link')
          return (
            <a key={i} href={s.href}>
              {s.v}
            </a>
          );
        return <span key={i}>{s.v}</span>;
      })}
    </>
  );
}

interface ChartSpec {
  kind: 'line' | 'bar';
  title?: string;
  aria: string;
  yLabel?: string;
  xLabel?: string;
  unit?: string;
  series?: ChartSeries[];
  xLabels?: string[];
  bars?: ChartBar[];
}

/** ```chart-фенс с JSON-описанием графика данных. */
function Chart({text}: {text: string}) {
  let spec: ChartSpec;
  try {
    spec = JSON.parse(text) as ChartSpec;
  } catch {
    return <pre className="ss-code">{text}</pre>;
  }
  const title = spec.title ?? 'График';
  if (spec.kind === 'bar' && spec.bars?.length) {
    return (
      <DiagramBlock title={title} ariaLabel={spec.aria}>
        <DiagramChart
          kind="bar"
          bars={spec.bars}
          accent="var(--ta-sec-01)"
          ariaLabel={spec.aria}
          yLabel={spec.yLabel}
          xLabel={spec.xLabel}
          unit={spec.unit}
        />
      </DiagramBlock>
    );
  }
  if (spec.kind === 'line' && spec.series?.length && spec.xLabels?.length) {
    return (
      <DiagramBlock title={title} ariaLabel={spec.aria}>
        <DiagramChart
          kind="line"
          series={spec.series}
          xLabels={spec.xLabels}
          accent="var(--ta-sec-01)"
          ariaLabel={spec.aria}
          yLabel={spec.yLabel}
          xLabel={spec.xLabel}
          unit={spec.unit}
        />
      </DiagramBlock>
    );
  }
  return <pre className="ss-code">{text}</pre>;
}

function Diagram({lang, text, articleTitle}: {lang: string; text: string; articleTitle: string}) {
  const ariaBase = `Схема в статье «${articleTitle}»`;
  const l = lang.toLowerCase();
  if (l === 'mermaid') {
    const diagram = parseMermaidDiagram(text);
    if (diagram && diagram.levels.length > 0) {
      return (
        <DiagramBlock title="Схема" ariaLabel={ariaBase}>
          <DiagramFlow
            levels={diagram.levels}
            edges={diagram.edges}
            zones={diagram.zones}
            accent="var(--ta-sec-01)"
          />
        </DiagramBlock>
      );
    }
    const caption =
      text
        .split('\n')
        .map(l => l.trim())
        .find(l => l !== '' && !/^(flowchart|graph)\b/i.test(l)) ?? 'см. исходник статьи';
    return (
      <div className="ss-diagram-fallback" role="img" aria-label="Схема (упрощение недоступно)">
        Схема
        <br />
        {caption}
      </div>
    );
  }
  if (l === 'chart') return <Chart text={text} />;
  return <pre className="ss-code">{text}</pre>;
}

function BlockView({block, articleTitle}: {block: Block; articleTitle: string}) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p>
          <Spans spans={block.spans} />
        </p>
      );
    case 'heading':
      return <h3 className="ss-section__title ss-subhead">{block.text}</h3>;
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={`ss-list ${block.ordered ? 'ss-list--ordered' : 'ss-list--bullet'}`}>
          {block.items.map((item, i) => (
            <li key={i}>
              <Spans spans={item.spans} />
              {item.children.length > 0 ? (
                <ul className="ss-list ss-list--bullet">
                  {item.children.map((c, j) => (
                    <li key={j}>
                      <Spans spans={parseInline(c)} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ListTag>
      );
    }
    case 'table':
      return (
        <div className="ss-table-wrap">
          <table className="ss-table">
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i}>
                    <Spans spans={parseInline(h)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>
                      <Spans spans={parseInline(cell)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'code':
      return <Diagram lang={block.lang} text={block.text} articleTitle={articleTitle} />;
    case 'quote':
      return (
        <blockquote className="ss-quote">
          <Spans spans={block.spans} />
        </blockquote>
      );
    case 'hr':
      return <hr className="ss-hr" />;
  }
}

function SectionView({section, articleTitle}: {section: Section; articleTitle: string}) {
  const body = (
    <div className="ss-prose">
      {section.blocks.map((b, i) => (
        <BlockView key={i} block={b} articleTitle={articleTitle} />
      ))}
    </div>
  );

  if (section.tag === 'remember') {
    return (
      <aside className="ss-remember">
        <div className="ss-remember__title">Что запомнить</div>
        {body}
      </aside>
    );
  }

  const isLevel = section.tag === 'basic' || section.tag === 'detailed' || section.tag === 'deep';
  return (
    <section className="ss-section">
      {section.title ? (
        <>
          {isLevel && section.tag ? (
            <span className={LEVEL_CHIP_CLASS[section.tag]}>{LEVEL_TEXT[section.tag]}</span>
          ) : null}
          <h2 className="ss-section__title">{section.title}</h2>
        </>
      ) : null}
      {body}
    </section>
  );
}

export function ArticleView({article}: {article: Article}) {
  const {meta} = article;
  return (
    <article className="ss-main">
      <header className="ss-article-head">
        <h1 className="ss-article-head__title">{meta.title}</h1>
        <div className="ss-article-head__meta">
          {meta.minutes ? <span className="ss-chip">~{meta.minutes} мин</span> : null}
          {meta.prerequisites.map(id => (
            <a key={id} className="ss-chip" href={`#/a/${id}`}>
              после: {articleTitle(id)}
            </a>
          ))}
        </div>
      </header>
      {splitSections(article.blocks).map((section, i) => (
        <SectionView key={i} section={section} articleTitle={meta.title} />
      ))}
      <footer className="ss-footer">Дев-превью · порт 5174 · не для продакшена</footer>
    </article>
  );
}
