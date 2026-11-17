/** The arched head of a stained-glass window: a lotus in coloured glass, leaded in gold. */
export function GlassLotus() {
  return (
    <svg className="nv-lunette" viewBox="0 0 100 54" aria-hidden="true" focusable="false">
      <path className="nv-glass-ground" d="M3 52A47 47 0 0 1 97 52Z" />
      <path className="nv-glass-ray" d="M50 52L14 24M50 52L32 10M50 52L68 10M50 52L86 24" />
      <path className="nv-glass-leaf" d="M50 51C36 52 17 47 9 37C24 34 40 40 50 51ZM50 51C64 52 83 47 91 37C76 34 60 40 50 51Z" />
      <path className="nv-glass-side" d="M50 51C38 47 27 36 27 21C40 25 48 38 50 51ZM50 51C62 47 73 36 73 21C60 25 52 38 50 51Z" />
      <path className="nv-glass-petal" d="M50 51C41 41 39 25 50 11C61 25 59 41 50 51Z" />
      <path className="nv-glass-rim" d="M3 52A47 47 0 0 1 97 52Z" />
    </svg>
  )
}

/** A peacock feather's eye, centred on (0, 0). */
function Eye({ x, y, rotate, scale = 1 }: { x: number; y: number; rotate: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <ellipse className="nv-eye-outer" rx="26" ry="36" />
      <ellipse className="nv-eye-ring" rx="18" ry="26" cy="4" />
      <ellipse className="nv-eye-inner" rx="12" ry="17" cy="6" />
      <ellipse className="nv-eye-pupil" rx="6" ry="8.5" cy="8" />
    </g>
  )
}

/**
 * Two whiplash stems rising from the ground beside the halo: the tall one lashes outwards and back
 * and curls into a spiral; the short one ends in a peacock feather's eye.
 */
function Vines() {
  return (
    <g className="nv-vines">
      <path
        className="nv-vine"
        d="M-20 1400C-20 1150 -60 1010 -110 960C-170 900 -228 870 -228 790C-226 690 -90 690 -100 590C-108 500 -250 500 -245 420C-240 350 -150 345 -152 400C-154 440 -205 438 -200 408"
      />
      <path
        className="nv-vine-echo"
        d="M8 1400C8 1150 -32 1015 -84 962C-140 905 -198 870 -198 795C-200 700 -66 690 -74 588C-80 520 -150 490 -172 465"
      />
      <path className="nv-vine" d="M70 1400C70 1150 70 1000 30 950C-10 905 -60 900 -50 840C-42 775 30 775 10 705" />
      <Eye x={6} y={678} rotate={-12} scale={0.8} />
    </g>
  )
}

/**
 * The Matrika scene's sky, after Mucha: a great halo of gold rings and mosaic behind the title, with
 * whiplash stems rising from the ground on both sides and curling round it.
 */
export function NouveauHalo() {
  return (
    <div className="matrika-sky" aria-hidden="true">
      <svg className="matrika-halo" viewBox="-300 0 1600 1000">
        <defs>
          <radialGradient id="matrika-halo-glow">
            <stop className="nv-glow-in" offset="0" />
            <stop className="nv-glow-out" offset="0.72" />
            <stop className="nv-glow-out" offset="1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="500" cy="500" r="330" fill="url(#matrika-halo-glow)" />
        <g className="matrika-halo-rings">
          <circle className="nv-ring nv-ring-hair" cx="500" cy="500" r="268" />
          <circle className="nv-ring nv-ring-bold" cx="500" cy="500" r="306" />
          <circle className="nv-mosaic-ground" cx="500" cy="500" r="338" />
          <circle className="nv-ring nv-ring-mid" cx="500" cy="500" r="368" />
          <circle className="nv-ring nv-ring-hair" cx="500" cy="500" r="414" />
          <circle className="nv-ring nv-ring-faint" cx="500" cy="500" r="468" />
        </g>
        <Vines />
        <g transform="translate(1000 0) scale(-1 1)">
          <Vines />
        </g>
      </svg>
      {/* The tiles and beads turn on their own layer so the rest of the halo never repaints. */}
      <svg className="matrika-halo-spin" viewBox="100 100 800 800">
        <circle className="nv-mosaic-tiles" cx="500" cy="500" r="338" />
        <circle className="nv-dots" cx="500" cy="500" r="392" />
      </svg>
    </div>
  )
}
