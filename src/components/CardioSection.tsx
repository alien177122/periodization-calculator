import {CARDIO_CONCEPTS, type TheoryTextPart} from '../data/theory-cardio';
import {Stat} from './ui/Stat';

function renderTextPart(part: TheoryTextPart) {
  if (part.kind === 'stat') {
    return <Stat key={part.id}>{part.text}</Stat>;
  }

  return <span key={part.id}>{part.text}</span>;
}

export function CardioSection() {
  return (
    <div className="ta-cardio">
      <aside className="ta-cardio-note" role="note">
        Аэробная активность и регулярные нагрузки связаны со снижением смертности — это подтверждают
        крупные наблюдательные исследования. Проценты снижения риска показывают{' '}
        <strong>ассоциацию</strong>, не гарантию. Любые интенсивные нагрузки требуют учёта возраста,
        подготовки и состояния ССС.
      </aside>

      <div className="ta-cardio-grid" role="list">
        {CARDIO_CONCEPTS.map(concept => (
          <article
            key={concept.id}
            className="ta-cardio-card"
            data-variant={concept.variant ?? 'default'}
            role="listitem">
            <h3 className="ta-cardio-card__title">{concept.title}</h3>
            <div className="ta-cardio-card__body">
              {concept.paragraphs.map(paragraph => (
                <p key={paragraph.id}>{paragraph.parts.map(renderTextPart)}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <aside className="ta-cardio-disclaimer" role="note">
        <strong>Ограничения.</strong> Особая осторожность: ССЗ, аритмии, тяжёлая гипертония,
        ожирение, беременность, послеоперационный период. Начинай с минимального объёма.
      </aside>
    </div>
  );
}
