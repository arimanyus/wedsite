import '@fontsource/shrikhand/latin-400.css'
import '@fontsource/playfair-display/latin-600-italic.css'
import '@fontsource/playfair-display/latin-800-italic.css'

import { ChevronDown } from 'lucide-react'
import type { CSSProperties } from 'react'

import { Countdown } from '@/components/Countdown'
import { Sky, TextBlock } from '@/components/SceneLayers'
import { couple } from '@/data/wedding'
import { useJourney } from '@/journey/context'
import { EntranceGateway } from '@/scenes/EntranceGateway'

/** Where the sparkles sit in the sky (percent of the screen), clear of the palace at the bottom centre. */
const SPARKLES = [
  { x: 7, y: 14, size: 1.1, delay: 0 },
  { x: 91, y: 9, size: 0.8, delay: -1.3 },
  { x: 4, y: 41, size: 0.7, delay: -2.1 },
  { x: 95, y: 34, size: 1, delay: -0.6 },
  { x: 10, y: 60, size: 0.9, delay: -1.8 },
  { x: 89, y: 57, size: 0.75, delay: -2.6 },
]

/**
 * The first screen: the invitation itself. A Jaipur-pink gateway of scalloped arches opens onto the
 * palace garden, with the names as a poster title and the countdown to the ceremony.
 * Styles: src/styles/scenes/entrance.css. Frieze: `pichwai`.
 */
export function EntranceScene() {
  const { goTo } = useJourney()

  return (
    <>
      <Sky>
        <EntranceGateway />
        <div className="sparkles">
          {SPARKLES.map((sparkle, index) => (
            <span
              key={index}
              style={
                {
                  left: `${sparkle.x}%`,
                  top: `${sparkle.y}%`,
                  '--sparkle-size': sparkle.size,
                  animationDelay: `${sparkle.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </Sky>

      <TextBlock>
        <h1 className="names">
          <span className="names-name">{couple.bride}</span>
          <span className="names-weds">weds</span>
          <span className="names-name">{couple.groom}</span>
        </h1>
        <p className="entrance-tagline">
          <span className="sr-only">{couple.tagline}</span>
          <svg viewBox="0 0 380 60" aria-hidden="true">
            <path id="entrance-tagline-arc" d="M8,56 Q190,-4 372,56" fill="none" />
            <text>
              <textPath href="#entrance-tagline-arc" startOffset="50%" textAnchor="middle">
                {couple.tagline}
              </textPath>
            </text>
          </svg>
        </p>
        <p className="entrance-dates">
          <span>{couple.dateRange}</span>
        </p>
        <Countdown />
        <p className="entrance-regards">
          <span>With regards,</span>
          {couple.families}
        </p>
        <button type="button" className="scroll-hint" onClick={() => goTo(1)}>
          Begin
          <ChevronDown aria-hidden="true" />
        </button>
      </TextBlock>
    </>
  )
}
