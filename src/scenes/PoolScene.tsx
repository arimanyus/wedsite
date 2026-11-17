import { EventDetails } from '@/components/EventDetails'
import { Sky, TextBlock } from '@/components/SceneLayers'

/**
 * Pool Party Carnival, 2 Dec, as 1960s pop art.
 * Styles: src/styles/scenes/pool.css. Frieze: `pool`.
 */
export function PoolScene() {
  return (
    <>
      <Sky>
        <div className="halftone" />
      </Sky>

      <TextBlock>
        <EventDetails scene="pool" />
      </TextBlock>
    </>
  )
}
