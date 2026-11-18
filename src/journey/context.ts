import { createContext, useContext, type RefObject } from 'react'
import type { MotionValue } from 'motion/react'

import type { SceneId } from '@/data/wedding'

import { scenes } from './scenes'

export interface GroundSize {
  /** Width of the visible ground, in frieze widths. */
  view: number
  /** Width of one frieze, in pixels. */
  frieze: number
  /** Width of the stage, in pixels. */
  stage: number
  /** Middle of the visible ground, in pixels from the stage's left edge. */
  centre: number
  /** Width of the band over which one sky sweeps in over the last, in pixels. */
  band: number
}

export interface JourneyState {
  /** Attach to the tall element whose scroll length drives the journey. */
  trackRef: RefObject<HTMLDivElement | null>
  /** Attach to the ground plane, which sets the size of the friezes. */
  groundRef: RefObject<HTMLDivElement | null>
  /** Attach to the first section after the journey. */
  afterRef: RefObject<HTMLElement | null>
  /** Scroll position inside the journey, in screen heights (0 to TOTAL, then on while the stage scrolls away). */
  t: MotionValue<number>
  /** Camera position along the ground, in frieze widths. */
  camera: MotionValue<number>
  /** Pointer position across the screen, -1 (left) to 1 (right), smoothed. Always 0 on touch screens. */
  pointer: MotionValue<number>
  /** Read inside transforms. `measured` changes whenever it does, so transforms that use it should list it. */
  size: RefObject<GroundSize>
  measured: MotionValue<number>
  /** Which size of bitmap the ground artwork should use on this screen (see groundArt), or 0 before the ground is measured. */
  rasterWidth: number
  /** The guest prefers reduced motion: no camera travel, scenes dissolve in place. */
  calm: boolean
  /** Scroll to a scene (index into `scenes`), or to the schedule with `scenes.length`. */
  goTo: (index: number) => void
}

export const JourneyContext = createContext<JourneyState | null>(null)

export function useJourney(): JourneyState {
  const state = useContext(JourneyContext)
  if (!state) throw new Error('useJourney must be used inside <JourneyProvider>')
  return state
}

/** Index into `scenes` of the scene on screen, or `scenes.length` once the guest has reached the schedule. */
export const ActiveSceneContext = createContext(0)

export function useActiveScene(): number {
  return useContext(ActiveSceneContext)
}

/**
 * The class of the scene on screen, `scene-<id>`, or `scene-guide` in the schedule. The top bar and
 * the scene navigation carry it, so they take their colours from that scene's --chrome-* tokens.
 */
export function useActiveSceneClass(): string {
  const active = useActiveScene()
  return `scene-${scenes[active]?.id ?? 'guide'}`
}

/** The stage is drawn in planes shared by every scene; each scene contributes a layer to each. */
export type Plane = 'sky' | 'foreground' | 'text'

export const PlaneContext = createContext<Plane | null>(null)

export function usePlane(): Plane | null {
  return useContext(PlaneContext)
}

export interface SceneInfo {
  index: number
  id: SceneId
}

export const SceneContext = createContext<SceneInfo | null>(null)

export function useScene(): SceneInfo {
  const scene = useContext(SceneContext)
  if (!scene) throw new Error('useScene must be used inside a scene')
  return scene
}
