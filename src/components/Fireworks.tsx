import { memo, useState, type CSSProperties } from 'react'

import { useJourney } from '@/journey/context'

/**
 * Fireworks in a scene's sky, behind the frieze: rockets climb, burst, droop and glitter out, one
 * after another, each time somewhere new in a new colour and shape. Every piece is a picture drawn
 * once and then only scaled and faded, so the bursts cost a phone almost nothing. Nothing is shown
 * to guests who have asked for less motion. Styles: src/styles/fireworks.css.
 */

type Shape = 'peony' | 'dahlia' | 'willow' | 'ring' | 'palm'

interface Palette {
  /** Main colours of the stars. */
  colours: string[]
  /** Colours of the second, smaller burst inside. */
  accents: string[]
  shapes: Shape[]
  /** Strength of the glow lighting up the sky around a burst (0 for none). */
  flash: number
  /** How bold the stars are drawn: heavier in daylight, where they have to stand out. */
  weight: number
}

const PALETTES = {
  /** Gold and cream over the Welcome's rani pink. */
  gold: {
    colours: ['#ffd34d', '#fff1b8', '#ffb21e', '#ffe680'],
    accents: ['#5fe3c0', '#ffffff', '#ff8a1f'],
    shapes: ['willow', 'peony', 'ring', 'palm', 'dahlia'],
    flash: 0.32,
    weight: 1.5,
  },
  /** Deep, saturated colours that stand out against the Baraat's yellow sunburst. */
  festive: {
    colours: ['#e6007e', '#d7263d', '#2b3fd6', '#00a86b', '#7b2ff7', '#ff5a00'],
    accents: ['#2b3fd6', '#e6007e', '#00a86b', '#7b2ff7'],
    shapes: ['peony', 'dahlia', 'ring', 'palm', 'peony'],
    flash: 0,
    weight: 1.9,
  },
  /** Neon over the Sangeet's night. */
  neon: {
    colours: ['#20e3ff', '#ff2bd6', '#ffe94a', '#9dff3a', '#ff8a1f', '#b18cff'],
    accents: ['#ffffff', '#20e3ff', '#ff2bd6', '#ffe94a'],
    shapes: ['peony', 'dahlia', 'willow', 'ring', 'palm'],
    flash: 0.4,
    weight: 1.25,
  },
} satisfies Record<string, Palette>

export type PaletteName = keyof typeof PALETTES

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]
const between = (low: number, high: number) => low + Math.random() * (high - low)

/** A small seeded random generator, so a burst's stars stay put while it is on screen. */
function random(seed: number) {
  let state = seed % 2147483647 || 1
  return () => (state = (state * 16807) % 2147483647) / 2147483647
}

function hexToRgba(hex: string, alpha: number) {
  const value = Number.parseInt(hex.slice(1), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

interface Shot {
  x: number
  y: number
  scale: number
  shape: Shape
  colour: string
  accent: string
  seed: number
}

/** Somewhere in the open sky: mostly towards the sides, sometimes high in the middle. */
function nextShot(palette: Palette, slot: number): Shot {
  const side = slot % 2 === 0 ? 'left' : 'right'
  const middle = Math.random() < 0.22
  const x = middle ? between(36, 64) : side === 'left' ? between(5, 30) : between(70, 95)
  const y = middle ? between(7, 18) : between(10, 42)
  return {
    x,
    y,
    scale: between(0.72, 1.2),
    shape: pick(palette.shapes),
    colour: pick(palette.colours),
    accent: pick(palette.accents),
    seed: Math.floor(Math.random() * 1e9),
  }
}

/** The stars of one burst, in a box 200 across centred on the burst. */
const Stars = memo(function Stars({
  shape,
  colour,
  accent,
  seed,
  id,
  weight,
}: Omit<Shot, 'x' | 'y' | 'scale'> & { id: string; weight: number }) {
  const rand = random(seed)
  const count = { peony: 38, dahlia: 30, willow: 26, ring: 34, palm: 9 }[shape]
  const turn = rand() * Math.PI * 2
  const lines: { d: string; head: [number, number]; second: boolean; width: number }[] = []
  for (let i = 0; i < count; i++) {
    const angle = turn + (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.12
    const reach = shape === 'ring' ? 84 : shape === 'palm' ? 80 + rand() * 14 : 72 + rand() * 24
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const droop = shape === 'willow' ? 34 : shape === 'palm' ? 22 : 6
    const end: [number, number] = [cos * reach, sin * reach + droop * (0.4 + 0.6 * ((sin + 1) / 2))]
    const mid: [number, number] = [cos * reach * 0.62, sin * reach * 0.62]
    lines.push({
      d: `M${(cos * 6).toFixed(1)} ${(sin * 6).toFixed(1)}Q${mid[0].toFixed(1)} ${mid[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`,
      head: end,
      second: shape === 'dahlia' && i % 2 === 1,
      width: (shape === 'palm' ? 4.2 : shape === 'willow' ? 1.6 : 2.1) * weight,
    })
  }
  const tails = shape !== 'ring'
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      <defs>
        {[colour, accent].map((tone, index) => (
          <radialGradient key={index} id={`${id}-${index}`} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="100">
            <stop offset="0" stopColor={tone} stopOpacity="0" />
            <stop offset="0.45" stopColor={tone} stopOpacity="0.15" />
            <stop offset="0.8" stopColor={tone} stopOpacity="0.95" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </radialGradient>
        ))}
      </defs>
      {tails &&
        lines.map((line, index) => (
          <path
            key={index}
            d={line.d}
            fill="none"
            stroke={line.second ? accent : colour}
            strokeOpacity="0.16"
            strokeWidth={line.width * 3.2}
            strokeLinecap="round"
          />
        ))}
      {lines.map((line, index) => (
        <circle
          key={index}
          cx={line.head[0].toFixed(1)}
          cy={line.head[1].toFixed(1)}
          r={6 * weight}
          fill={line.second ? accent : colour}
          fillOpacity="0.22"
        />
      ))}
      {tails &&
        lines.map((line, index) => (
          <path
            key={index}
            d={line.d}
            fill="none"
            stroke={`url(#${id}-${line.second ? 1 : 0})`}
            strokeWidth={line.width}
            strokeLinecap="round"
          />
        ))}
      {lines.map((line, index) => (
        <circle
          key={index}
          cx={line.head[0].toFixed(1)}
          cy={line.head[1].toFixed(1)}
          r={(shape === 'ring' ? 3.2 : shape === 'palm' ? 3.6 : 2.4) * weight}
          fill={line.second ? accent : index % 3 === 0 ? '#fff' : colour}
        />
      ))}
    </svg>
  )
})

/** A smaller burst of the accent colour, inside the main one. */
const Inner = memo(function Inner({ accent, seed, weight }: { accent: string; seed: number; weight: number }) {
  const rand = random(seed + 7)
  const count = 16
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + rand() * 0.3
        const x = (Math.cos(angle) * 46).toFixed(1)
        const y = (Math.sin(angle) * 46).toFixed(1)
        return (
          <g key={i} fill={accent}>
            <circle cx={x} cy={y} r={7 * weight} fillOpacity="0.2" />
            <circle cx={x} cy={y} r={2.8 * weight} />
          </g>
        )
      })}
    </svg>
  )
})

