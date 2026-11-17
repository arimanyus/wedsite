import {
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

import { useMediaQuery } from '@/lib/hooks'
import { activeRoom, rooms, roomStarts, TOTAL, type PoseOptions } from './rooms'

interface MuseumState {
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

const MuseumContext = createContext<MuseumState | null>(null)

export function useMuseum(): MuseumState {
  const state = useContext(MuseumContext)
  if (!state) throw new Error('useMuseum must be used inside <MuseumProvider>')
  return state
}

export function MuseumProvider({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const afterRef = useRef<HTMLElement>(null)
  const metrics = useRef({ top: 0, length: 1 })
  const { scrollY } = useScroll()
  const measured = useMotionValue(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const top = track.getBoundingClientRect().top + window.scrollY
      metrics.current = { top, length: Math.max(1, track.offsetHeight - window.innerHeight) }
      measured.set(measured.get() + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measured])

  const positionAt = useCallback((y: number) => {
    const { top, length } = metrics.current
    return Math.min(1, Math.max(0, (y - top) / length)) * TOTAL
  }, [])

  const t = useTransform([scrollY, measured], ([y]: number[]) => positionAt(y))

  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollY, 'change', (y) => {
    const { top, length } = metrics.current
    const leftGalleries = y > top + length + window.innerHeight * 0.45
    setActive(leftGalleries ? rooms.length : activeRoom(positionAt(y)))
  })

  const rawPointer = useMotionValue(0)
  const pointer = useSpring(rawPointer, { stiffness: 60, damping: 18, mass: 0.6 })
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const calm = useReducedMotion() ?? false
  useEffect(() => {
    if (!finePointer || calm) {
      rawPointer.set(0)
      return
    }
    const onMove = (event: PointerEvent) => rawPointer.set((event.clientX / window.innerWidth) * 2 - 1)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [finePointer, calm, rawPointer])

  const narrow = useMediaQuery('(max-width: 700px)')
  const options = useMemo<PoseOptions>(() => ({ hung: narrow ? 0.7 : 0.62, calm }), [narrow, calm])

  const goTo = useCallback(
    (index: number) => {
      const behavior: ScrollBehavior = calm ? 'auto' : 'smooth'
      if (index >= rooms.length) {
        afterRef.current?.scrollIntoView({ behavior, block: 'start' })
        return
      }
      const { top, length } = metrics.current
      const room = rooms[Math.max(0, index)]
      const inside = roomStarts[Math.max(0, index)] + Math.min(room.dwell * 0.3, 0.25)
      window.scrollTo({ top: index <= 0 ? 0 : top + (inside / TOTAL) * length, behavior })
    },
    [calm],
  )

  const state = useMemo<MuseumState>(
    () => ({ trackRef, afterRef, t, pointer, options, active, goTo }),
    [t, pointer, options, active, goTo],
  )

  return <MuseumContext.Provider value={state}>{children}</MuseumContext.Provider>
}

interface RoomState {
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
