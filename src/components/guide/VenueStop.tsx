import { MapButton } from '@/components/MapButton'
import { formatShortDay, venues, type VenueId, type WeddingEvent } from '@/data/wedding'
import { cn } from '@/lib/utils'

interface VenueStopProps {
  venue: VenueId
  /** The celebrations held there, in order. */
  events: WeddingEvent[]
  /** Every one of them is over. */
  over: boolean
}

function Pin() {
  return (
    <svg className="venue-pin" viewBox="0 0 40 52" aria-hidden="true">
      <ellipse cx="20" cy="49" rx="9" ry="2.6" fill="#111" opacity="0.35" />
      <path
        d="M20 2.5C10.3 2.5 2.5 10.2 2.5 19.8 2.5 32 20 48 20 48s17.5-16 17.5-28.2C37.5 10.2 29.7 2.5 20 2.5z"
        fill="#e3172a"
        stroke="#111"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M9.5 15.5a11.5 11.5 0 0 1 7-8" fill="none" stroke="#ff8a8a" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="19.5" r="6.4" fill="#fff6e2" stroke="#111" strokeWidth="3" />
    </svg>
  )
}

/** A city's signboard at the head of the days held there: when, the full address, and the way in. */
export function VenueStop({ venue: id, events, over }: VenueStopProps) {
  const venue = venues[id]
  const first = events[0]
  const last = events[events.length - 1]

  return (
    <section className={cn('venue', over && 'is-done')} data-venue={id} aria-labelledby={`venue-${id}`}>
      {!over && <Pin />}
      <p className="venue-when">
        {formatShortDay(first)} <span aria-hidden="true">–</span>
        <span className="sr-only">to</span> {formatShortDay(last)}
      </p>
      <h3 id={`venue-${id}`} className="venue-city">
        {venue.city}
      </h3>
      <p className="venue-address">{venue.address}</p>
      {!over && (
        <ul className="venue-events" aria-label={`Held in ${venue.city}`}>
          {events.map((event) => (
            <li key={event.id} data-event={event.id}>
              {event.title}
            </li>
          ))}
        </ul>
      )}
      <MapButton venue={id} label="Open in Google Maps" className="venue-maps" />
    </section>
  )
}
