import type {Block} from '@training/shared/types';

/**
 * Один стек выполнения: прямоугольник, внутри 1–2 упражнения,
 * соединённые вертикальной связкой (rail). Тон — по intensityTone (через data-tone).
 *
 * Визуальный эталон: превью B (карточка упражнения) + план training-minimal Фаза 3.
 */
interface PairStackProps {
  block: Block;
  tone?: 'light' | 'medium' | 'peak';
  children: React.ReactNode;
  meta?: string;
}

export function PairStack({block, tone = 'light', children, meta}: PairStackProps) {
  return (
    <div className="stack" data-tone={tone} data-type={block.type}>
      <div className="stack__rail" aria-hidden="true" />
      <div className="stack__body">{children}</div>
      {meta ? <div className="stack__meta">{meta}</div> : null}
    </div>
  );
}