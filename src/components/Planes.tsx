import { motion, useTransform } from 'motion/react'
import type { ComponentType, CSSProperties, ReactNode } from 'react'

import { BaraatBus, Frieze } from '@/components/Frieze'
import { couple, eventsInScene, type SceneId } from '@/data/wedding'
import { PlaneContext, SceneContext, useJourney, useScene, type Plane, type SceneInfo } from '@/journey/context'
import { sceneIndex, scenes } from '@/journey/scenes'
import { FEATHER, skyOpacity, skyShown, textOffset, textOpacity } from '@/journey/timeline'
import { BaraatScene } from '@/scenes/BaraatScene'
import { EntranceScene } from '@/scenes/EntranceScene'
import { GaneshScene } from '@/scenes/GaneshScene'
import { MatrikaScene } from '@/scenes/MatrikaScene'
import { PoolScene } from '@/scenes/PoolScene'
import { SangeetScene } from '@/scenes/SangeetScene'
import { TilakScene } from '@/scenes/TilakScene'
import { WeddingScene } from '@/scenes/WeddingScene'

const sceneComponents: Record<SceneId, ComponentType> = {
  entrance: EntranceScene,
  tilak: TilakScene,
  ganesh: GaneshScene,
  matrika: MatrikaScene,
  baraat: BaraatScene,
  pool: PoolScene,
  sangeet: SangeetScene,
  wedding: WeddingScene,
}

const sceneInfo: SceneInfo[] = scenes.map((scene, index) => ({ index, id: scene.id }))

function sceneTitle(id: SceneId): string {
  return id === 'entrance' ? `${couple.bride} weds ${couple.groom}` : eventsInScene(id)[0].title
}

/** Renders every scene into one plane, each inside that plane's wrapper. */
function EachScene({ plane, layer: Layer }: { plane: Plane; layer: ComponentType<{ children: ReactNode }> }) {
  return (
    <PlaneContext.Provider value={plane}>
      {sceneInfo.map((info) => {
        const Scene = sceneComponents[info.id]
        return (
          <SceneContext.Provider key={info.id} value={info}>
            <Layer>
              <Scene />
            </Layer>
          </SceneContext.Provider>
        )
      })}
    </PlaneContext.Provider>
  )
}

/** A scene's backdrop. Later scenes stack on top and dissolve in over the one before. */
function SkyLayer({ children }: { children: ReactNode }) {
  const { t } = useJourney()
  const { index, id } = useScene()
  const opacity = useTransform(t, (time) => skyOpacity(index, time))
  const display = useTransform(t, (time) => (skyShown(index, time) ? 'block' : 'none'))
  return (
    <motion.div className={`sky scene-${id}`} style={{ opacity, display }}>
      {children}
    </motion.div>
  )
}

/** Decorations in front of the frieze, on the same schedule as the scene's sky. */
function ForegroundLayer({ children }: { children: ReactNode }) {
  const { t } = useJourney()
  const { index, id } = useScene()
  const opacity = useTransform(t, (time) => skyOpacity(index, time))
  const display = useTransform(t, (time) => (skyShown(index, time) ? 'block' : 'none'))
  return (
    <motion.div className={`foreground scene-${id}`} style={{ opacity, display }}>
      {children}
    </motion.div>
  )
}

/**
 * A scene's text. It fades out early in the glide that leaves the scene and in late in the glide
 * that arrives, so two blocks are never legible at once, and drifts a little with the camera.
 * Hidden blocks are `display: none`, so they cannot be focused or read out.
 */
function TextLayer({ children }: { children: ReactNode }) {
  const { t, camera, size, measured, calm } = useJourney()
  const { index, id } = useScene()
  const opacity = useTransform(t, (time) => textOpacity(index, time))
  const display = useTransform(t, (time) => (textOpacity(index, time) > 0 ? 'flex' : 'none'))
  const x = useTransform([camera, measured], ([c]: number[]) =>
    calm ? 0 : textOffset(index, c, size.current.view) * size.current.frieze,
  )
  return (
    <motion.article className={`scene-text scene-${id}`} aria-label={sceneTitle(id)} style={{ opacity, display, x }}>
      {children}
    </motion.article>
  )
}

export function SkyPlane() {
  return (
    <div className="sky-plane" aria-hidden="true">
      <EachScene plane="sky" layer={SkyLayer} />
    </div>
  )
}

/** The friezes, side by side along one strip, with the camera travelling over them. */
export function GroundPlane() {
  const { groundRef } = useJourney()
  return (
    <div
      ref={groundRef}
      className="ground"
      style={{ '--frieze-fade': `${FEATHER * 100}%` } as CSSProperties}
      aria-hidden="true"
    >
      {scenes.map((scene, index) => (
        <Frieze key={scene.id} index={index} />
      ))}
      <BaraatBus index={sceneIndex('baraat')} />
    </div>
  )
}

export function ForegroundPlane() {
  return (
    <div className="foreground-plane" aria-hidden="true">
      <EachScene plane="foreground" layer={ForegroundLayer} />
    </div>
  )
}

export function TextPlane() {
  return (
    <div className="text-plane">
      <EachScene plane="text" layer={TextLayer} />
    </div>
  )
}
