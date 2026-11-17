import { EventDetails } from '@/components/EventDetails'
import { TextBlock } from '@/components/SceneLayers'

/**
 * Matrika Pujan, 30 Nov, as an Art Nouveau panel.
 * Styles: src/styles/scenes/matrika.css. Frieze: `nouveau`.
 */
export function MatrikaScene() {
  return (
    <TextBlock>
      <EventDetails scene="matrika" />
    </TextBlock>
  )
}
