import { MapPin } from 'lucide-react'

import { CalendarButton, MapButton } from '@/components/MapButton'
import type { EventStatus, WeddingEvent } from '@/data/wedding'
import { useJourney } from '@/journey/context'
import { sceneIndex } from '@/journey/scenes'
import { cn } from '@/lib/utils'

interface EventTicketProps {
  event: WeddingEvent
  status: EventStatus
  /** The celebration happening now, or else the next to start. */
  isNext: boolean
}

/**
 * One celebration as a sticker in its scene's colour and typeface. Once it is over it shrinks to
 * its title and time, so the ones still to come stand out.
 */
export function EventTicket({ event, status, isNext }: EventTicketProps) {
  const { goTo } = useJourney()
  const done = status === 'done'

  return (
    <article
      id={`event-${event.id}`}
      data-event={event.id}
      className={cn('ticket', isNext && 'is-next', status === 'now' && 'is-now', done && 'is-done')}
    >
      {isNext && (
        <p className="ticket-flag">
          <span className="ticket-flag-dot" aria-hidden="true" />
          {status === 'now' ? 'Happening now' : 'Next up'}
        </p>
      )}

      <h4 className="ticket-title">
        <button type="button" onClick={() => goTo(sceneIndex(event.scene))} title="Show this celebration">
          {event.title}
        </button>
      </h4>

      <div className="ticket-facts">
        <p className="ticket-time">{event.timeLabel}</p>
        {done ?
          <p className="ticket-stamp">Celebrated</p>
        : <p className="ticket-place">
            <MapPin aria-hidden="true" />
            {event.placeLabel}
          </p>
        }
      </div>

      {event.note && !done && (
        <p className="ticket-note">
          <span className="ticket-note-label">{event.note.label}</span> {event.note.text}
        </p>
      )}

      {!done && (
        <div className="ticket-actions">
          <MapButton venue={event.venue} />
          <CalendarButton event={event} />
        </div>
      )}
    </article>
  )
}
