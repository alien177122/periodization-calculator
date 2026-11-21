import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { addPassiveScroll } from '../lib/scroll'

interface TheoryHeroProps {
  onCTAClick?: (target: 'track' | 'basics' | 'tiers') => void
}

export function TheoryHero({ onCTAClick }: TheoryHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const bg = heroRef.current?.querySelector<HTMLElement>('.ta-hero-bg')
    if (!bg) return

    let raf = 0
    const tick = () => {
      const top = heroRef.current?.getBoundingClientRect().top ?? 0
      bg.style.transform = `translate3d(0, ${-top * 0.08}px, 0)`
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    const removeScroll = addPassiveScroll(window, onScroll)
    tick()
    return () => {
      removeScroll()
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <section ref={heroRef} className="ta-hero" aria-labelledby="ta-hero-title">
      <div className="ta-hero-bg" aria-hidden="true" />
      <div className="ta-hero-glow" aria-hidden="true" />

      <div className="ta-hero-content">
        <span className="ta-hero-eyebrow">Theory · 10 глав · маршрут</span>
        <h1 id="ta-hero-title" className="ta-hero-title">
          Теория
          <br />
          <span className="ta-hero-title-accent">тренинга</span>
        </h1>
        <p className="ta-hero-sub">
          Десять глав справочника и маршрут самоучителя: 15 статей от объёма и RIR до
          периодизации, питания и здоровья. Читай по порядку или заходи в нужную тему.
        </p>

        <div className="ta-hero-cta">
          <button
            type="button"
            className="ta-btn ta-btn-glass"
            onClick={() => onCTAClick?.('track')}
          >
            Маршрут обучения
          </button>
          <button
            type="button"
            className="ta-btn ta-btn-outline"
            onClick={() => onCTAClick?.('tiers')}
          >
            Сразу к Tier List →
          </button>
        </div>
      </div>
    </section>
  )
}
