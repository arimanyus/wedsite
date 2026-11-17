import { ArrowDown } from 'lucide-react'

import { eventStatus, formatShortDay, type WeddingEvent } from '@/data/wedding'
import { useJourney } from '@/journey/context'

/** A shortcut at the top of the schedule to the celebration that is on now or next. */
export function NextUp({ event, now }: { event: WeddingEvent; now: Date }) {
  const { calm } = useJourney()
  const live = eventStatus(event, now) === 'now'

  const show = () => {
    const ticket = document.getElementById(`event-${event.id}`)
    if (!ticket) return
    ticket.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' })
    ticket.querySelector<HTMLButtonElement>('.ticket-title button')?.focus({ preventScroll: true })
  }

  return (
    <button type="button" className="next-up" data-event={event.id} onClick={show}>
      <span className="next-up-flag">
        <span className="ticket-flag-dot" aria-hidden="true" />
        {live ? 'Happening now' : 'Next up'}
      </span>
      <span className="next-up-title">{event.title}</span>
      <span className="next-up-when">
        {formatShortDay(event)} · {event.timeLabel}
      </span>
      <ArrowDown className="next-up-arrow" aria-hidden="true" />
    </button>
  )
}
