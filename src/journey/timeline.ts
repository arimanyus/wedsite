// Turns the scroll position into everything that moves on the stage.
//
// `t` is the scroll position inside the journey, in screen heights. Each scene has a dwell (its
// text is on screen and the camera drifts slowly) and between two dwells there is a glide (the
// camera sweeps along the ground to the next frieze while the sky and the text change over).
//
// The ground is one long strip: the friezes stand side by side, overlapping by OVERLAP, and the
// camera position is measured along it in frieze widths. Frieze `i` is centred at
// `i * (1 - OVERLAP) + 0.5`. `view` is the width of the visible ground in frieze widths (about 1
// on a desktop, about 0.36 on a phone held upright).
//
// Everything here is a pure function of `t` and `view`, so scrolling back up replays the journey
// exactly, and resizing the window only changes `view`.

import { busPosition } from './bus'
import { scenes } from './scenes'

// ─── Timing (screen heights of scrolling) ───

/** Scroll length of the glide from one scene to the next. */
export const GLIDE = 1
/**
 * Share of a glide spent speeding up, and again slowing down. The camera cruises in between. At
 * 0.5 it never cruises: it swells to full speed at the midpoint and eases straight back down.
 */
export const GLIDE_RAMP = 0.34
/** Within a glide (0 to 1), the outgoing text has faded out by here. */
export const TEXT_OUT = 0.4
/** Within a glide, the incoming text starts fading in here and is fully in when the glide ends. */
export const TEXT_IN = 0.58
/** Within a glide, the sky cross-dissolves to the next scene's between these two points. */
export const SKY_FROM = 0.2
export const SKY_TO = 0.75
/** With reduced motion there is no camera travel: within a glide the friezes dissolve in place. */
const CALM_IN: [number, number] = [0.15, 0.65]
const CALM_OUT: [number, number] = [0.35, 0.85]

// ─── Space (frieze widths) ───

/** How much neighbouring friezes overlap. Their ends cross-fade across it. */
export const OVERLAP = 0.08
/**
 * Width of the fade at each end of a frieze. More than half the overlap, so the two fades cross
 * and the ground never thins out where one landscape gives way to the next.
 */
export const FEATHER = 0.6 * OVERLAP
/** How far the camera drifts either side of a frieze's centre while that scene's text is on screen. */
export const DRIFT = 0.03
/** The back layer of a frieze lags behind the front by this share of the camera's travel. */
export const BACK_LAG = 0.07
/** On screens with a mouse, the front and back layers lean this far against the pointer (% of the frieze). */
export const POINTER_FRONT = 1
export const POINTER_BACK = 0.4
/** The text drifts with the camera at this share of its speed, as if it hung in the far distance. */
export const TEXT_PARALLAX = 0.12
/** Friezes this far beyond the screen edge are still drawn, so they are painted before they slide in. */
const DRAW_MARGIN = 0.3

// ─── The timeline ───

/** When each scene's dwell starts and ends. */
export const starts: number[] = []
export const ends: number[] = []
{
  let cursor = 0
  for (const scene of scenes) {
    starts.push(cursor)
    cursor += scene.dwell
    ends.push(cursor)
    cursor += GLIDE
  }
}

const last = scenes.length - 1
/** Scroll length of the whole journey. At TOTAL the stage un-pins and the schedule scrolls up under it. */
export const TOTAL = ends[last]

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const ramp = (value: number, from: number, to: number) => clamp01((value - from) / (to - from))
const smooth = (value: number) => value * value * (3 - 2 * value)
/** Area under `smooth` from 0 to `x`; reaches 1/2 at `x` = 1. */
const smoothArea = (x: number) => x * x * x - (x * x * x * x) / 2

/** Progress through the glide that leads into scene `index`: 0 as it leaves the previous dwell, 1 on arrival. */
function glideInto(index: number, t: number): number {
  return (t - ends[index - 1]) / GLIDE
}

