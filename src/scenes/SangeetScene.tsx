import { EventDetails } from '@/components/EventDetails'
import { Sky, TextBlock } from '@/components/SceneLayers'

/**
 * The Sangeet, 2 Dec, as a neon sign from a retro future.
 * Styles: src/styles/scenes/sangeet.css. Frieze: `sangeet`.
 */
export function SangeetScene() {
  return (
    <>
      <Sky>
        <div className="stars" />
      </Sky>

      <TextBlock>
        <EventDetails scene="sangeet" />
      </TextBlock>
    </>
  )
}
