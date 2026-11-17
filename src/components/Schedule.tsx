import { MapPin } from 'lucide-react'

import { CalendarButton, MapButton } from '@/components/MapButton'
import { dayParts, events, eventStatus, nextEvent, type WeddingEvent } from '@/data/wedding'
import { useNow } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { useJourney } from '@/journey/context'
import { sceneIndex } from '@/journey/scenes'

const days = Object.values(
  events.reduce<Record<string, WeddingEvent[]>>((byDay, event) => {
    const key = event.start.slice(0, 10)
    ;(byDay[key] ??= []).push(event)
    return byDay
  }, {}),
)

/** Every celebration, day by day, as on the invitation. The next one is marked. */
export function Schedule() {
  const { goTo } = useJourney()
  const now = useNow(30_000)
  const upNext = nextEvent(now)

  return (
    <ol className="schedule">
      {days.map((dayEvents) => {
        const date = dayParts(dayEvents[0])
        return (
          <li key={dayEvents[0].start} className="schedule-day">
            <div className="schedule-date">
              <span className="schedule-date-day">
                {date.day} {date.month}
              </span>
              <span className="schedule-date-weekday">{date.weekday}</span>
            </div>

            <div className="schedule-events">
              {dayEvents.map((event) => {
                const status = eventStatus(event, now)
                const isNext = upNext?.id === event.id
                return (
                  <article
                    key={event.id}
                    className={cn('schedule-event', isNext && 'is-next', status === 'done' && 'is-done')}
                  >
                    <div className="schedule-event-text">
                      <h3>
                        <button
                          type="button"
                          onClick={() => goTo(sceneIndex(event.scene))}
                          title="Show this celebration"
                        >
                          {event.title}
                        </button>
                        {isNext && <span className="schedule-badge">{status === 'now' ? 'Happening now' : 'Next up'}</span>}
                      </h3>
                      <p className="schedule-time">{event.timeLabel}</p>
                      {event.note && (
                        <p className="schedule-note">
                          {event.note.label}: {event.note.text}
                        </p>
                      )}
                      <p className="schedule-place">
                        <MapPin aria-hidden="true" />
                        {event.placeLabel}
                      </p>
                    </div>
                    <div className="schedule-actions">
                      <MapButton venue={event.venue} size="sm" variant="outline" label="Maps" />
                      <CalendarButton event={event} size="sm" variant="outline" label="Calendar" />
                    </div>
                  </article>
                )
              })}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
