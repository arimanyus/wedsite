// The files in ./build are produced from the hand-drawn SVGs in this folder by `npm run art`
// (it also runs automatically before `npm run dev` and `npm run build`).
const files = import.meta.glob<string>('./build/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

// Bitmaps of the ground artwork, painted by scripts/raster-art.mjs: `<name>.<width>.webp`, where
// <width> is the width in pixels of a whole frieze at that size.
const bitmaps = import.meta.glob<string>('./build/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** A group cut out of a drawing to be animated (see scripts/moves.mjs). Coordinates are drawing units. */
export interface MovingPart {
  /** Its own artwork, as for art() and groundArt(). */
  name: string
  /** One of the moves in src/styles/moves.css. */
  move: string
  box: [x: number, y: number, width: number, height: number]
  origin: [x: number, y: number]
  /** Seconds per cycle. */
  dur: number
  /** Degrees for turns, drawing units for travel, a fraction for scaling. */
  amp: number
  /** Seconds. */
  delay: number
  path?: [dx: number, dy: number]
  children?: MovingPart[]
}

export interface Moves {
  /** The drawing's viewBox. */
  size: [x: number, y: number, width: number, height: number]
  parts: MovingPart[]
}

const moveLists = import.meta.glob<Record<string, Moves>>('./build/*.moves.json', { eager: true, import: 'default' })
const moves: Record<string, Moves> = Object.assign({}, ...Object.values(moveLists))

/** The moving parts of a prepared drawing such as `pichwai.front` or `bus`, if it has any. */
export function movesOf(name: string): Moves | undefined {
  return moves[name]
}

/** Keep in step with WIDTHS in scripts/raster-art.mjs. */
const RASTER_WIDTHS = [1600, 2400, 3600]

/** URL of a prepared artwork file such as `pichwai.front` or `orn-lotus`, if it exists. */
export function art(name: string): string | undefined {
  return files[`./build/${name}.svg`]
}

interface Connection {
  saveData?: boolean
  effectiveType?: string
}

/** The guest has asked their browser to save data, or is on a slow connection. */
function frugal(): boolean {
  const connection = (navigator as Navigator & { connection?: Connection }).connection
  return connection?.saveData === true || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '')
}

/**
 * Which bitmap size suits a frieze shown `friezeWidth` CSS pixels wide. On dense screens a bitmap
 * a little short of one image pixel per screen pixel still looks sharp, and is a good deal
 * lighter to download and to hold in memory; on ordinary screens it has to cover every pixel.
 * A guest who is saving data gets the next size down.
 */
export function rasterWidthFor(friezeWidth: number, density: number): number {
  const needed = friezeWidth * density * (density > 1.5 ? 0.72 : 1)
  const fitting = RASTER_WIDTHS.findIndex((width) => width >= needed)
  const index = fitting < 0 ? RASTER_WIDTHS.length - 1 : fitting
  return RASTER_WIDTHS[Math.max(0, index - (frugal() ? 1 : 0))]
}

/**
 * URL of a piece of ground artwork (a frieze layer, a join, the bus): its bitmap at `rasterWidth`
 * (from rasterWidthFor) when there is one, otherwise the drawing itself. Bitmaps cost a phone next
 * to nothing to put on screen, where a detailed SVG can hold up a scroll while it is drawn.
 *
 * The dev server always uses the drawing: bitmaps are only painted by `npm run build`, so in
 * development they may be missing or older than the SVG being worked on.
 */
export function groundArt(name: string, rasterWidth: number): string | undefined {
  if (import.meta.env.DEV) return art(name)
  return bitmaps[`./build/${name}.${rasterWidth}.webp`] ?? art(name)
}
