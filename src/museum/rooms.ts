import type { RoomId } from '@/data/wedding'

export type FrameStyle = 'gilt' | 'folk' | 'truck' | 'pop' | 'neon'

export interface RoomDef {
  id: RoomId
  /** Short name in the museum map. */
  label: string
  gallery: string
  /** Shown on the plaque under the frame and at the top of the painting. */
  era: string
  /** Drives the time dial. Rooms without a year show `dial` as plain text. */
  year?: number
  dial: string
  /** How long the painting stays full screen, in screen heights of scrolling. */
  dwell: number
  wall: string
  frame: FrameStyle
}

export const rooms: RoomDef[] = [
  {
    id: 'entrance',
    label: 'Welcome',
    gallery: 'I',
    era: 'Pichwai, Nathdwara tradition',
    year: 1700,
    dial: 'c. 1700',
    dwell: 0.4,
    wall: '#7b2d26',
    frame: 'gilt',
  },
  {
    id: 'tilak',
    label: 'Tilak',
    gallery: 'II',
    era: 'Mughal miniature, c. 1600',
    year: 1600,
    dial: 'c. 1600',
    dwell: 0.55,
    wall: '#1d2f6f',
    frame: 'gilt',
  },
  {
    id: 'ganesh',
    label: 'Ganesh Pujan',
    gallery: 'III',
    era: 'Madhubani, Mithila folk tradition',
    dial: 'Ageless',
    dwell: 0.55,
    wall: '#a3152a',
    frame: 'folk',
  },
  {
    id: 'matrika',
    label: 'Matrika Pujan',
    gallery: 'IV',
    era: 'Art Nouveau, c. 1900',
    year: 1900,
    dial: 'c. 1900',
    dwell: 0.55,
    wall: '#3d2a4d',
    frame: 'gilt',
  },
  {
    id: 'baraat',
    label: 'Baraat',
    gallery: 'V',
    era: 'Truck art & film poster, 1970s',
    year: 1975,
    dial: '1975',
    dwell: 1.7,
    wall: '#0b6b4f',
    frame: 'truck',
  },
  {
    id: 'pool',
    label: 'Pool Party',
    gallery: 'VI',
    era: 'Pop art, 1960s',
    year: 1965,
    dial: '1965',
    dwell: 0.55,
    wall: '#ff4f8b',
    frame: 'pop',
  },
  {
    id: 'sangeet',
    label: 'Sangeet',
    gallery: 'VII',
    era: 'Neon retro-future, 1980s',
    year: 1985,
    dial: '1985',
    dwell: 0.55,
    wall: '#090312',
    frame: 'neon',
  },
  {
    id: 'wedding',
    label: 'The Wedding',
    gallery: 'VIII',
    era: 'Pichwai, painted for today',
    year: 2026,
    dial: '2026',
    dwell: 0.7,
    wall: '#7b2d26',
    frame: 'gilt',
  },
]

/** Scroll distance of the walk from one painting to the next, in screen heights. */
export const WALK = 0.8

/** Scroll position (in screen heights) at which each painting becomes full screen. */
export const roomStarts: number[] = []
{
  let cursor = 0
  for (const room of rooms) {
    roomStarts.push(cursor)
    cursor += room.dwell + WALK
  }
}

const last = rooms.length - 1
/** Total scroll length of the museum, in screen heights. */
export const TOTAL = roomStarts[last] + rooms[last].dwell

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const ease = (value: number) => value * value * (3 - 2 * value)
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount

export interface RoomPose {
  visible: boolean
  /** 1 when the painting fills the screen, `hung` when it hangs framed on the wall. */
  scale: number
  /** Horizontal offset in viewport widths. */
  x: number
  /** 0 = stepped inside the painting, 1 = looking at it framed on the wall. */
  framed: number
  /** -1 while arriving from the right, 0 while inside, 1 once it has left to the left. */
  presence: number
  /** 0 to 1 across the time spent inside the painting. */
  inside: number
  opacity: number
}

