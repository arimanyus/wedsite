import { ChevronDown, ChevronUp } from 'lucide-react'

import { useMuseum } from '@/museum/context'
import { rooms } from '@/museum/rooms'

const stops = [...rooms.map((room) => ({ id: room.id as string, label: room.label })), { id: 'guide', label: 'Find your way' }]

/** The museum map: one dot per painting plus the visitor guide at the exit. */
export function MuseumNav() {
  const { active, goTo } = useMuseum()

  return (
    <nav className="museum-nav" aria-label="Museum map" data-away={active === stops.length - 1 ? '' : undefined}>
      <button
        type="button"
        className="museum-nav-step"
        onClick={() => goTo(active - 1)}
        disabled={active === 0}
        aria-label="Previous room"
      >
        <ChevronUp aria-hidden="true" />
      </button>

      <ol>
        {stops.map((stop, index) => (
          <li key={stop.id}>
            <button
              type="button"
              className="museum-nav-dot"
              onClick={() => goTo(index)}
              aria-current={index === active ? 'true' : undefined}
              aria-label={stop.label}
            >
              <span className="museum-nav-label" aria-hidden="true">
                {stop.label}
              </span>
              <span className="museum-nav-mark" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="museum-nav-step"
        onClick={() => goTo(active + 1)}
        disabled={active === stops.length - 1}
        aria-label="Next room"
      >
        <ChevronDown aria-hidden="true" />
      </button>
    </nav>
  )
}
