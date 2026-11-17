import { MapPin } from 'lucide-react'
import type { CSSProperties } from 'react'

import { art } from '@/art'
import { Countdown } from '@/components/Countdown'
import { DayLabel } from '@/components/EventDetails'
import { CalendarButton, MapButton } from '@/components/MapButton'
import { Divider, PaperCorners } from '@/components/Ornaments'
import { Foreground, Sky, TextBlock } from '@/components/SceneLayers'
import { couple, formatDay, venues, weddingEvent } from '@/data/wedding'

const PETALS = Array.from({ length: 16 }, (_, index) => ({
  left: (index * 61 + 7) % 100,
  delay: -((index * 37) % 140) / 10,
  duration: 11 + ((index * 13) % 8),
  size: 0.7 + ((index * 7) % 5) / 8,
}))

/**
 * The wedding ceremony, 3 Dec, back in the Pichwai style the journey began with, with the
 * countdown. Styles: src/styles/scenes/wedding.css. Frieze: `pichwai`.
 */
export function WeddingScene() {
  const toran = art('orn-toran')
  const venue = venues[weddingEvent.venue]

  return (
    <>
      <Sky>
        <PaperCorners />
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
        <DayLabel event={weddingEvent} />
        <p className="wedding-kicker">The {weddingEvent.title}</p>
        <h2 className="names names-inline">
          <span className="names-name">{couple.bride}</span>
          <span className="names-weds">weds</span>
          <span className="names-name">{couple.groom}</span>
        </h2>
        <Divider />
        <p className="event-date wedding-when">
          <span>{formatDay(weddingEvent)} 2026</span>
          <span>{weddingEvent.timeLabel}</span>
        </p>
        <p className="event-place">
          <MapPin aria-hidden="true" />
          {venue.name}, {venue.city}, {venue.state}
        </p>
        <Countdown />
        <div className="event-actions">
          <MapButton venue={weddingEvent.venue} />
          <CalendarButton event={weddingEvent} variant="outline" />
        </div>
      </TextBlock>
    </>
  )
}
