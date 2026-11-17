import { MapPin } from 'lucide-react'
import type { ReactNode } from 'react'

import { CalendarButton, MapButton } from '@/components/MapButton'
import { events, eventsInScene, formatDay, venues, type SceneId, type WeddingEvent } from '@/data/wedding'

const DAY_MS = 86_400_000
const dayOf = (event: WeddingEvent) => Date.parse(event.start.slice(0, 10))
const firstDay = Math.min(...events.map(dayOf))

/** "Day 1 · Indore": which day of the celebrations an event falls on, and in which city. */
export function DayLabel({ event }: { event: WeddingEvent }) {
  return (
    <p className="day-label">
      <span>Day {Math.round((dayOf(event) - firstDay) / DAY_MS) + 1}</span>
      <span>{venues[event.venue].city}</span>
    </p>
  )
}

/**
 * Title, date, time, place and the two actions for the event (or events) of a scene. Each scene
 * restyles these same elements in its own art style in CSS.
 */
export function EventDetails({ scene, children }: { scene: Exclude<SceneId, 'entrance'>; children?: ReactNode }) {
  const list = eventsInScene(scene)
  const main = list[0]

  return (
    <>
      <DayLabel event={main} />
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
