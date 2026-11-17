// Inline drawings for the Ganesh Pujan scene, in the grammar of Mithila (Madhubani) painting: thick
// black outlines, doubled; bands of repeated motifs; every gap filled.

/** A Madhubani fish, the Mithila sign of a good marriage, facing right in a 120 x 60 box. */
export function Fish({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg className={`mb-fish ${className}`} viewBox="-2 -2 124 64" aria-hidden="true" focusable="false">
      <g transform={flip ? 'translate(120 0) scale(-1 1)' : undefined}>
        <path className="mb-fish-tail" d="M22 30L2 10L8 30L2 50Z" />
        <path className="mb-fish-fin" d="M46 12L56 1L66 10ZM50 48L58 59L66 49Z" />
        <path className="mb-fish-body" d="M16 30C34 6 80 4 108 30C80 56 34 54 16 30Z" />
        <path className="mb-fish-head" d="M84 13C96 17 103 23 108 30C103 37 96 43 84 47C79 37 79 23 84 13Z" />
        <path
          className="mb-fish-scales"
          d="M30 24q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0M28 33q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0q5 6 10 0M34 42q5 5 10 0q5 5 10 0q5 5 10 0"
        />
        <path className="mb-fish-line" d="M22 30H80" />
        <circle className="mb-fish-eye" cx="95" cy="26" r="5.5" />
        <circle className="mb-fish-pupil" cx="96" cy="26" r="2.6" />
      </g>
    </svg>
  )
}

const LEAF = 'M0 0C-11 10 -12 30 0 52C12 30 11 10 0 0Z'
const VEINS = 'M0 8V42M0 17L-5 12M0 25L-6 20M0 33L-5 28M0 17L5 12M0 25L6 20M0 33L5 28'
const LEAVES = [
  { tone: 'mb-pink', x: 19, scale: 1 },
  { tone: 'mb-yellow', x: 57, scale: 0.8 },
  { tone: 'mb-blue', x: 95, scale: 1 },
  { tone: 'mb-orange', x: 133, scale: 0.8 },
]

/**
 * The sky: emerald ground filled edge to edge with small painted flowers, and along the top a
 * festive toran, a painted band hung with mango leaves, as over a doorway on a puja morning.
 */
export function MadhubaniSky() {
  return (
    <div className="ganesh-sky" aria-hidden="true">
      <svg className="ganesh-field" width="100%" height="100%">
        <defs>
          <pattern id="ganesh-flowers" patternUnits="userSpaceOnUse" width="72" height="72">
            <g className="mb-field-flower" transform="translate(18 18)">
              <path d="M0 -9C4 -9 4 -3 0 0C-4 -3 -4 -9 0 -9ZM0 9C4 9 4 3 0 0C-4 3 -4 9 0 9ZM-9 0C-9 4 -3 4 0 0C-3 -4 -9 -4 -9 0ZM9 0C9 4 3 4 0 0C3 -4 9 -4 9 0Z" />
              <circle r="2.2" />
            </g>
            <g className="mb-field-flower" transform="translate(54 54)">
              <path d="M0 -9C4 -9 4 -3 0 0C-4 -3 -4 -9 0 -9ZM0 9C4 9 4 3 0 0C-4 3 -4 9 0 9ZM-9 0C-9 4 -3 4 0 0C-3 -4 -9 -4 -9 0ZM9 0C9 4 3 4 0 0C3 -4 9 -4 9 0Z" />
              <circle r="2.2" />
            </g>
            <g className="mb-field-dots">
              <circle cx="54" cy="18" r="2" />
              <circle cx="18" cy="54" r="2" />
              <circle cx="36" cy="36" r="1.4" />
              <circle cx="0" cy="36" r="1.4" />
              <circle cx="36" cy="0" r="1.4" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ganesh-flowers)" />
      </svg>

      <svg className="ganesh-toran" viewBox="0 0 2400 100" preserveAspectRatio="xMidYMin slice">
        <defs>
          <pattern id="ganesh-rope" patternUnits="userSpaceOnUse" width="16" height="14">
            <rect className="mb-ink" width="16" height="14" />
            <circle className="mb-cream" cx="8" cy="7" r="2.6" />
          </pattern>
          <pattern id="ganesh-teeth" patternUnits="userSpaceOnUse" width="32" height="16">
            <rect className="mb-cream" width="32" height="16" />
            <path className="mb-tooth mb-red" d="M0 0H16L8 14Z" />
            <path className="mb-tooth mb-yellow" d="M16 0H32L24 14Z" />
          </pattern>
          <pattern id="ganesh-leaves" patternUnits="userSpaceOnUse" width="152" height="70" x="-14">
            {LEAVES.map(({ tone, x, scale }) => (
              <g key={tone} transform={`translate(${x} 4) scale(${scale})`}>
                <path className={`mb-leaf ${tone}`} d={LEAF} />
                <path className="mb-leaf-rim" d={LEAF} />
                <path className="mb-leaf-gap" d={LEAF} />
                <path className="mb-leaf-vein" d={VEINS} />
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="2400" height="14" fill="url(#ganesh-rope)" />
        <rect y="14" width="2400" height="16" fill="url(#ganesh-teeth)" />
        <rect className="mb-ink" y="29" width="2400" height="3" />
        <rect y="31" width="2400" height="69" fill="url(#ganesh-leaves)" />
      </svg>

      <Fish className="ganesh-sky-fish ganesh-sky-fish-left" />
      <Fish className="ganesh-sky-fish ganesh-sky-fish-right" flip />
    </div>
  )
}
