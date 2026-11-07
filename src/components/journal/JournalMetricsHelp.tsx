export function JournalMetricsHelp() {
  return (
    <details className="journal-metrics-help">
      <summary className="journal-metrics-help__summary">Как считаются метрики</summary>
      <div className="journal-metrics-help__body">
        <p>
          <strong>e1RM · линия</strong> — оценка одноповторного максимума по формуле{' '}
          <strong>Epley</strong>: вес × (1 + повторения ÷ 30). В сессии берётся{' '}
          <strong>лучший подход</strong> (максимальный e1RM среди записанных подходов). Линия — по
          последним 8 записям упражнения, слева направо по дате. RPE в расчёт не входит.
        </p>
        <p>
          <strong>Объём · столбцы</strong> — сумма <strong>кг × повторения</strong> по всем подходам
          сессии (тоннаж). Высота столбца — доля от самой объёмной сессии на графике; это не счётчик
          повторений.
        </p>
        <p className="journal-metrics-help__note">
          «За 4 нед» сравнивает пик e1RM последней даты с записью примерно 4 недели назад в той же
          истории.
        </p>
      </div>
    </details>
  );
}
