import { MapPin } from 'lucide-react'
import type { CSSProperties } from 'react'

import { art } from '@/art'
import { Countdown } from '@/components/Countdown'
import { EraLabel } from '@/components/EventDetails'
import { CalendarButton, MapButton } from '@/components/MapButton'
import { Divider, PaperCorners } from '@/components/Ornaments'
import { Room } from '@/components/Room'
import { Scene } from '@/components/Scene'
import { couple, formatDay, venues, weddingEvent } from '@/data/wedding'

const PETALS = Array.from({ length: 16 }, (_, index) => ({
  left: (index * 61 + 7) % 100,
  delay: -((index * 37) % 140) / 10,
  duration: 11 + ((index * 13) % 8),
  size: 0.7 + ((index * 7) % 5) / 8,
}))

/** Gallery VIII. The wedding ceremony, back in the Pichwai style the walk began with. */
export function WeddingRoom({ index }: { index: number }) {
  const toran = art('orn-toran')
  const venue = venues[weddingEvent.venue]

  return (
    <Room index={index} plaque="The Wedding Ceremony">
      <PaperCorners />
      {toran && <div className="toran" style={{ backgroundImage: `url(${toran})` }} aria-hidden="true" />}
      <div className="petals" aria-hidden="true">
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
      <div className="room-content">
        <EraLabel room="wedding" />
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
      </div>
      <Scene name="pichwai" />
    </Room>
  )
}
