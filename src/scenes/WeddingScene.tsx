import '@fontsource/rozha-one/latin-400.css'
import '@fontsource/playfair-display/latin-600-italic.css'

import { MapPin } from 'lucide-react'
import { motion, useTransform } from 'motion/react'
import type { CSSProperties } from 'react'

import { art } from '@/art'
import { Countdown } from '@/components/Countdown'
import { DayLabel } from '@/components/EventDetails'
import { CalendarButton, MapButton } from '@/components/MapButton'
import { Foreground, Sky, TextBlock } from '@/components/SceneLayers'
import { couple, formatDay, venues, weddingEvent } from '@/data/wedding'
import { useJourney, useScene } from '@/journey/context'
import { ends, GLIDE, starts } from '@/journey/timeline'

/** How far into the glide from the Sangeet the sun starts to rise. It is up when the glide ends. */
const SUNRISE_FROM = 0.2

const PETALS = Array.from({ length: 14 }, (_, index) => ({
  left: (index * 61 + 7) % 100,
  delay: -((index * 37) % 140) / 10,
  duration: 11 + ((index * 13) % 8),
  size: 0.75 + ((index * 7) % 5) / 8,
}))

/** The last stars of the Sangeet's night, high in the dawn sky (percent of the screen). */
const STARS = [
  { x: 9, y: 17, size: 1 },
  { x: 24, y: 9, size: 0.6 },
  { x: 78, y: 12, size: 0.8 },
  { x: 93, y: 22, size: 1.1 },
  { x: 4, y: 33, size: 0.55 },
  { x: 88, y: 37, size: 0.6 },
]

/**
 * The sun, coming up behind the palace. It rises while the Sangeet's night dissolves into this
 * dawn and is up by the time the scene's text has arrived.
 */
function DawnSun() {
  const { t, calm } = useJourney()
  const { index } = useScene()
  const from = ends[index - 1] + GLIDE * SUNRISE_FROM
  const to = starts[index]
  const y = useTransform(t, (time) => {
    if (calm) return '0%'
    const progress = Math.min(1, Math.max(0, (time - from) / (to - from)))
    const eased = 1 - (1 - progress) ** 3
    return `${(1 - eased) * 62}%`
  })
  return (
    <motion.div className="dawn-sun" style={{ y }}>
      <span className="dawn-sun-disc" />
    </motion.div>
  )
}

/**
 * The wedding ceremony, 3 Dec: the morning after the Sangeet. The night sky breaks into bands of
 * dawn and the sun rises behind the palace garden the journey began with.
 * Styles: src/styles/scenes/wedding.css. Frieze: `pichwai`.
 */
export function WeddingScene() {
  const toran = art('orn-toran')
  const venue = venues[weddingEvent.venue]

  return (
    <>
      <Sky>
        <div className="dawn-stars">
          {STARS.map((star, starIndex) => (
            <span
              key={starIndex}
              style={{ left: `${star.x}%`, top: `${star.y}%`, '--star-size': star.size } as CSSProperties}
            />
          ))}
        </div>
        <DawnSun />
        {toran && <div className="toran" style={{ backgroundImage: `url(${toran})` }} />}
      </Sky>

      <Foreground>
        <div className="petals">
          {PETALS.map((petal, petalIndex) => (
            <span
              key={petalIndex}
              style={
                {
                  left: `${petal.left}%`,
                  animationDelay: `${petal.delay}s`,
                  animationDuration: `${petal.duration}s`,
                  '--petal-size': petal.size,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </Foreground>

      <TextBlock>
        <div className="wedding-head">
          <DayLabel event={weddingEvent} />
          <p className="wedding-title">The {weddingEvent.title}</p>
        </div>
        <h2 className="names">
          <span className="names-name">{couple.bride}</span>
          <span className="names-weds">weds</span>
          <span className="names-name">{couple.groom}</span>
        </h2>
        <div className="wedding-row">
          <p className="wedding-when">
            <span className="wedding-day">{formatDay(weddingEvent)} 2026</span>
            <span className="wedding-time">{weddingEvent.timeLabel}</span>
          </p>
          <p className="event-place wedding-place">
            <MapPin aria-hidden="true" />
            {venue.name}, {venue.city}, {venue.state}
          </p>
        </div>
        <div className="wedding-row">
          <Countdown />
          <div className="event-actions">
            <MapButton venue={weddingEvent.venue} />
            <CalendarButton event={weddingEvent} variant="outline" />
          </div>
        </div>
      </TextBlock>
    </>
  )
}
