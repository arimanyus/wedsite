import { MapPin } from 'lucide-react'

import { DayLabel } from '@/components/EventDetails'
import { CalendarButton, MapButton } from '@/components/MapButton'
import { Sky, TextBlock } from '@/components/SceneLayers'
import { eventsInScene, formatDay } from '@/data/wedding'

import { MughalGate } from './MughalGate'

/**
 * Tilak Ceremony, then Food & Blessings, 28 Nov, as a proclamation of the Mughal court: a cusped
 * gateway in the sky, gilded capitals, a lapis cartouche for the date and two marble plaques, one
 * per event, each sealed with its own calendar link.
 * Styles: src/styles/scenes/tilak.css. Frieze: `mughal`.
 */
export function TilakScene() {
  const list = eventsInScene('tilak')
  const main = list[0]
  const [weekday, date] = formatDay(main).split(', ')
  const [titleHead, ...titleTail] = main.title.split(' ')

  return (
    <>
      <Sky>
        <MughalGate />
      </Sky>

      <TextBlock>
        <DayLabel event={main} />

        <h2 className="tilak-title">
          <span className="tilak-title-head">{titleHead}</span> <span className="tilak-title-tail">{titleTail.join(' ')}</span>
        </h2>

        <p className="tilak-date">
          <span>{weekday}</span> <span>{`${date} ${main.start.slice(0, 4)}`}</span>
        </p>

        <ul className="tilak-events">
          {list.map((event) => (
            <li key={event.id} className="tilak-event">
              <span className="tilak-event-name">{event.title}</span>
              <span className="tilak-event-time">{event.timeLabel}</span>
              <CalendarButton event={event} iconOnly size="icon" className="tilak-seal" />
            </li>
          ))}
        </ul>

        <div className="tilak-way">
          <p className="tilak-place">
            <MapPin aria-hidden="true" />
            <span>{main.placeLabel}</span>
          </p>
          <MapButton venue={main.venue} label="Google Maps" className="tilak-maps" />
        </div>
      </TextBlock>
    </>
  )
}