/** 0 to 1 across the scene's dwell. */
export function dwellProgress(index: number, t: number): number {
  return clamp01((t - starts[index]) / scenes[index].dwell)
}

/** The scene whose text is (or is about to be) on screen. Changes halfway through each glide. */
export function activeScene(t: number): number {
  for (let index = last; index > 0; index--) {
    if (t >= ends[index - 1] + GLIDE / 2) return index
  }
  return 0
}

/** Where to land when jumping to a scene: text fully in, main subject centred. */
export function focusPoint(index: number): number {
  if (index <= 0) return 0
  const scene = scenes[index]
  // A followed subject is caught near the start of its journey, the rest in the middle of the dwell.
  return starts[index] + scene.dwell * (scene.follow ? 0.1 : 0.5)
}

// ─── The camera ───

export function friezeCentre(index: number): number {
  return index * (1 - OVERLAP) + 0.5
}

interface CameraKeys {
  /** Camera position at the start and end of each dwell. */
  from: number[]
  to: number[]
  /** Camera speed where each dwell meets its glides, in frieze widths per screen height. */
  speed: number[]
}

let cachedView = Number.NaN
let cachedKeys: CameraKeys = { from: [], to: [], speed: [] }

function cameraKeys(view: number): CameraKeys {
  if (view === cachedView) return cachedKeys
  const keys: CameraKeys = { from: [], to: [], speed: [] }
  scenes.forEach((scene, index) => {
    const centre = friezeCentre(index)
    let from = centre - DRIFT
    let to = centre + DRIFT
    if (scene.follow) {
      // Keep the subject in shot without showing more of the neighbours than needed: on a phone
      // the camera starts with the frieze's left end at the screen edge and finishes with its right
      // end there; on a screen wide enough for the whole frieze it just drifts like everywhere else.
      const left = centre - 0.5
      const half = view / 2
      from = left + Math.min(Math.max(half, scene.follow.from), 0.5 - DRIFT)
      to = left + Math.max(Math.min(1 - half, scene.follow.to), 0.5 + DRIFT)
    } else if (index === 0) {
      from = centre
    } else if (index === last) {
      to = centre
    }
    keys.from.push(from)
    keys.to.push(to)
    // The first dwell eases out of rest and the last one eases into it, which takes twice the
    // speed at their other end to cover the same distance.
    const eased = index === 0 || index === last ? 2 : 1
    keys.speed.push((eased * (to - from)) / scene.dwell)
  })
  cachedView = view
  cachedKeys = keys
  return keys
}

/**
 * Area under the glide's speed bump from 0 to `u`: the bump rises smoothly over GLIDE_RAMP, holds
 * at 1, and falls smoothly over the last GLIDE_RAMP. Its total area is 1 - GLIDE_RAMP.
 */
function bumpArea(u: number): number {
  const r = GLIDE_RAMP
  if (u <= r) return r * smoothArea(u / r)
  if (u <= 1 - r) return r / 2 + (u - r)
  return 1 - r - r * smoothArea((1 - u) / r)
}

/**
 * Camera position `u` of the way through a glide. Its speed blends smoothly from the speed it had
 * at the end of one dwell to the speed it needs at the start of the next, plus a bump that carries
 * it the rest of the way. Speed and acceleration are continuous where glides meet dwells, so the
 * whole journey is one move rather than stop, slide, stop.
 */
function glide(u: number, from: number, to: number, speedFrom: number, speedTo: number): number {
  const bump = ((to - from) / GLIDE - (speedFrom + speedTo) / 2) / (1 - GLIDE_RAMP)
  return from + GLIDE * (speedFrom * u + (speedTo - speedFrom) * smoothArea(u) + bump * bumpArea(u))
}

