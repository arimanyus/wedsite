import { motion, useTransform } from 'motion/react'

import { art } from '@/art'
import { Bus } from '@/components/BusRoute'
import { BUS_WIDTH } from '@/journey/bus'
import { useJourney } from '@/journey/context'
import { scenes } from '@/journey/scenes'
import {
  BACK_LAG,
  calmFriezeOpacity,
  calmFriezeShift,
  friezeCentre,
  friezeFade,
  friezeNear,
  leanCamera,
  POINTER_BACK,
  POINTER_FRONT,
  subjectAt,
} from '@/journey/timeline'

const fadeWidth = (fade: number | null) => (fade === null ? undefined : `${fade * 100}%`)

/**
 * Where frieze `index` sits on screen. Offsets are percentages of the frieze's own width, so the
 * browser does the sizing and nothing here needs to know how many pixels wide a frieze is.
 */
function useFriezePose(index: number) {
  const { t, camera, pointer, size, measured, calm } = useJourney()
  const centre = friezeCentre(index)

  const x = useTransform([camera, pointer, t, measured], ([c, m, time]: number[]) =>
    calm
      ? `${calmFriezeShift(index, time, size.current.view) * 100}%`
      : `${(centre - leanCamera(c, m, size.current.view)) * 100}%`,
  )
  // Relative to the front layer: the far layer leans less, and lags behind as the camera passes.
  const backX = useTransform([camera, pointer, measured], ([c, m]: number[]) => {
    if (calm) return '0%'
    const lean = leanCamera(c, m, size.current.view) - c
    return `${((c - centre) * BACK_LAG + lean * (1 - POINTER_BACK / POINTER_FRONT)) * 100}%`
  })
  const opacity = useTransform(t, (time) => (calm ? calmFriezeOpacity(index, time) : 1))
  const display = useTransform([camera, t, measured], ([c, time]: number[]) => {
    const shown = calm ? calmFriezeOpacity(index, time) > 0 : friezeNear(index, c, size.current.view)
    return shown ? 'block' : 'none'
  })

  return { x, backX, opacity, display }
}

/** One frieze on the ground. Its far layer lags behind its near layer as the camera passes, for depth. */
export function Frieze({ index }: { index: number }) {
  const scene = scenes[index]
  const { x, backX, opacity, display } = useFriezePose(index)
  const back = art(`${scene.frieze}.back`)
  const front = art(`${scene.frieze}.front`)
  const lead = scene.follow ? ' frieze-lead' : ''
  const fades = { '--fade-l': fadeWidth(friezeFade(index, -1)), '--fade-r': fadeWidth(friezeFade(index, 1)) }

  return (
    <motion.div className={`frieze-box frieze${lead} scene-${scene.id}`} style={{ x, opacity, display, ...fades }}>
      {back && (
        <motion.img src={back} alt="" className="frieze-layer frieze-back" draggable={false} style={{ x: backX }} />
      )}
      {front && <img src={front} alt="" className="frieze-layer" draggable={false} />}
    </motion.div>
  )
}

/**
 * The baraat bus on the Baraat frieze's highway, from Indore to Nanded across the scene's dwell.
 * It rides in its own box over all the friezes, so neither the frieze's faded ends nor the next
 * frieze can draw over it.
 */
export function BaraatBus({ index }: { index: number }) {
  const { t } = useJourney()
  const { x, opacity, display } = useFriezePose(index)
  const busX = useTransform(t, (time) => `${((subjectAt(index, time) - 0.5) / BUS_WIDTH) * 100}%`)

  return (
    <motion.div className="frieze-box bus-box" style={{ x, opacity, display }}>
      <motion.div className="bus" style={{ x: busX }}>
        <Bus />
      </motion.div>
    </motion.div>
  )
}
