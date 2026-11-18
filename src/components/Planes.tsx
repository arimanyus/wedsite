import { motion, useTransform } from 'motion/react'
import type { ComponentType, CSSProperties, ReactNode } from 'react'

import { BaraatBus, Frieze, Join } from '@/components/Frieze'
import { couple, eventsInScene, type SceneId } from '@/data/wedding'
import { PlaneContext, SceneContext, useJourney, useScene, type Plane, type SceneInfo } from '@/journey/context'
import { sceneIndex, scenes } from '@/journey/scenes'
import { calmSkyOpacity, calmSkyShown, skyEdge, skyShown, textOffset, textOpacity } from '@/journey/timeline'
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

/**
 * Carries a scene's layer in from the right over the previous scene's, behind the band that travels
 * with the camera (see skyEdge). The layer arrives in the second half of the band. Its box moves
 * with the band and the box inside moves back by as much, so what is drawn in it stays put on
 * screen while the band passes over. With reduced motion the layer dissolves in place instead.
 */
function Sweep({ className, children }: { className: string; children: ReactNode }) {
  const { t, camera, size, measured, calm } = useJourney()
  const { index } = useScene()
  const x = useTransform([camera, measured], ([c]: number[]) => {
    const edge = calm ? -size.current.band : skyEdge(index, c, size.current)
    return Math.round(edge + size.current.band / 2)
  })
  const holdX = useTransform(x, (value) => -value)
  const opacity = useTransform(t, (time) => (calm ? calmSkyOpacity(index, time) : 1))
  const display = useTransform([camera, t, measured], ([c, time]: number[]) => {
    const shown = calm ? calmSkyShown(index, time) : skyShown(index, c, size.current)
    return shown ? 'block' : 'none'
  })
  return (
    <motion.div className="sweep" style={{ x, opacity, display }}>
      <motion.div className="sweep-hold" style={{ x: holdX }}>
        <div className={className}>{children}</div>
      </motion.div>
    </motion.div>
  )
}

/**
 * The first half of the band: the old sky fades into a bridging colour, and the new one fades in
 * out of it, so two skies never mix into a muddy colour, however far apart their hues. The colour
 * for each arriving scene is `--sweep-light` on `.sweep-light.to-<id>` in journey.css.
 */
function SweepLight() {
  const { camera, size, measured, calm } = useJourney()
  const { index, id } = useScene()
  const x = useTransform([camera, measured], ([c]: number[]) => Math.round(skyEdge(index, c, size.current)))
  const display = useTransform([camera, measured], ([c]: number[]) => {
    const edge = skyEdge(index, c, size.current)
    return !calm && edge > -size.current.band && edge < size.current.stage ? 'block' : 'none'
  })
  return <motion.div className={`sweep-light to-${id}`} style={{ x, display }} />
}

/** A scene's backdrop. Later scenes stack on top, each sweeping in over the one before. */
function SkyLayer({ children }: { children: ReactNode }) {
  const { index, id } = useScene()
  return (
    <>
      {index > 0 && <SweepLight />}
      <Sweep className={`sky scene-${id}`}>{children}</Sweep>
    </>
  )
}

/** Decorations in front of the frieze, arriving with the scene's sky. */
function ForegroundLayer({ children }: { children: ReactNode }) {
  const { id } = useScene()
  return <Sweep className={`foreground scene-${id}`}>{children}</Sweep>
}

/** Half the width of the sky's travelling band, for the masks in journey.css. */
function useBandStyle(): CSSProperties {
  const { size, measured } = useJourney()
  const ramp = useTransform(measured, () => `${Math.round(size.current.band / 2)}px`)
  return { '--sweep-ramp': ramp } as unknown as CSSProperties
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
    <motion.div className="sky-plane" style={useBandStyle()} aria-hidden="true">
      <EachScene plane="sky" layer={SkyLayer} />
    </motion.div>
  )
}

/** The friezes, side by side along one strip, with the camera travelling over them. */
export function GroundPlane() {
  const { groundRef } = useJourney()
  return (
    <div ref={groundRef} className="ground" aria-hidden="true">
      {scenes.map((scene, index) => (
        <Frieze key={scene.id} index={index} />
      ))}
      {scenes.slice(1).map((scene, index) => (
        <Join key={scene.id} seam={index + 1} />
      ))}
      <BaraatBus index={sceneIndex('baraat')} />
    </div>
  )
}

export function ForegroundPlane() {
  return (
    <motion.div className="foreground-plane" style={useBandStyle()} aria-hidden="true">
      <EachScene plane="foreground" layer={ForegroundLayer} />
    </motion.div>
  )
}

export function TextPlane() {
  return (
    <div className="text-plane">
      <EachScene plane="text" layer={TextLayer} />
    </div>
  )
}
