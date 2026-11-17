import { useMotionValueEvent } from 'motion/react'
import { Hourglass } from 'lucide-react'
import { useRef } from 'react'

import { CountdownChip } from '@/components/Countdown'
import { couple, formatShortDay, nextEvent, eventStatus } from '@/data/wedding'
import { useNow } from '@/lib/hooks'
import { useMuseum } from '@/museum/context'
import { dialText, rooms } from '@/museum/rooms'

/** Top bar: monogram, the time dial showing which year the visitor has travelled to, countdown. */
export function Hud() {
  const { t, active, goTo } = useMuseum()
  const dial = useRef<HTMLSpanElement>(null)

  // Written straight to the DOM: the dial spins on every scroll frame while walking between rooms.
  useMotionValueEvent(t, 'change', (value) => {
    if (dial.current) dial.current.textContent = dialText(value)
  })

  const now = useNow(30_000)
  const upNext = nextEvent(now)
  const era = active < rooms.length ? rooms[active].era : 'The present day'

  return (
    <header className="hud">
      <button type="button" className="hud-monogram" onClick={() => goTo(0)} aria-label="Back to the entrance">
        {couple.bride[0]}
        <span aria-hidden="true">&amp;</span>
        {couple.groom[0]}
      </button>

      <div className="hud-dial" title={era}>
        <Hourglass aria-hidden="true" className="size-3.5 opacity-70" />
        <span className="sr-only">You are in: {era}</span>
        <span ref={dial} aria-hidden="true" className="tabular-nums">
          {dialText(t.get())}
        </span>
      </div>

      <div className="hud-countdown" aria-label="Time until the wedding ceremony">
        <CountdownChip />
      </div>

      {upNext && (
        <button type="button" className="hud-next" onClick={() => goTo(rooms.findIndex((room) => room.id === upNext.room))}>
          <span className="opacity-60">{eventStatus(upNext, now) === 'now' ? 'Now' : 'Next'}</span>
          <span>
            {upNext.title}, {formatShortDay(upNext)}
          </span>
        </button>
      )}
    </header>
  )
}
