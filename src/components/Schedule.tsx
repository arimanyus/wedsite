import { Fragment } from 'react'

import { EventTicket } from '@/components/guide/EventTicket'
import { RoadLink } from '@/components/guide/RoadLink'
import { VenueStop } from '@/components/guide/VenueStop'
import { dayParts, events, eventStatus, nextEvent, type VenueId, type WeddingEvent } from '@/data/wedding'
import { cn } from '@/lib/utils'

interface Day {
  key: string
  events: WeddingEvent[]
}

interface Leg {
  venue: VenueId
  days: Day[]
}

/** The days in runs held at one venue: Indore until the baraat leaves, then Nanded. */
const legs = events.reduce<Leg[]>((list, event) => {
  const key = event.start.slice(0, 10)
  let leg = list.at(-1)
  if (leg?.venue !== event.venue) list.push((leg = { venue: event.venue, days: [] }))
  let day = leg.days.at(-1)
  if (day?.key !== key) leg.days.push((day = { key, events: [] }))
  day.events.push(event)
  return list
}, [])

/** Every celebration, day by day, under the city it is held in. The next one is marked. */
export function Schedule({ now }: { now: Date }) {
  const upNext = nextEvent(now)

  return (
    <div className="schedule">
      {legs.map((leg, index) => {
        const held = leg.days.flatMap((day) => day.events)
        const previous = legs[index - 1]
        return (
          <Fragment key={leg.venue}>
            {previous && <RoadLink from={previous.venue} to={leg.venue} />}
            <VenueStop
              venue={leg.venue}
              events={held}
              over={held.every((event) => eventStatus(event, now) === 'done')}
            />
            <ol className="schedule-days">
              {leg.days.map((day) => {
                const date = dayParts(day.events[0])
                const statuses = day.events.map((event) => eventStatus(event, now))
                return (
                  <li
                    key={day.key}
                    className={cn(
                      'schedule-day',
                      day.events.some((event) => event.id === upNext?.id) && 'has-next',
                      statuses.every((status) => status === 'done') && 'is-done',
                    )}
                  >
                    <time className="schedule-date" dateTime={day.key}>
                      <span className="schedule-weekday">{date.weekday.slice(0, 3)}</span>
                      <span className="schedule-num">{Number(date.day)}</span>
                      <span className="schedule-month">{date.month}</span>
                    </time>
                    <div className="schedule-events">
                      {day.events.map((event, i) => (
                        <EventTicket key={event.id} event={event} status={statuses[i]} isNext={event.id === upNext?.id} />
                      ))}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Fragment>
        )
      })}
    </div>
  )
}
