import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'

import { groundArt } from '@/art'
import { BUS_WIDTH, busPosition } from '@/journey/bus'
import { useJourney } from '@/journey/context'

/** The baraat bus, bobbing along. `back` turns it round for the drive home. */
export function Bus({ direction = 'out' }: { direction?: 'out' | 'back' }) {
  const { rasterWidth } = useJourney()
  const bus = rasterWidth ? groundArt('bus', rasterWidth) : undefined
  if (!bus) return null
  return (
    <img
      src={bus}
      alt=""
      draggable={false}
      decoding="async"
      fetchPriority="low"
      className={direction === 'back' ? 'bus-img bus-img-back' : 'bus-img'}
    />
  )
}

interface BusRouteProps {
  /** 0 at the start of the trip, 1 on arrival. */
  progress: MotionValue<number>
  /** `out` drives Indore to Nanded, `back` drives the same road home. */
  direction?: 'out' | 'back'
}

/**
 * The painted highway on its own, with the bus driving along it (used for the trip home in the
 * schedule section). On wide screens the whole road is visible and the bus crosses it. On phones
 * the road is wider than the screen, so the view pans to keep the bus in sight.
 */
export function BusRoute({ progress, direction = 'out' }: BusRouteProps) {
  const ref = useRef<HTMLDivElement>(null)
  const size = useRef({ view: 0, world: 0 })
  const measured = useMotionValue(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      size.current = { view: element.clientWidth, world: element.clientHeight * 4 }
      measured.set(measured.get() + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [measured])

  const trip = useTransform(progress, (p) => (direction === 'out' ? p : 1 - p))
  const worldX = useTransform([trip, measured], ([p]: number[]) => {
    const { view, world } = size.current
    if (world <= view) return (view - world) / 2
    return Math.min(0, Math.max(view - world, view / 2 - busPosition(p) * world))
  })
  const backX = useTransform(worldX, (x) => (size.current.world <= size.current.view ? 0 : -x * 0.12))
  const busX = useTransform(trip, (p) => `${((busPosition(p) - 0.5) / BUS_WIDTH) * 100}%`)

  const { rasterWidth } = useJourney()
  const back = rasterWidth ? groundArt('baraat.back', rasterWidth) : undefined
  const front = rasterWidth ? groundArt('baraat.front', rasterWidth) : undefined

  return (
    <div ref={ref} className="bus-route" aria-hidden="true">
      <motion.div className="bus-route-world" style={{ x: worldX }}>
        {back && (
          <motion.img
            src={back}
            alt=""
            className="frieze-layer"
            draggable={false}
            loading="lazy"
            decoding="async"
            style={{ x: backX }}
          />
        )}
        {front && (
          <img src={front} alt="" className="frieze-layer" draggable={false} loading="lazy" decoding="async" />
        )}
        <motion.div className="bus" style={{ x: busX }}>
          <Bus direction={direction} />
        </motion.div>
      </motion.div>
    </div>
  )
}
