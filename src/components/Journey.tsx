import { ForegroundPlane, GroundPlane, SkyPlane, TextPlane } from '@/components/Planes'
import { useJourney } from '@/journey/context'
import { TOTAL } from '@/journey/timeline'

/**
 * The journey. The outer element is very tall and only provides scroll length; the stage inside it
 * stays pinned to the screen. The stage is four planes shared by every scene, back to front: the
 * sky, the ground (all friezes on one strip), decorations in front of the ground, and the text.
 */
export function Journey() {
  const { trackRef } = useJourney()

  return (
    <div ref={trackRef} className="journey" style={{ height: `${(TOTAL + 1) * 100}vh` }}>
      <div className="journey-stage">
        <SkyPlane />
        <GroundPlane />
        <ForegroundPlane />
        <TextPlane />
      </div>
    </div>
  )
}
