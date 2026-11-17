/** A pair of beamed quavers bent from one neon tube: a soft halo stroke, the tube, its hot core. */
export function NeonNote({ className }: { className?: string }) {
  const tube =
    'M14.5 47.5C9 50 3.5 48.5 3 45S7 37.5 12.5 35.5C16.5 34.2 20 35 20.5 37.5V12L50 5.5V31.5C50.5 34.5 47 38 42 39.5S33 40 32.5 37 36 30 41 28.5C45 27.3 48.5 27.8 50 29.5M20.5 21L50 14.5'
  return (
    <svg className={className} viewBox="-4 -2 62 56" aria-hidden="true" focusable="false">
      <path className="nn-note-halo" d={tube} />
      <path className="nn-note-tube" d={tube} />
      <path className="nn-note-core" d={tube} />
    </svg>
  )
}

type Tone = 'pink' | 'cyan' | 'yellow' | 'violet'

interface Beam {
  angle: number
  tone: Tone
  /** Half the beam's width at its far end, in viewBox units (the beam is 1000 long). */
  spread: number
}

/** A beam pointing straight up from (0, 0); `rotate` turns it into place. */
function BeamShape({ angle, tone, spread }: Beam) {
  const core = Math.max(2, spread * 0.18)
  return (
    <g transform={`rotate(${angle})`}>
      <polygon className="nn-haze" fill={`url(#nn-${tone})`} points={`-6,0 6,0 ${spread},-1000 ${-spread},-1000`} />
      <polygon className="nn-core" fill={`url(#nn-${tone})`} points={`-1,0 1,0 ${core},-1000 ${-core},-1000`} />
    </g>
  )
}

function Fan({ side, beams }: { side: 'left' | 'right'; beams: Beam[] }) {
  return (
    <div className={`nn-fan nn-fan-${side}`}>
      <svg className="nn-fan-art" viewBox="-500 -1000 1000 1000" aria-hidden="true" focusable="false">
        {beams.map((beam) => (
          <BeamShape key={`${beam.tone}${beam.angle}`} {...beam} />
        ))}
      </svg>
    </div>
  )
}

const tones: Record<Tone, string> = {
  pink: '#ff2bd6',
  cyan: '#20e3ff',
  yellow: '#ffe94a',
  violet: '#9b5cff',
}

const leftBeams: Beam[] = [
  { angle: -14, tone: 'violet', spread: 70 },
  { angle: 2, tone: 'pink', spread: 34 },
  { angle: 13, tone: 'yellow', spread: 18 },
  { angle: 24, tone: 'pink', spread: 46 },
  { angle: 36, tone: 'cyan', spread: 22 },
]

const rightBeams: Beam[] = leftBeams.map(({ angle, tone, spread }) => ({
  angle: -angle,
  tone: ({ pink: 'cyan', cyan: 'pink', yellow: 'violet', violet: 'yellow' } as const)[tone],
  spread,
}))

/**
 * The night over the Sangeet: two fans of searchlights and lasers that rise from behind the
 * skyline on either side and cross high above the club's signs, sweeping slowly.
 */
export function NeonSky() {
  return (
    <div className="nn-sky">
      <svg className="nn-defs" aria-hidden="true" focusable="false">
        <defs>
          {Object.entries(tones).map(([tone, colour]) => (
            <linearGradient key={tone} id={`nn-${tone}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-1000">
              <stop offset="0" stopColor={colour} stopOpacity="0" />
              <stop offset="0.1" stopColor={colour} stopOpacity="0.9" />
              <stop offset="0.5" stopColor={colour} stopOpacity="0.4" />
              <stop offset="1" stopColor={colour} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
      <div className="nn-stars" />
      <Fan side="left" beams={leftBeams} />
      <Fan side="right" beams={rightBeams} />
      <div className="nn-halo" />
    </div>
  )
}
