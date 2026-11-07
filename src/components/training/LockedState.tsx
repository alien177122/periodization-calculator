import { EX_COUNT } from '../../data/exercises'
import { Button } from '../ui/Button'

interface LockedStateProps {
  missingExercises: string[]
  onGoCalculator: () => void
}

import { SectionBlock } from '../SectionBlock'

export default function LockedState({ missingExercises, onGoCalculator }: LockedStateProps) {
  return (
    <SectionBlock num="01" title="Доступ закрыт">
      <div className="locked-view">
        <div className="locked-icon" aria-hidden="true">&#128274;</div>
        <div className="locked-title">Введи 1ПМ для всех упражнений</div>
        <div className="locked-desc">
          Вкладка «Тренировка» станет доступна, когда рассчитаны 1ПМ для всех {EX_COUNT} упражнений.
        </div>
        <div className="locked-missing">
          {missingExercises.map((name) => (
            <span key={name} className="locked-missing-item">— {name}</span>
          ))}
        </div>
        <Button style={{ marginTop: 24 }} onClick={onGoCalculator}>
          Перейти в калькулятор
        </Button>
      </div>
    </SectionBlock>
  )
}
