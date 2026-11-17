import { MapPin } from 'lucide-react'
import type { ReactNode } from 'react'

import { CalendarButton, MapButton } from '@/components/MapButton'
import { eventsInRoom, formatDay, type RoomId } from '@/data/wedding'
import { rooms } from '@/museum/rooms'

/** The label every painting carries: which gallery this is and which era it was painted in. */
export function EraLabel({ room }: { room: RoomId }) {
  const def = rooms.find((candidate) => candidate.id === room)!
  return (
    <p className="era-label">
      <span>Gallery {def.gallery}</span>
      <span>{def.era}</span>
    </p>
  )
}

/**
 * Title, date, time, place and the two actions for the event (or events) shown in a room.
 * Each room restyles these same elements for its era in CSS.
 */
export function EventDetails({ room, children }: { room: Exclude<RoomId, 'entrance'>; children?: ReactNode }) {
  const list = eventsInRoom(room)
  const main = list[0]

  return (
    <>
      <EraLabel room={room} />
      <h2 className="event-title">{main.title}</h2>
      <p className="event-date">{formatDay(main)} 2026</p>

      {list.length > 1 ? (
        <ul className="event-times">
          {list.map((event) => (
            <li key={event.id}>
              <span className="event-row">
                <span className="event-name">{event.title}</span>
                <span className="event-time">{event.timeLabel}</span>
              </span>
              <CalendarButton event={event} iconOnly size="icon-sm" variant="outline" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="event-time">{main.timeLabel}</p>
      )}

      <p className="event-place">
        <MapPin aria-hidden="true" />
        {main.placeLabel}
      </p>

      {main.note && (
        <p className="event-note">
          <span className="event-note-label">{main.note.label}</span>
          <span>{main.note.text}</span>
        </p>
      )}

      {children}

      <div className="event-actions">
        <MapButton venue={main.venue} />
        {list.length === 1 && <CalendarButton event={main} variant="outline" />}
      </div>
    </>
  )
}
