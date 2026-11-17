import { useLayoutEffect, useRef, useState } from 'react'

/** The sky, and inside it the space the scene's text is centred in (between the top bar and the ground). */
interface Frame {
  width: number
  height: number
  left: number
  right: number
  top: number
  bottom: number
}

type Point = [number, number]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const fmt = (value: number) => Math.round(value * 10) / 10

/**
 * One side of a pointed Mughal arch as a list of points, from the apex down to the springing line.
 * It is a quarter ellipse whose centre is pushed past the arch's axis, so the two halves meet in a
 * point rather than a dome. `a` is the half-span, `h` the rise, `sharp` how far the centre is pushed.
 */
function archSide(cx: number, springY: number, a: number, h: number, sharp: number, side: 1 | -1, steps = 48): Point[] {
  const e = a * sharp
  const rx = a + e
  const ry = h / Math.sqrt(1 - (e / rx) ** 2)
  const from = Math.acos(e / rx)
  const points: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const phi = from * (1 - i / steps)
    points.push([cx + side * (-e + rx * Math.cos(phi)), springY - ry * Math.sin(phi)])
  }
  return points
}

/** The whole arch from the left springing point over the apex to the right one. */
function archCurve(cx: number, springY: number, a: number, h: number, sharp: number): Point[] {
  return [...archSide(cx, springY, a, h, sharp, -1).reverse(), ...archSide(cx, springY, a, h, sharp, 1).slice(1)]
}

/** Points spaced evenly along a polyline. */
function evenly(points: Point[], count: number): Point[] {
  const lengths = [0]
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]))
  }
  const total = lengths[lengths.length - 1]
  const out: Point[] = []
  let j = 1
  for (let k = 0; k <= count; k++) {
    const target = (total * k) / count
    while (j < points.length - 1 && lengths[j] < target) j++
    const span = lengths[j] - lengths[j - 1] || 1
    const f = clamp((target - lengths[j - 1]) / span, 0, 1)
    out.push([points[j - 1][0] + (points[j][0] - points[j - 1][0]) * f, points[j - 1][1] + (points[j][1] - points[j - 1][1]) * f])
  }
  return out
}

function polyline(points: Point[]) {
  return points.map(([x, y]) => `L${fmt(x)} ${fmt(y)}`).join('')
}

function gateGeometry(frame: Frame) {
  const { width, height, left, right, top, bottom } = frame
  const cx = (left + right) / 2
  const span = right - left
  const tall = bottom - top
  const wide = span > 760

  // On narrow screens the arch fills the width and its piers run down the screen edges; on wide
  // ones it is a gateway in a wall, wide enough for the title.
  const a = wide ? clamp(span * 0.3, 360, 600) : span / 2 - clamp(span * 0.016, 5, 12)
  const springY = top + tall * (wide ? 0.5 : 0.4)
  const apexY = Math.max(4, top * 0.62)
  const h = springY - apexY
  const sharp = clamp(0.32 - (h / a) * 0.08, 0.12, 0.3)

  const intrados = archCurve(cx, springY, a, h, sharp)
  let length = 0
  for (let i = 1; i < intrados.length; i++) {
    length += Math.hypot(intrados[i][0] - intrados[i - 1][0], intrados[i][1] - intrados[i - 1][1])
  }
  const lobes = clamp(2 * Math.round((length / (wide ? 120 : 74) - 1) / 2) + 1, 7, 15)
  const cusps = evenly(intrados, lobes)
  const chord = length / lobes
  const r = chord * 0.58
  const depth = r - Math.sqrt(r * r - (chord / 2) ** 2)

  const lobed =
    `M${fmt(cx - a)} ${fmt(height)}L${fmt(cx - a)} ${fmt(springY)}` +
    cusps
      .slice(1)
      .map(([x, y]) => `A${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(x)} ${fmt(y)}`)
      .join('') +
    `L${fmt(cx + a)} ${fmt(height)}`

  const band = clamp(a * 0.05, 9, 22)
  const gap = depth + band * 0.9
  const outer = archCurve(cx, springY, a + gap, h + gap * 1.2, sharp)
  const extrados =
    `M${fmt(cx - a - gap)} ${fmt(height)}L${fmt(cx - a - gap)} ${fmt(springY)}` + polyline(outer) + `L${fmt(cx + a + gap)} ${fmt(height)}`

  const wall = `M0 0H${fmt(width)}V${fmt(height)}H0Z` + lobed + 'Z'
  const unit = clamp(Math.min(width, height * 1.4) / 16, 34, 64)

  return { lobed, extrados, wall, band, unit, apex: [cx, apexY - gap * 1.2] as Point }
}

