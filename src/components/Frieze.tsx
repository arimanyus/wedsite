import { motion, useTransform } from 'motion/react'

import { art } from '@/art'
import { Bus } from '@/components/BusRoute'
import { BUS_WIDTH } from '@/journey/bus'
import { useJourney } from '@/journey/context'
import { joinName, scenes } from '@/journey/scenes'
import {
  BACK_LAG,
  calmFriezeOpacity,
  calmFriezeShift,
  friezeCentre,
  friezeFade,
  friezeNear,
  joinedFade,
  joinNear,
  joinWidth,
  leanCamera,
  POINTER_BACK,
  POINTER_FRONT,
  seamCentre,
  subjectAt,
} from '@/journey/timeline'

const percent = (share: number) => `${share * 100}%`

/** The mask settings for one end of a frieze: a cross-fade, or the narrow change-over under a join. */
function endFade(index: number, side: -1 | 1): { inset?: string; fade?: string } {
  const seam = side < 0 ? index : index + 1
  const joined = seam > 0 && seam < scenes.length && art(joinName(seam)) !== undefined
  if (joined) {
    const under = joinedFade(index, side)
    return under ? { inset: percent(under.inset), fade: percent(under.fade) } : {}
  }
  const fade = friezeFade(index, side)
  return fade === null ? {} : { fade: percent(fade) }
}

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
  const left = endFade(index, -1)
  const right = endFade(index, 1)
  const fades = { '--fade-l': left.fade, '--inset-l': left.inset, '--fade-r': right.fade, '--inset-r': right.inset }

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
 * The artwork over seam `seam`, where frieze `seam - 1` meets frieze `seam`. It rides on the
 * ground above both, centred on the middle of their overlap. With reduced motion the friezes
 * dissolve in place and never meet, so there is nothing to join.
 */
export function Join({ seam }: { seam: number }) {
  const { camera, pointer, size, measured, calm } = useJourney()
  const src = art(joinName(seam))
  const centre = seamCentre(seam)
  const x = useTransform([camera, pointer, measured], ([c, m]: number[]) =>
    percent(centre - leanCamera(c, m, size.current.view)),
  )
  const display = useTransform([camera, measured], ([c]: number[]) =>
    !calm && joinNear(seam, c, size.current.view) ? 'block' : 'none',
  )

  return (
    <motion.div className="frieze-box join-box" data-seam={seam} style={{ x, display }}>
      {src && (
        <img src={src} alt="" className="join" draggable={false} style={{ width: percent(joinWidth(seam)) }} />
      )}
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
