import { createContext, useContext, type RefObject } from 'react'
import type { MotionValue } from 'motion/react'

import type { PoseOptions } from './rooms'

export interface MuseumState {
  /** Attach to the tall element whose scroll length drives the museum. */
  trackRef: RefObject<HTMLDivElement | null>
  /** Attach to the first section after the museum. */
  afterRef: RefObject<HTMLElement | null>
  /** Scroll position inside the museum, in screen heights (0 to TOTAL). */
  t: MotionValue<number>
  /** Pointer position across the screen, -1 (left) to 1 (right), smoothed. */
  pointer: MotionValue<number>
  options: PoseOptions
  /** Index into `rooms`, or `rooms.length` once the visitor has left the galleries. */
  active: number
  goTo: (index: number) => void
}

export const MuseumContext = createContext<MuseumState | null>(null)

export function useMuseum(): MuseumState {
  const state = useContext(MuseumContext)
  if (!state) throw new Error('useMuseum must be used inside <MuseumProvider>')
  return state
}

export interface RoomState {
  /** -1 while the painting arrives, 0 while the visitor is inside it, 1 once it has gone. */
  presence: MotionValue<number>
  /** 0 to 1 across the time spent inside the painting. */
  inside: MotionValue<number>
}

export const RoomContext = createContext<RoomState | null>(null)

export function useRoom(): RoomState {
  const state = useContext(RoomContext)
  if (!state) throw new Error('useRoom must be used inside <Room>')
  return state
}
