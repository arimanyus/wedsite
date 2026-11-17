import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'

import { art } from '@/art'

// Where Indore and Nanded stand in the painted highway, as fractions of its width.
const INDORE = 0.1
const NANDED = 0.885
// The bus is drawn 900 x 420 and shown at 42% of the road painting's height.
const BUS_WIDTH_IN_HEIGHTS = 0.42 * (900 / 420)
const PAINTING_ASPECT = 4

interface BusRouteProps {
  /** 0 at the start of the trip, 1 on arrival. */
  progress: MotionValue<number>
  /** `out` drives Indore to Nanded, `back` drives the same road home. */
  direction?: 'out' | 'back'
}

/**
 * The painted highway with the baraat bus driving along it. On wide screens the whole road is
 * visible and the bus crosses it. On phones the road is wider than the screen, so the view pans
 * to keep the bus in sight.
 */
export function BusRoute({ progress, direction = 'out' }: BusRouteProps) {
  const ref = useRef<HTMLDivElement>(null)
  const size = useRef({ view: 0, world: 0, height: 0 })
  const measured = useMotionValue(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      size.current = {
        view: element.clientWidth,
        height: element.clientHeight,
        world: element.clientHeight * PAINTING_ASPECT,
      }
      measured.set(measured.get() + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [measured])

  const busCentre = useTransform([progress, measured], ([p]: number[]) => {
    const from = direction === 'out' ? INDORE : NANDED
    const to = direction === 'out' ? NANDED : INDORE
    return (from + (to - from) * p) * size.current.world
  })
  const worldX = useTransform(busCentre, (centre) => {
    const { view, world } = size.current
    if (world <= view) return (view - world) / 2
    return Math.min(0, Math.max(view - world, view / 2 - centre))
  })
  const backX = useTransform(worldX, (x) => (size.current.world <= size.current.view ? 0 : -x * 0.12))
  const busX = useTransform(busCentre, (centre) => centre - (size.current.height * BUS_WIDTH_IN_HEIGHTS) / 2)

  const back = art('baraat.back')
  const front = art('baraat.front')
  const bus = art('bus')

  return (
    <div ref={ref} className="bus-route" aria-hidden="true">
      <motion.div className="bus-route-world" style={{ x: worldX }}>
        {back && <motion.img src={back} alt="" className="scene-layer" draggable={false} style={{ x: backX }} />}
        {front && <img src={front} alt="" className="scene-layer" draggable={false} />}
        {bus && (
          <motion.div className="bus" style={{ x: busX }}>
            <img src={bus} alt="" draggable={false} className={direction === 'back' ? 'bus-img bus-img-back' : 'bus-img'} />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
