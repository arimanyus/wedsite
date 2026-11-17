import type { SceneId } from '@/data/wedding'

import { INDORE, NANDED } from './bus'

export interface SceneDef {
  id: SceneId
  /** Name in the section navigation. */
  label: string
  /** Frieze along the bottom of the screen: `src/art/<frieze>.svg`, split into `.back` and `.front`. */
  frieze: string
  /** Scroll length while the scene's text is on screen, in screen heights. */
  dwell: number
  /**
   * Instead of drifting slowly around the frieze's centre while the text is on screen, the camera
   * follows a subject that travels from `from` to `to` (fractions of the frieze's width).
   */
  follow?: { from: number; to: number }
}

/** The scenes in the order the guest travels through them, left to right along the ground. */
export const scenes: SceneDef[] = [
  { id: 'entrance', label: 'Welcome', frieze: 'pichwai', dwell: 0.45 },
  { id: 'tilak', label: 'Tilak', frieze: 'mughal', dwell: 0.6 },
  { id: 'ganesh', label: 'Ganesh Pujan', frieze: 'madhubani', dwell: 0.5 },
  { id: 'matrika', label: 'Matrika Pujan', frieze: 'nouveau', dwell: 0.5 },
  // The bus drives from Indore to Nanded across the whole dwell, so it gets a long one. It sets off
  // and pulls up a little inside the two cities: on a phone the camera waits at the frieze's ends,
  // and there the bus has to be whole on screen and clear of the scene navigation on the right.
  { id: 'baraat', label: 'Baraat', frieze: 'baraat', dwell: 1.6, follow: { from: INDORE + 0.05, to: NANDED - 0.075 } },
  { id: 'pool', label: 'Pool Party', frieze: 'pool', dwell: 0.55 },
  { id: 'sangeet', label: 'Sangeet', frieze: 'sangeet', dwell: 0.55 },
  { id: 'wedding', label: 'The Wedding', frieze: 'pichwai', dwell: 0.7 },
]

export function sceneIndex(id: SceneId): number {
  return scenes.findIndex((scene) => scene.id === id)
}
