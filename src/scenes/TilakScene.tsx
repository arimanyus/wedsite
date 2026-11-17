import { EventDetails } from '@/components/EventDetails'
import { TextBlock } from '@/components/SceneLayers'

/**
 * Tilak Ceremony, then Food & Blessings, 28 Nov, as a Mughal miniature.
 * Styles: src/styles/scenes/tilak.css. Frieze: `mughal`.
 */
export function TilakScene() {
  return (
    <TextBlock>
      <EventDetails scene="tilak" />
    </TextBlock>
  )
}
