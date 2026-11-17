import { useScroll, useTransform } from 'motion/react'
import { ArrowUp, Route } from 'lucide-react'
import { useRef } from 'react'

import { BusRoute } from '@/components/BusRoute'
import { MapButton } from '@/components/MapButton'
import { Divider, GaneshaMark, Lotus, PaperCorners } from '@/components/Ornaments'
import { Schedule } from '@/components/Schedule'
import { Button } from '@/components/ui/button'
import { couple, events, formatShortDay, routeUrl, venues, type VenueId } from '@/data/wedding'
import { useJourney } from '@/journey/context'

function VenueCard({ id }: { id: VenueId }) {
  const venue = venues[id]
  const held = events.filter((event) => event.venue === id)
  const first = held[0]
  const lastHeld = held[held.length - 1]

  return (
    <article className="venue-card">
      <p className="venue-card-dates">
        {formatShortDay(first)} to {formatShortDay(lastHeld)}
      </p>
      <h3>{venue.city}</h3>
      <p className="venue-card-address">{venue.address}</p>
      <ul className="venue-card-events">
        {held.map((event) => (
          <li key={event.id}>{event.title}</li>
        ))}
      </ul>
      <MapButton venue={id} label="Open in Google Maps" className="w-full" />
    </article>
  )
}

/**
 * After the journey: the full programme, both venues with directions, and the bus ride home. The
 * stage un-pins above it and this section scrolls up under the last frieze; its top edge carries
 * on that frieze's lotus pond.
 */
export function Guide() {
  const { afterRef, goTo } = useJourney()
  const road = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: road, offset: ['start end', 'end start'] })
  const homeward = useTransform(scrollYProgress, [0.12, 0.88], [0, 1], { clamp: true })

  return (
    <section ref={afterRef} id="guide" className="guide">
      <div className="guide-shore" aria-hidden="true" />

      <div className="guide-paper">
        <PaperCorners />

        <header className="guide-header">
          <GaneshaMark />
          <p className="guide-eyebrow">The plan</p>
          <h2>The Celebrations</h2>
          <p className="guide-dates">{couple.dateRange}</p>
          <Divider />
        </header>

        <Schedule />

        <header className="guide-header guide-header-way">
          <Lotus className="guide-lotus" />
          <h2>Find your way</h2>
          <p className="guide-sub">Tap a venue to open directions in Google Maps.</p>
        </header>

        <div className="venues">
          <VenueCard id="indore" />
          <div className="venues-link">
            <span className="venues-link-line" aria-hidden="true" />
            <Button asChild variant="outline" size="sm">
              <a
                href={routeUrl('indore', 'nanded')}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="See the road from Indore to Nanded in Google Maps"
              >
                <Route aria-hidden="true" />
                The baraat's road
              </a>
            </Button>
            <span className="venues-link-line" aria-hidden="true" />
          </div>
          <VenueCard id="nanded" />
        </div>
      </div>

      <div ref={road} className="homeward">
        <div className="homeward-sky" aria-hidden="true" />
        <div className="homeward-text">
          <p className="homeward-kicker">
            {venues.nanded.city} <span aria-hidden="true">→</span> {venues.indore.city}
          </p>
          <h2>And then, home again</h2>
          <p>The baraat takes the same road back to Indore, this time with the bride on board.</p>
        </div>
        <BusRoute progress={homeward} direction="back" />
      </div>

      <footer className="guide-footer">
        <GaneshaMark />
        <p className="names names-inline names-small">
          <span className="names-name">{couple.bride}</span>
          <span className="names-weds">weds</span>
          <span className="names-name">{couple.groom}</span>
        </p>
        <p className="guide-footer-regards">
          <span>With regards,</span>
          {couple.families}
        </p>
        <Button variant="outline" size="sm" onClick={() => goTo(0)}>
          <ArrowUp aria-hidden="true" />
          Back to the top
        </Button>
      </footer>
    </section>
  )
}
