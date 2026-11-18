import {
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { rasterWidthFor } from '@/art'
import { useMediaQuery } from '@/lib/hooks'
import { ActiveSceneContext, JourneyContext, type GroundSize, type JourneyState } from './context'
import { fetchEarly } from './loading'
import { scenes } from './scenes'
import { activeScene, cameraAt, focusPoint, restingPoints, skyBand, TOTAL } from './timeline'

export function JourneyProvider({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const groundRef = useRef<HTMLDivElement>(null)
  const afterRef = useRef<HTMLElement>(null)
  const metrics = useRef({ top: 0, length: 1, height: 0 })
  /** How far through the journey the guest is (0 to 1), as of the last scroll the guest made. */
  const place = useRef(0)
  const size = useRef<GroundSize>({ view: 0.4, frieze: 1000, stage: 400, centre: 200, band: skyBand(400) })
  const measured = useMotionValue(0)
  const [rasterWidth, setRasterWidth] = useState(0)
  const { scrollY } = useScroll()

  useLayoutEffect(() => {
    // Scrolls the browser makes itself because the track changed height are not the guest's.
    const remember = () => {
      const track = trackRef.current
      if (!track || track.offsetHeight !== metrics.current.height) return
      place.current = (window.scrollY - metrics.current.top) / metrics.current.length
    }
    const measure = () => {
      const track = trackRef.current
      const ground = groundRef.current
      if (track) {
        const top = track.getBoundingClientRect().top + window.scrollY
        const height = track.offsetHeight
        // The track is TOTAL + 1 screen heights tall in `vh`, which ignores a phone's toolbar sliding
        // in and out, so the journey does not shift when it does.
        const length = Math.max(1, (height * TOTAL) / (TOTAL + 1))
        const previous = metrics.current
        metrics.current = { top, length, height }
        // When the screen changes shape (a phone turned on its side), stay at the same point of the journey.
        if (previous.height && height !== previous.height && place.current > 0 && place.current < 1) {
          window.scrollTo(0, top + place.current * length)
        }
        remember()
      }
      if (ground && ground.clientHeight > 0) {
        const frieze = ground.clientHeight * 4
        const stage = ground.offsetParent?.clientWidth ?? window.innerWidth
        size.current = {
          frieze,
          view: ground.clientWidth / frieze,
          stage,
          centre: ground.offsetLeft + ground.clientWidth / 2,
          band: skyBand(stage),
        }
        setRasterWidth(rasterWidthFor(frieze, window.devicePixelRatio || 1))
      }
      measured.set(measured.get() + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    for (const element of [trackRef.current, groundRef.current]) if (element) observer.observe(element)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', remember, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', remember)
    }
  }, [measured])

  // Runs on past TOTAL while the stage scrolls away, so nothing stops dead at the hand-over.
  const t = useTransform([scrollY, measured], ([y]: number[]) => {
    const { top, length } = metrics.current
    return Math.min(TOTAL + 1, Math.max(0, ((y - top) / length) * TOTAL))
  })
  const camera = useTransform([t, measured], ([value]: number[]) => cameraAt(value, size.current.view))

  // Only changes when a glide passes its midpoint, so the scene navigation re-renders a handful of
  // times per journey, never on every frame.
  const [active, setActive] = useState(0)
  useMotionValueEvent(t, 'change', (value) => {
    setActive(value > TOTAL + 0.45 ? scenes.length : activeScene(value))
  })

  // From the opening scene the artwork arrives in turn anyway; a guest who is further along (back
  // on a reload, or sent there by the dots) needs that scene's and the next one's straight away.
  useEffect(() => {
    if (active === 0) return
    fetchEarly(active)
    fetchEarly(active + 1)
  }, [active])

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

  const goTo = useCallback(
    (index: number) => {
      const behavior: ScrollBehavior = calm ? 'auto' : 'smooth'
      if (index >= scenes.length) {
        afterRef.current?.scrollIntoView({ behavior, block: 'start' })
        return
      }
      const { top, length } = metrics.current
      window.scrollTo({ top: index <= 0 ? 0 : top + (focusPoint(index) / TOTAL) * length, behavior })
    },
    [calm],
  )

  // The ground travels sideways, so a quick sideways swipe across the stage moves on to the next
  // resting point (or back to the one before), just as swiping up and down does.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let start: { x: number; y: number; time: number } | null = null
    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      start = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY, time: event.timeStamp } : null
    }
    const onEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0]
      if (!start || !touch) return
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      const quick = event.timeStamp - start.time < 800
      start = null
      if (!quick || Math.abs(dx) < 50 || Math.abs(dx) < 1.5 * Math.abs(dy)) return
      const here = t.get()
      const forward = dx < 0
      const target = forward
        ? restingPoints.find((point) => point > here + 0.02)
        : restingPoints.findLast((point) => point < here - 0.02)
      const behavior: ScrollBehavior = calm ? 'auto' : 'smooth'
      const { top, length } = metrics.current
      if (target !== undefined) window.scrollTo({ top: top + (target / TOTAL) * length, behavior })
      else if (forward) afterRef.current?.scrollIntoView({ behavior, block: 'start' })
    }
    track.addEventListener('touchstart', onStart, { passive: true })
    track.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      track.removeEventListener('touchstart', onStart)
      track.removeEventListener('touchend', onEnd)
    }
  }, [t, calm])

  const state = useMemo<JourneyState>(
    () => ({ trackRef, groundRef, afterRef, t, camera, pointer, size, measured, rasterWidth, calm, goTo }),
    [t, camera, pointer, measured, rasterWidth, calm, goTo],
  )

  return (
    <JourneyContext.Provider value={state}>
      <ActiveSceneContext.Provider value={active}>{children}</ActiveSceneContext.Provider>
    </JourneyContext.Provider>
  )
}
