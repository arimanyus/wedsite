import { useScroll, useTransform } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { useRef } from 'react'

import { BusRoute } from '@/components/BusRoute'
import { GaneshaMark } from '@/components/Ornaments'
import { Button } from '@/components/ui/button'
import { couple, venues } from '@/data/wedding'
import { useJourney } from '@/journey/context'

/**
 * The end of the page: the sun comes up over the baraat's highway, and the bus drives it back from
 * Nanded to Indore as the guest scrolls to the bottom, under the families' sign-off.
 */
export function DriveHome() {
  const { goTo } = useJourney()
  const road = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: road, offset: ['start end', 'end end'] })
  const homeward = useTransform(scrollYProgress, [0.15, 1], [0, 1], { clamp: true })

  return (
    <div ref={road} className="drive-home">
      <div className="drive-home-sun" aria-hidden="true" />

      <div className="drive-home-words">
        <p className="drive-home-route">
          {venues.nanded.city} <span aria-hidden="true">→</span>
          <span className="sr-only">to</span> {venues.indore.city}
        </p>
        <h2 className="drive-home-title">And then, home again</h2>
        <p className="drive-home-line">The bus takes the same road back, this time heading home.</p>
      </div>

      <footer className="guide-footer">
        <GaneshaMark />
        <p className="names names-inline names-small">
          <span className="names-name">{couple.bride}</span>
          <span className="names-weds">weds</span>
          <span className="names-name">{couple.groom}</span>
        </p>
        <p className="guide-footer-regards">
          <span>With regards,</span> {couple.families}
        </p>
        <Button className="guide-footer-top" onClick={() => goTo(0)}>
          <ArrowUp aria-hidden="true" />
          Back to the top
        </Button>
      </footer>

      <BusRoute progress={homeward} direction="back" />
    </div>
  )
}
