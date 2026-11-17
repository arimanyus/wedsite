import { EventDetails } from '@/components/EventDetails'
import { Room } from '@/components/Room'
import { Scene } from '@/components/Scene'

/** Gallery IV. Matrika Pujan as an Art Nouveau panel. */
export function MatrikaRoom({ index }: { index: number }) {
  return (
    <Room index={index} plaque="Matrika Pujan">
      <div className="room-content">
        <EventDetails room="matrika" />
      </div>
      <Scene name="nouveau" />
    </Room>
  )
}
