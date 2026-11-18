import { useEffect, useSyncExternalStore } from 'react'

import { scenes } from './scenes'

// The ground's artwork is fetched one scene at a time, in the order the guest travels: the opening
// scene while the curtain is still down (Curtain.tsx), then each next scene as soon as the one
// before it is in. Asked for all at once (some 7 MB on a phone, in hundreds of small pieces), every
// scene would arrive slowly and in bits, the first one included. A scene the guest reaches ahead of
// the queue, with the dots say, is fetched straight away.

/**
 * If nothing of the scene being fetched arrives for this long, the next one starts anyway, so a
 * stuck image cannot stall the queue. A slow connection that is still delivering keeps its turn.
 */
const PATIENCE = 5000

const last = scenes.length - 1
const expected = scenes.map(() => 0)
const arrived = scenes.map(() => 0)
/** Scenes up to this one may fetch their artwork. */
let reached = 0
const early = new Set<number>()
let timer = 0
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function waitForMore() {
  window.clearTimeout(timer)
  if (reached < last) timer = window.setTimeout(moveOn, PATIENCE)
}

/** On to the next scene, past any the guest already had fetched early. */
function moveOn() {
  do reached++
  while (reached < last && arrived[reached] >= expected[reached])
  notify()
  waitForMore()
}

/** Counts `images` more images towards a scene's artwork while the calling component is mounted. */
export function useExpectedImages(scene: number | undefined, images: number) {
  useEffect(() => {
    if (scene === undefined) return
    expected[scene] += images
    return () => {
      expected[scene] -= images
    }
  }, [scene, images])
}

/** One of a scene's images has arrived (or has finally failed to). */
export function imageArrived(scene: number) {
  arrived[scene]++
  if (scene === 0) notify()
  if (scene !== reached) return
  if (arrived[scene] >= expected[scene] && reached < last) moveOn()
  else waitForMore()
}

/** Whether a scene's artwork may be fetched yet. Artwork outside the journey (no scene) always may. */
export function useMayFetch(scene: number | undefined): boolean {
  return useSyncExternalStore(subscribe, () => scene === undefined || scene <= reached || early.has(scene))
}

/** Fetches a scene's artwork now, out of turn: the guest is there, or about to be. */
export function fetchEarly(scene: number) {
  if (scene < 0 || scene > last || scene <= reached || early.has(scene)) return
  early.add(scene)
  notify()
}

/** Whether the opening scene's turn is over: its artwork is in, or has stopped holding up the rest. */
export function useOpeningDone(): boolean {
  return useSyncExternalStore(subscribe, () => reached > 0)
}

/** How much of the opening scene's artwork has arrived, 0 to 1. */
export function useOpeningProgress(): number {
  return useSyncExternalStore(subscribe, () => (expected[0] ? Math.min(1, arrived[0] / expected[0]) : 0))
}

if (typeof window !== 'undefined') waitForMore()
