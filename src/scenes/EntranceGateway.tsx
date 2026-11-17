import { useLayoutEffect, useRef, useState } from 'react'

/** Outermost first. Each arch is a doorway set inside the one before, a step deeper into the pink. */
const ARCHES = ['#ea1c82', '#dc1479', '#ce0e71', '#bf0a69', '#ae0661']
/** Lobes along each side of an arch's crown, from the springing to the point. */
const LOBES = 4

interface Box {
  left: number
  right: number
  apex: number
  crown: number
  bottom: number
}

/**
 * The outline of a cusped Mughal arch: straight jambs, then a pointed crown scalloped into lobes
 * whose cusps point into the opening.
 */
function archPath({ left, right, apex, crown, bottom }: Box): string {
  const half = (right - left) / 2
  const centre = left + half
  const spring = apex + crown
  // A pointed crown: the arc of a circle stopped short of its top, so the two halves meet at an angle.
  const stop = (64 * Math.PI) / 180
  const along = (u: number, side: -1 | 1) => {
    const angle = u * stop
    return {
      x: centre + side * half * ((Math.cos(angle) - Math.cos(stop)) / (1 - Math.cos(stop))),
      y: spring - crown * (Math.sin(angle) / Math.sin(stop)),
    }
  }
  const points = [
    ...Array.from({ length: LOBES + 1 }, (_, step) => along(step / LOBES, -1)),
    ...Array.from({ length: LOBES }, (_, step) => along(1 - (step + 1) / LOBES, 1)),
  ]

  const f = (value: number) => value.toFixed(1)
  let path = `M${f(left)},${f(bottom)} L${f(points[0].x)},${f(points[0].y)}`
  for (let index = 1; index < points.length; index++) {
    const from = points[index - 1]
    const to = points[index]
    const radius = (Math.hypot(to.x - from.x, to.y - from.y) / 2) * 1.12
    path += ` A${f(radius)},${f(radius)} 0 0 1 ${f(to.x)},${f(to.y)}`
  }
  return `${path} L${f(right)},${f(bottom)} Z`
}

function gateway(width: number, height: number) {
  const step = Math.min(Math.max(width * 0.05, 14), 44)
  const rise = Math.min(Math.max(height * 0.034, 18), 30)
  const inset = Math.min(Math.max(width * 0.03, 8), 36)
  return ARCHES.map((fill, index) => {
    const left = inset + index * step
    const right = width - left
    const half = (right - left) / 2
    const box: Box = {
      left,
      right,
      apex: height * 0.012 + index * rise,
      crown: Math.min(half * 0.78, height * 0.3),
      bottom: height + 4,
    }
    const trim = Math.min(Math.max(width * 0.012, 5), 8)
    return {
      fill,
      edge: archPath(box),
      beads: archPath({
        ...box,
        left: left + trim,
        right: right - trim,
        apex: box.apex + trim * 1.25,
        crown: box.crown - trim * 0.25,
      }),
    }
  })
}

/** A gateway of nested scalloped arches, Jaipur pink, drawn to the size of the screen. */
export function EntranceGateway() {
  const ref = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const svg = ref.current
    if (!svg) return
    const measure = () => {
      const { width, height } = svg.getBoundingClientRect()
      setSize((previous) =>
        Math.abs(previous.width - width) < 1 && Math.abs(previous.height - height) < 1
          ? previous
          : { width: Math.round(width), height: Math.round(height) },
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  const { width, height } = size
  const arches = width > 0 ? gateway(width, height) : []

  return (
    <svg
      ref={ref}
      className="gateway"
      viewBox={`0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {arches.map((arch, index) => (
        <g key={index}>
          <path d={arch.edge} fill={arch.fill} className="gateway-arch" />
          <path d={arch.edge} className="gateway-trim" />
          <path d={arch.beads} className="gateway-beads" />
        </g>
      ))}
    </svg>
  )
}
