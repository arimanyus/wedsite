import type { ReactNode } from 'react'

import { usePlane } from '@/journey/context'

// A scene component is rendered once into each plane of the stage, and these slots decide what it
// contributes to which plane. The wrapper elements (with the scene's class, `.scene-<id>`) and all
// their motion come from `Planes.tsx`, so a scene file only says what goes where:
//
//   <Sky>         decorations on the backdrop, behind the frieze   → inside `.sky.scene-<id>`
//   <Foreground>  decorations in front of the frieze, behind text  → inside `.foreground.scene-<id>`
//   <TextBlock>   the words and buttons                            → inside `.scene-text.scene-<id>`
//
// The backdrop colour itself is CSS on `.sky.scene-<id>` and the frieze is chosen in
// `src/journey/scenes.ts`.

/** Decorations on the scene's backdrop, behind the frieze. They dissolve with the sky. */
export function Sky({ children }: { children?: ReactNode }) {
  return usePlane() === 'sky' ? children : null
}

/** Decorations in front of the frieze and behind the text. They dissolve with the sky. */
export function Foreground({ children }: { children?: ReactNode }) {
  return usePlane() === 'foreground' ? children : null
}

/** The scene's words and buttons, centred in the space above the frieze. */
export function TextBlock({ children }: { children?: ReactNode }) {
  return usePlane() === 'text' ? children : null
}
