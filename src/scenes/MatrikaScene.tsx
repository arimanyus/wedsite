import { MapPin } from 'lucide-react'

import { DayLabel } from '@/components/EventDetails'
import { CalendarButton, MapButton } from '@/components/MapButton'
import { Sky, TextBlock } from '@/components/SceneLayers'
import { eventsInScene, formatDay } from '@/data/wedding'

import { GlassLotus, NouveauHalo } from './NouveauHalo'

/**
 * Matrika Pujan, 30 Nov, as an Art Nouveau poster after Mucha: a halo of gold rings behind the
 * title, whiplash stems, and the date, time and place as three stained-glass windows.
 * Styles: src/styles/scenes/matrika.css. Frieze: `nouveau`.
 */
export function MatrikaScene() {
  const [event] = eventsInScene('matrika')
  const [weekday, date] = formatDay(event).split(', ')
  const [day, month] = date.split(' ')
  const [clock, ...timeRest] = event.timeLabel.split(' ')
  const words = event.title.split(' ')

  return (
    <>
      <Sky>
        <NouveauHalo />
      </Sky>

      <TextBlock>
        <DayLabel event={event} />

        <h2 className="matrika-title">
          <span className="matrika-title-layer matrika-title-shade" aria-hidden="true">
            {words.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </span>
          <span className="matrika-title-layer matrika-title-gold">
            {words.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </span>
        </h2>

        <div className="matrika-windows">
          <p className="matrika-window matrika-window-date">
            <GlassLotus />
            <span className="matrika-window-small">{weekday}</span>{' '}
            <span className="matrika-window-big">{day}</span>{' '}
            <span className="matrika-window-small">{`${month} ${event.start.slice(0, 4)}`}</span>
          </p>
          <p className="matrika-window matrika-window-time">
            <GlassLotus />
            <span className="matrika-window-big">{clock}</span>{' '}
            <span className="matrika-window-small">{timeRest.join(' ')}</span>
          </p>
          <p className="matrika-window matrika-window-place">
            <GlassLotus />
            <MapPin aria-hidden="true" className="matrika-pin" />
            <span className="matrika-window-mid">{event.placeLabel}</span>
          </p>
        </div>

        <div className="matrika-actions">
          <MapButton venue={event.venue} className="matrika-btn matrika-btn-maps" />
          <CalendarButton event={event} className="matrika-btn matrika-btn-calendar" />
        </div>
      </TextBlock>
    </>
  )
}
