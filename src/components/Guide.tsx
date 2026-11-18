import '@fontsource/outfit/latin-700.css'
import '@fontsource/outfit/latin-800.css'

import { DriveHome } from '@/components/guide/DriveHome'
import { NextUp } from '@/components/guide/NextUp'
import { PlanTitle } from '@/components/guide/PlanTitle'
import { Pond, PondSides } from '@/components/guide/Pond'
import { SaveTheDatesButton } from '@/components/SaveTheDates'
import { Schedule } from '@/components/Schedule'
import { couple, events, nextEvent, venues } from '@/data/wedding'
import { useJourney } from '@/journey/context'
import { useOpeningDone } from '@/journey/loading'
import { useNow } from '@/lib/hooks'

const dayCount = new Set(events.map((event) => event.start.slice(0, 10))).size
const cityCount = Object.keys(venues).length

/**
 * After the journey: every celebration day by day under the city it is held in, the way to each
 * venue, then the bus ride home and the sign-off. The stage un-pins above it and this section
 * scrolls up under the last frieze, carrying on that frieze's lotus pond.
 *
 * Its contents wait until the opening scene is in: the schedule is lettered in every scene's
 * fonts, and those would otherwise be fetched first, holding back the guest's first view.
 */
export function Guide() {
  const { afterRef } = useJourney()
  const now = useNow(30_000)
  const upNext = nextEvent(now)
  const opened = useOpeningDone()

  return (
    <section ref={afterRef} id="guide" className="guide">
      <Pond />
      <PondSides />

      {opened && (
        <>
          <div className="guide-column">
            <header className="guide-head">
              <p className="guide-kicker">
                {dayCount} days · {events.length} celebrations · {cityCount} cities
              </p>
              <PlanTitle />
              <p className="guide-dates">{couple.dateRange}</p>
              <SaveTheDatesButton />
              {/* Until the first celebration is over, the next one is the first ticket anyway. */}
              {upNext && upNext !== events[0] && <NextUp event={upNext} now={now} />}
            </header>

            <Schedule now={now} />
          </div>

          <DriveHome />
        </>
      )}
    </section>
  )
}
