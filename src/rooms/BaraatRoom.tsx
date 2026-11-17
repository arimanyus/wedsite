import { motion, useTransform } from 'motion/react'

import { BusRoute } from '@/components/BusRoute'
import { EventDetails } from '@/components/EventDetails'
import { Room } from '@/components/Room'
import { venues } from '@/data/wedding'
import { useRoom } from '@/museum/context'

/** Gallery V. The baraat leaves Indore for Nanded by bus, painted as 1970s truck art. */
export function BaraatRoom({ index }: { index: number }) {
  return (
    <Room index={index} plaque="Baraat Prasthan">
      <div className="sunburst" aria-hidden="true" />
      <BaraatJourney />
    </Room>
  )
}

function BaraatJourney() {
  const { inside } = useRoom()
  const marker = useTransform(inside, (value) => `${value * 100}%`)

  return (
    <>
      <div className="room-content">
        <EventDetails room="baraat">
          <div className="route-line" aria-hidden="true">
            <span className="route-stop">{venues.indore.city}</span>
            <span className="route-track">
              <motion.span className="route-marker" style={{ left: marker }} />
            </span>
            <span className="route-stop">{venues.nanded.city}</span>
          </div>
        </EventDetails>
      </div>
      <BusRoute progress={inside} direction="out" />
    </>
  )
}
