import { ForegroundPlane, GroundPlane, SkyPlane, TextPlane } from '@/components/Planes'
import { useJourney } from '@/journey/context'
import { restingPoints, TOTAL } from '@/journey/timeline'

/**
 * The journey. The outer element is very tall and only provides scroll length; the stage inside it
 * stays pinned to the screen. The stage is four planes shared by every scene, back to front: the
 * sky, the ground (all friezes on one strip), decorations in front of the ground, and the text.
 * On touch screens a swipe comes to rest on one of the markers along the track.
 */
export function Journey() {
  const { trackRef } = useJourney()

  return (
    <div ref={trackRef} className="journey" style={{ height: `${(TOTAL + 1) * 100}vh` }}>
      {restingPoints.map((point) => (
        <div key={point} className="journey-rest" style={{ top: `${point * 100}vh` }} />
      ))}
      <div className="journey-stage">
        <SkyPlane />
        <GroundPlane />
        <ForegroundPlane />
        <TextPlane />
      </div>
    </div>
  )
}