/** The glitter left hanging after a burst, which crackles as it falls. */
const Glitter = memo(function Glitter({ colour, seed, weight }: { colour: string; seed: number; weight: number }) {
  const rand = random(seed + 13)
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      {Array.from({ length: 46 }, (_, i) => {
        const angle = rand() * Math.PI * 2
        const reach = 28 + rand() * 70
        return (
          <circle
            key={i}
            cx={(Math.cos(angle) * reach).toFixed(1)}
            cy={(Math.sin(angle) * reach + 10).toFixed(1)}
            r={((0.9 + rand() * 1.3) * weight).toFixed(1)}
            fill={i % 4 === 0 ? colour : '#fff6d8'}
          />
        )
      })}
    </svg>
  )
})

/** Seconds per cycle for each launch site; all different, so the show never falls into step. */
const CYCLES = [4.2, 5.1, 3.7, 4.7, 5.6]

function Launch({ slot, palette, name }: { slot: number; palette: Palette; name: string }) {
  const [shot, setShot] = useState(() => nextShot(palette, slot))
  const cycle = CYCLES[slot % CYCLES.length]
  const style = {
    '--x': `${shot.x}%`,
    '--y': `${shot.y}%`,
    '--scale': shot.scale,
    '--colour': shot.colour,
    '--flash': hexToRgba(shot.colour, palette.flash),
    '--cycle': `${cycle}s`,
    '--delay': `${-(slot / CYCLES.length) * cycle * 1.7}s`,
  } as CSSProperties

  return (
    <div className="fw" style={style}>
      {palette.flash > 0 && <span className="fw-flash" />}
      <span className="fw-rocket" />
      {/* Each time round, while nothing of it is showing, the launch moves and changes. */}
      <span className="fw-burst" onAnimationIteration={() => setShot(nextShot(palette, slot))}>
        <Stars id={`fw-${name}-${slot}`} shape={shot.shape} colour={shot.colour} accent={shot.accent} seed={shot.seed} weight={palette.weight} />
      </span>
      <span className="fw-inner">
        <Inner accent={shot.accent} seed={shot.seed} weight={palette.weight} />
      </span>
      <span className="fw-glitter">
        <Glitter colour={shot.colour} seed={shot.seed} weight={palette.weight} />
      </span>
    </div>
  )
}

/** A fireworks show in the sky of the scene this is placed in (inside its <Sky>). */
export function Fireworks({ palette, launches = 4 }: { palette: PaletteName; launches?: number }) {
  const { calm } = useJourney()
  if (calm) return null
  return (
    <div className={`fireworks fireworks-${palette}`} aria-hidden="true">
      {Array.from({ length: launches }, (_, slot) => (
        <Launch key={slot} slot={slot} palette={PALETTES[palette]} name={palette} />
      ))}
    </div>
  )
}
