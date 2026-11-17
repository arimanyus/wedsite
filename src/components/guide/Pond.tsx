import { useId, type CSSProperties } from 'react'

/** A pink lotus in the manner of the Pichwai frieze's pond. */
function LotusFlower() {
  const id = useId()
  return (
    <svg viewBox="0 0 40 30" className="pond-lotus">
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fbe3dc" />
          <stop offset=".55" stopColor="#f2b5b0" />
          <stop offset="1" stopColor="#d9707c" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`} stroke="#b8566a" strokeWidth=".7" strokeLinejoin="round">
        <path d="M19 27C11 28 4 24 1 19c7-1 14 2 18 8Z" />
        <path d="M21 27c8 1 15-3 18-8-7-1-14 2-18 8Z" />
        <path d="M20 27C13 24 8 16 8 8c6 3 11 10 12 19Z" />
        <path d="M20 27c7-3 12-11 12-19-6 3-11 10-12 19Z" />
        <path d="M20 27c-5-6-5-17 0-25 5 8 5 19 0 25Z" />
      </g>
    </svg>
  )
}

/** A lily pad seen from the bank, with its notch. */
function LilyPad() {
  return (
    <svg viewBox="0 0 60 18" className="pond-pad">
      <path d="M30 9 44 2.07A28 8 0 1 1 34.86 1.12Z" fill="#4f8a3c" stroke="#2f6b3a" strokeWidth="1" />
      <path d="M30 9 8 6M30 9 12 14M30 9 50 14M30 9 56 8" stroke="#7fb05a" strokeWidth=".8" fill="none" />
    </svg>
  )
}

const floats: { kind: 'lotus' | 'pad'; className: string }[] = [
  { kind: 'pad', className: 'pond-float-1' },
  { kind: 'lotus', className: 'pond-float-2' },
  { kind: 'pad', className: 'pond-float-3' },
  { kind: 'pad', className: 'pond-float-4' },
  { kind: 'lotus', className: 'pond-float-5' },
  { kind: 'pad', className: 'pond-float-6' },
]

function Float({ kind }: { kind: 'lotus' | 'pad' }) {
  if (kind === 'pad') return <LilyPad />
  return (
    <>
      <LilyPad />
      <LotusFlower />
    </>
  )
}

/**
 * The top of the section: the last frieze's lotus pond, carried on. The ripples are drawn in phase
 * with the frieze's own (see .guide-shore), and a few pads and flowers drift on the water.
 */
export function Pond() {
  return (
    <div className="pond" aria-hidden="true">
      <div className="pond-mist" />
      <div className="guide-shore" />
      {floats.map(({ kind, className }) => (
        <div key={className} className={`pond-float ${className}`}>
          <Float kind={kind} />
        </div>
      ))}
    </div>
  )
}

/** Where the side pads sit: which side of the column, how far out from it (rem) and how far down (%). */
const sides: { kind: 'lotus' | 'pad'; side: 'left' | 'right'; out: number; down: number }[] = [
  { kind: 'pad', side: 'left', out: 6, down: 9 },
  { kind: 'lotus', side: 'right', out: 4, down: 13 },
  { kind: 'lotus', side: 'left', out: 3, down: 24 },
  { kind: 'pad', side: 'right', out: 9, down: 30 },
  { kind: 'pad', side: 'left', out: 9, down: 39 },
  { kind: 'lotus', side: 'right', out: 5, down: 47 },
  { kind: 'lotus', side: 'left', out: 6, down: 58 },
  { kind: 'pad', side: 'right', out: 3, down: 64 },
]

/** On wide screens, the water either side of the schedule keeps its ripples, pads and flowers. */
export function PondSides() {
  return (
    <div className="pond-sides" aria-hidden="true">
      {sides.map(({ kind, side, out, down }) => (
        <div
          key={`${side}-${down}`}
          className={`pond-side pond-side-${side} pond-side-${kind}`}
          style={{ '--out': `${out}rem`, '--down': `${down}%` } as CSSProperties}
        >
          <Float kind={kind} />
        </div>
      ))}
    </div>
  )
}