/** A Mughal flowering plant, the buta of the inlaid walls, in a 40 x 56 box. */
function Buta({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path className="tilak-buta-stem" d="M20 50C20 42 19.5 34 20 23" />
      <path className="tilak-buta-leaf" d="M20 44C13 43 9 37 9.5 31C15 32 19 37 20 44ZM20 38C27 37 31 31 30.5 25C25 26 21 31 20 38Z" />
      <path className="tilak-buta-flower" d="M20 25C13 24 11 15 14 9C16 13 18 14 20 7C22 14 24 13 26 9C29 15 27 24 20 25Z" />
      <circle className="tilak-buta-bud" cx="11.5" cy="19" r="2.6" />
      <circle className="tilak-buta-bud" cx="28.5" cy="15" r="2.6" />
      <path className="tilak-buta-stem" d="M13 21Q17 24 19.6 30M27 17Q23 22 20.3 27" />
      <path className="tilak-buta-mound" d="M12 52Q20 46 28 52Z" />
    </g>
  )
}

/**
 * The Tilak scene's sky: a great cusped Mughal gateway, the kind the court was received in, with
 * flowering plants inlaid in the wall around it. The arch is drawn to the screen's own proportions,
 * so it is measured, and redrawn only when the screen changes size.
 */
export function MughalGate() {
  const box = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState<Frame | null>(null)

  useLayoutEffect(() => {
    const outer = box.current
    const inner = probe.current
    if (!outer || !inner) return
    const measure = () => {
      const o = outer.getBoundingClientRect()
      const i = inner.getBoundingClientRect()
      if (!o.width || !o.height) return
      const next: Frame = {
        width: Math.round(o.width),
        height: Math.round(o.height),
        left: Math.round(i.left - o.left),
        right: Math.round(i.right - o.left),
        top: Math.round(i.top - o.top),
        bottom: Math.round(i.bottom - o.top),
      }
      setFrame((prev) =>
        prev && (Object.keys(next) as (keyof Frame)[]).every((key) => prev[key] === next[key]) ? prev : next,
      )
    }
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  const gate = frame && gateGeometry(frame)

  return (
    <div ref={box} className="tilak-gate" aria-hidden="true">
      <div ref={probe} className="tilak-gate-probe" />
      {frame && gate && (
        <svg className="tilak-gate-art" viewBox={`0 0 ${frame.width} ${frame.height}`} width={frame.width} height={frame.height}>
          <defs>
            <pattern
              id="tilak-inlay"
              patternUnits="userSpaceOnUse"
              width={gate.unit}
              height={gate.unit * 1.5}
              x={frame.width / 2 - gate.unit / 4}
            >
              <Buta x={0} y={gate.unit * 0.04} scale={gate.unit / 80} />
              <Buta x={gate.unit / 2} y={gate.unit * 0.79} scale={gate.unit / 80} />
            </pattern>
          </defs>
          <path className="tilak-wall" d={gate.wall} fillRule="evenodd" />
          <path className="tilak-wall-inlay" d={gate.wall} fillRule="evenodd" fill="url(#tilak-inlay)" />
          <path className="tilak-extrados" d={gate.extrados} strokeWidth={gate.band} />
          <path className="tilak-extrados-inlay" d={gate.extrados} strokeWidth={Math.max(1.5, gate.band * 0.16)} />
          <path className="tilak-intrados" d={gate.lobed} strokeWidth={Math.max(4, gate.band * 0.55)} />
          <path className="tilak-intrados-gold" d={gate.lobed} strokeWidth={Math.max(1.5, gate.band * 0.18)} />
        </svg>
      )}
    </div>
  )
}
