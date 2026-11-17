import { MapPin } from 'lucide-react'

import { DayLabel } from '@/components/EventDetails'
import { CalendarButton, MapButton } from '@/components/MapButton'
import { Sky, TextBlock } from '@/components/SceneLayers'
import { eventsInScene, formatDay } from '@/data/wedding'

import { Fish, MadhubaniSky } from './MadhubaniArt'

/** The title's words, one per line, in a Madhubani double outline: three stacked copies of the same text. */
function PaintedTitle({ words }: { words: string[] }) {
  const lines = words.map((word, index) => (
    <span key={word} className={`ganesh-word ganesh-word-${index + 1}`}>
      {word}
    </span>
  ))
  return (
    <h2 className="ganesh-title">
      <span className="ganesh-title-layer ganesh-title-outer" aria-hidden="true">
        {lines}
      </span>
      <span className="ganesh-title-layer ganesh-title-gap" aria-hidden="true">
        {lines}
      </span>
      <span className="ganesh-title-layer ganesh-title-fill">{lines}</span>
    </h2>
  )
}

/**
 * Ganesh Pujan, 29 Nov, as a Mithila (Madhubani) wall painting: a toran of mango leaves across an
 * emerald sky, a hand-lettered title in a double black outline, and the date, time and place as
 * painted patches with hatched shadows.
 * Styles: src/styles/scenes/ganesh.css. Frieze: `madhubani`.
 */
export function GaneshScene() {
  const [event] = eventsInScene('ganesh')
  const [weekday, date] = formatDay(event).split(', ')

  return (
    <>
      <Sky>
        <MadhubaniSky />
      </Sky>

      <TextBlock>
        <DayLabel event={event} />
        <PaintedTitle words={event.title.split(' ')} />

        <p className="ganesh-patch ganesh-date">
          <span>{weekday},</span> <span>{`${date} ${event.start.slice(0, 4)}`}</span>
        </p>

        <p className="ganesh-patch ganesh-time">
          <Fish className="ganesh-time-fish" />
          <span>{event.timeLabel}</span>
          <Fish className="ganesh-time-fish" flip />
        </p>

        <p className="ganesh-patch ganesh-place">
          <MapPin aria-hidden="true" />
          {event.placeLabel}
        </p>

        <div className="ganesh-actions">
          <MapButton venue={event.venue} className="ganesh-btn ganesh-btn-maps" />
          <CalendarButton event={event} className="ganesh-btn ganesh-btn-calendar" />
        </div>
      </TextBlock>
    </>
  )
}
