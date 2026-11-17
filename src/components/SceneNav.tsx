import type { KeyboardEvent } from 'react'

import { useActiveScene, useJourney } from '@/journey/context'
import { scenes } from '@/journey/scenes'

const stops = [...scenes.map((scene) => ({ id: scene.id as string, label: scene.label })), { id: 'guide', label: 'The plan' }]

/** A slim rail of dots along the right edge: one per scene, plus the schedule at the end. */
export function SceneNav() {
  const active = useActiveScene()
  const { goTo } = useJourney()

  // Up and down move between the dots, as in a list; Tab moves on out of the rail.
  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const buttons = [...event.currentTarget.querySelectorAll('button')]
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      event.key === 'ArrowDown' ? current + 1
      : event.key === 'ArrowUp' ? current - 1
      : event.key === 'Home' ? 0
      : event.key === 'End' ? buttons.length - 1
      : null
    if (next === null || current < 0) return
    event.preventDefault()
    buttons[Math.min(buttons.length - 1, Math.max(0, next))].focus()
  }

  return (
    <nav className="scene-nav" aria-label="Celebrations" data-away={active === stops.length - 1 ? '' : undefined}>
      <ol onKeyDown={onKeyDown}>
        {stops.map((stop, index) => (
          <li key={stop.id}>
            <button
              type="button"
              className="scene-nav-dot"
              onClick={() => goTo(index)}
              aria-current={index === active ? 'step' : undefined}
              aria-label={stop.label}
            >
              <span className="scene-nav-label" aria-hidden="true">
                {stop.label}
              </span>
              <span className="scene-nav-mark" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
