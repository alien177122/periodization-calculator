export function JournalRpeHelp() {
  return (
    <details className="journal-rpe-help">
      <summary className="journal-rpe-help__summary">Что такое RPE?</summary>
      <div className="journal-rpe-help__body">
        <p>
          <strong>RPE</strong> (Rate of Perceived Exertion) — субъективная оценка, насколько тяжёлым
          был подход. В журнале шкала <strong>6–10</strong>: чем выше число, тем меньше запас до
          отказа.
        </p>
        <ul className="journal-rpe-help__scale">
          <li>
            <span>6</span> — легко, запас 4+ повторения
          </li>
          <li>
            <span>7</span> — умеренно, запас около 3
          </li>
          <li>
            <span>8</span> — тяжело, запас около 2
          </li>
          <li>
            <span>9</span> — очень тяжело, запас около 1
          </li>
          <li>
            <span>10</span> — максимум, отказ
          </li>
        </ul>
        <p className="journal-rpe-help__note">
          RPE необязателен, но помогает сравнивать сессии: один вес может быть RPE 7 в свежую
          неделю и RPE 9 после накопленной усталости. e1RM на графике считается по весу и
          повторениям, без RPE.
        </p>
      </div>
    </details>
  );
}
