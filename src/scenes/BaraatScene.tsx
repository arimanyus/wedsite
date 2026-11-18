import { motion, useTransform } from 'motion/react'

import { EventDetails } from '@/components/EventDetails'
import { Sky, TextBlock } from '@/components/SceneLayers'
import { Fireworks } from '@/components/Fireworks'
import { venues } from '@/data/wedding'
import { useJourney, useScene } from '@/journey/context'
import { dwellProgress } from '@/journey/timeline'

/**
 * Baraat Prasthan, 1 Dec, as 1970s truck art. While the guest scrolls through it the bus drives
 * the frieze's highway from Indore to Nanded (`BaraatBus` in Frieze.tsx) and the route line below
 * keeps pace. Styles: src/styles/scenes/baraat.css. Frieze: `baraat`.
 */
export function BaraatScene() {
  return (
    <>
      <Sky>
        <div className="sunburst" />
        <Fireworks palette="festive" />
      </Sky>

      <TextBlock>
        <EventDetails scene="baraat">
          <RouteLine />
        </EventDetails>
      </TextBlock>
    </>
  )
}

function RouteLine() {
  const { t } = useJourney()
  const { index } = useScene()
  const trip = useTransform(t, (time) => `${dwellProgress(index, time) * 100}%`)

  return (
    <div className="route-line" aria-hidden="true">
      <span className="route-stop">{venues.indore.city}</span>
      <span className="route-track">
        <motion.span className="route-progress" style={{ x: trip }}>
          <span className="route-marker" />
        </motion.span>
      </span>
      <span className="route-stop">{venues.nanded.city}</span>
    </div>
  )
}
