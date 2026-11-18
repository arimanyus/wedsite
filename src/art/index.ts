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

/** Keep in step with WIDTHS in scripts/raster-art.mjs. */
const RASTER_WIDTHS = [1600, 2400, 3600]

/** URL of a prepared artwork file such as `pichwai.front` or `orn-lotus`, if it exists. */
export function art(name: string): string | undefined {
  return files[`./build/${name}.svg`]
}

/**
 * Which bitmap size suits a frieze shown `friezeWidth` CSS pixels wide. On dense screens a bitmap
 * a little short of one image pixel per screen pixel still looks sharp, and is a good deal
 * lighter to download and to hold in memory; on ordinary screens it has to cover every pixel.
 */
export function rasterWidthFor(friezeWidth: number, density: number): number {
  const needed = friezeWidth * density * (density > 1.5 ? 0.72 : 1)
  return RASTER_WIDTHS.find((width) => width >= needed) ?? RASTER_WIDTHS[RASTER_WIDTHS.length - 1]
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