/** Camera position along the ground at scroll position `t`, in frieze widths. */
export function cameraAt(t: number, view: number): number {
  const { from, to, speed } = cameraKeys(view)
  if (t <= 0) return from[0]
  for (let index = 0; index <= last; index++) {
    if (t > ends[index]) continue
    if (t < starts[index]) {
      return glide(glideInto(index, t), to[index - 1], from[index], speed[index - 1], speed[index])
    }
    const x = (t - starts[index]) / scenes[index].dwell
    if (index === 0) return from[0] + (to[0] - from[0]) * 2 * smoothArea(x)
    if (index === last) return to[last] - (to[last] - from[last]) * 2 * smoothArea(1 - x)
    return from[index] + (to[index] - from[index]) * x
  }
  return to[last]
}

/**
 * The camera leaning towards the pointer, except past either end of the strip: those ends stand
 * at the screen edge at the start and finish, and leaning further would open a gap beside them.
 */
export function leanCamera(camera: number, pointer: number, view: number): number {
  const leaned = camera + (pointer * POINTER_FRONT) / 100
  if (view > 1) return leaned
  const start = friezeCentre(0) - 0.5 + view / 2
  const finish = friezeCentre(last) + 0.5 - view / 2
  return Math.min(Math.max(leaned, Math.min(camera, start)), Math.max(camera, finish))
}

/** Whether a frieze is near enough to the screen to be drawn. */
export function friezeNear(index: number, camera: number, view: number): boolean {
  return Math.abs(camera - friezeCentre(index)) < 0.5 + view / 2 + DRAW_MARGIN
}

/**
 * Sideways offset of a scene's text, in frieze widths. Zero while the camera is within the
 * scene's dwell; outside it the text moves with the camera at TEXT_PARALLAX of its speed.
 */
export function textOffset(index: number, camera: number, view: number): number {
  const { from, to } = cameraKeys(view)
  const held = Math.min(Math.max(camera, from[index]), to[index])
  return (held - camera) * TEXT_PARALLAX
}

// ─── Sky and text ───

/** The sky stacks in scene order, so each one only has to dissolve in over the one before it. */
export function skyOpacity(index: number, t: number): number {
  if (index === 0) return 1
  return smooth(ramp(glideInto(index, t), SKY_FROM, SKY_TO))
}

/** False once the next sky fully covers this one, or before this one starts dissolving in. */
export function skyShown(index: number, t: number): boolean {
  if (index > 0 && glideInto(index, t) <= SKY_FROM) return false
  if (index < last && glideInto(index + 1, t) >= SKY_TO) return false
  return true
}

export function textOpacity(index: number, t: number): number {
  const fadeIn = index === 0 ? 1 : smooth(ramp(glideInto(index, t), TEXT_IN, 1))
  const fadeOut = index === last ? 1 : 1 - smooth(ramp(glideInto(index + 1, t), 0, TEXT_OUT))
  return Math.min(fadeIn, fadeOut)
}

// ─── Reduced motion ───

export function calmFriezeOpacity(index: number, t: number): number {
  const fadeIn = index === 0 ? 1 : smooth(ramp(glideInto(index, t), ...CALM_IN))
  const fadeOut = index === last ? 1 : 1 - smooth(ramp(glideInto(index + 1, t), ...CALM_OUT))
  return Math.min(fadeIn, fadeOut)
}

/**
 * With reduced motion each frieze stays put, centred on screen. A followed subject is the
 * exception: where the frieze is wider than the screen the view keeps it in shot, moving only as
 * the guest scrolls. Returns the frieze's offset from centred, in frieze widths.
 */
export function calmFriezeShift(index: number, t: number, view: number): number {
  const { follow } = scenes[index]
  if (!follow || view >= 1) return 0
  const subject = follow.from + (follow.to - follow.from) * dwellProgress(index, t)
  return 0.5 - Math.min(Math.max(subject, view / 2), 1 - view / 2)
}

/** Where the bus is along the Baraat frieze at scroll position `t` (fraction of its width). */
export function busAt(index: number, t: number): number {
  return busPosition(dwellProgress(index, t))
}
