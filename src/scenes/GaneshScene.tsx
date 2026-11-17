import { EventDetails } from '@/components/EventDetails'
import { TextBlock } from '@/components/SceneLayers'

/**
 * Ganesh Pujan, 29 Nov, in the Madhubani folk style.
 * Styles: src/styles/scenes/ganesh.css. Frieze: `madhubani`.
 */
export function GaneshScene() {
  return (
    <TextBlock>
      <EventDetails scene="ganesh" />
    </TextBlock>
  )
}
