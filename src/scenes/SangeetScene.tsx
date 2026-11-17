import '@fontsource/righteous/latin-400.css'

import { MapPin } from 'lucide-react'

import { DayLabel } from '@/components/EventDetails'
import { CalendarButton, MapButton } from '@/components/MapButton'
import { Sky, TextBlock } from '@/components/SceneLayers'
import { eventsInScene, formatDay } from '@/data/wedding'

import { NeonNote, NeonSky } from './NeonNight'

/** The title as neon tubes: an unlit copy of the glass underneath, and one lit letter that stutters. */
function NeonTitle({ title }: { title: string }) {
  const flicker = title.length - 3
  return (
    <h2 className="sangeet-title">
      <span className="sr-only">{title}</span>
      <span className="sangeet-tubes sangeet-tubes-off" aria-hidden="true">
        {title}
      </span>
      <span className="sangeet-tubes sangeet-tubes-on" aria-hidden="true">
        {title.slice(0, flicker)}
        <span className="sangeet-flicker">{title[flicker]}</span>
        {title.slice(flicker + 1)}
      </span>
    </h2>
  )
}

/**
 * The Sangeet, 2 Dec, as the front of the best club in town at night: searchlights crossing the
 * sky, the title as a neon sign hung on cables, the date, time and place on a lit marquee ringed
 * with chasing bulbs, and the dress code on the board by the door.
 * Styles: src/styles/scenes/sangeet.css. Frieze: `sangeet`.
 */
export function SangeetScene() {
  const [event] = eventsInScene('sangeet')
  const [weekday, date] = formatDay(event).split(', ')
  const [clock, meridiem, ...timeRest] = event.timeLabel.split(' ')
  const [attire, ...attireRest] = event.note?.text.split(', ') ?? []

  return (
    <>
      <Sky>
        <NeonSky />
      </Sky>

      <TextBlock>
        <div className="sangeet-sign">
          <span className="sangeet-cables" aria-hidden="true" />
          <DayLabel event={event} />
          <NeonTitle title={event.title} />
          <NeonNote className="sangeet-note" />
        </div>

        <div className="sangeet-marquee">
          <span className="sangeet-bulbs sangeet-bulbs-rows" aria-hidden="true" />
          <span className="sangeet-bulbs sangeet-bulbs-cols" aria-hidden="true" />
          <div className="sangeet-board">
            <p className="sangeet-row sangeet-date">
              <span className="sangeet-weekday">{weekday},</span> <span>{`${date} ${event.start.slice(0, 4)}`}</span>
            </p>
            <p className="sangeet-row sangeet-time">
              <span className="sangeet-clock">{`${clock} ${meridiem}`}</span>{' '}
              <span className="sangeet-onwards">{timeRest.join(' ')}</span>
            </p>
            <p className="sangeet-row sangeet-place">
              <MapPin aria-hidden="true" />
              <span>{event.placeLabel}</span>
            </p>
          </div>
        </div>

        <div className="sangeet-door">
          {event.note && (
            <p className="sangeet-attire">
              <span className="sangeet-attire-label">{event.note.label}</span>
              <span className="sangeet-attire-text">
                <span className="sangeet-attire-main">{attire}</span>
                {attireRest.length > 0 && (
                  <>
                    <span className="sr-only">, </span>
                    <span className="sangeet-attire-rest">{attireRest.join(', ')}</span>
                  </>
                )}
              </span>
            </p>
          )}

          <div className="sangeet-actions">
            <MapButton venue={event.venue} className="sangeet-btn sangeet-btn-maps" />
            <CalendarButton event={event} className="sangeet-btn sangeet-btn-calendar" />
          </div>
        </div>
      </TextBlock>
    </>
  )
}