export interface PoseOptions {
  /** Size of a painting on the wall relative to the screen. */
  hung: number
  /** Skip the walk and cross-fade instead. */
  calm: boolean
}

const HIDDEN: RoomPose = { visible: false, scale: 1, x: 0, framed: 1, presence: 0, inside: 0, opacity: 0 }

// Each walk has three overlapping beats: step back out of the painting, stroll along the wall,
// step into the next one.
const STEP_OUT_END = 0.4
const STROLL_START = 0.2
const STROLL_END = 0.8
const STEP_IN_START = 0.6

export function strollAmount(walkProgress: number): number {
  return ease(clamp01((walkProgress - STROLL_START) / (STROLL_END - STROLL_START)))
}

export function roomPose(index: number, t: number, { hung, calm }: PoseOptions): RoomPose {
  const start = roomStarts[index]
  const end = start + rooms[index].dwell
  // Far enough apart that a neighbour is fully off screen while this painting is centred.
  const stride = 0.5 + hung / 2 + 0.07

  if (t < start) {
    if (index === 0) return { ...HIDDEN, visible: true, opacity: 1, framed: 0 }
    const walk = (t - (start - WALK)) / WALK
    // Shown slightly early so the artwork is decoded before it slides into view.
    if (walk <= -0.35) return HIDDEN
    const progress = clamp01(walk)
    if (calm) {
      return { visible: walk > 0, scale: 1, x: 0, framed: 0, presence: 0, inside: 0, opacity: ease(progress) }
    }
    const stepIn = ease(clamp01((progress - STEP_IN_START) / (1 - STEP_IN_START)))
    return {
      visible: true,
      scale: lerp(hung, 1, stepIn),
      x: (1 - strollAmount(progress)) * stride,
      framed: 1 - stepIn,
      presence: progress - 1,
      inside: 0,
      opacity: 1,
    }
  }

  if (t <= end || index === last) {
    const inside = rooms[index].dwell > 0 ? clamp01((t - start) / rooms[index].dwell) : 1
    return { visible: true, scale: 1, x: 0, framed: 0, presence: 0, inside, opacity: 1 }
  }

  const walk = (t - end) / WALK
  if (walk >= 1) return HIDDEN
  if (calm) {
    // The next painting dissolves in over this one, so this one stays solid underneath.
    return { visible: true, scale: 1, x: 0, framed: 0, presence: 0, inside: 1, opacity: 1 }
  }
  const stepOut = ease(clamp01(walk / STEP_OUT_END))
  return {
    visible: true,
    scale: lerp(1, hung, stepOut),
    x: -strollAmount(walk) * stride,
    framed: stepOut,
    presence: walk,
    inside: 1,
    opacity: 1,
  }
}

/** Index of the painting the visitor is in, or nearest to. */
export function activeRoom(t: number): number {
  for (let index = last; index > 0; index--) {
    if (t >= roomStarts[index] - WALK / 2) return index
  }
  return 0
}

/** How many paintings the visitor has walked past, including the fraction of the current walk. */
export function distanceWalked(t: number): number {
  let distance = 0
  for (let index = 0; index < last; index++) {
    const end = roomStarts[index] + rooms[index].dwell
    distance += strollAmount(clamp01((t - end) / WALK))
  }
  return distance
}

/** What the time dial reads at scroll position `t`. */
export function dialText(t: number): string {
  for (let index = 0; index < last; index++) {
    const end = roomStarts[index] + rooms[index].dwell
    const walk = (t - end) / WALK
    if (walk <= 0) return rooms[index].dial
    if (walk < 1) {
      const from = rooms[index]
      const to = rooms[index + 1]
      if (from.year === undefined || to.year === undefined) return walk < 0.5 ? from.dial : to.dial
      const year = Math.round(lerp(from.year, to.year, ease(walk)))
      return `${year}`
    }
  }
  return rooms[last].dial
}
