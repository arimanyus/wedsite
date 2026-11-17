import type { SceneId } from '@/data/wedding'

const words: [letter: string, scene: SceneId][][] = [
  [
    ['T', 'tilak'],
    ['H', 'ganesh'],
    ['E', 'matrika'],
  ],
  [
    ['P', 'baraat'],
    ['L', 'pool'],
    ['A', 'sangeet'],
    ['N', 'wedding'],
  ],
]

/** "The plan", one letter for each of the seven celebration scenes, in its colour and typeface. */
export function PlanTitle() {
  return (
    <h2 className="plan-title">
      <span className="sr-only">The plan</span>
      <span className="plan-title-tiles" aria-hidden="true">
        {words.map((word, index) => (
          <span key={index} className="plan-title-word">
            {word.map(([letter, scene]) => (
              <span key={scene} className="plan-tile" data-scene={scene}>
                {letter}
              </span>
            ))}
          </span>
        ))}
      </span>
    </h2>
  )
}
