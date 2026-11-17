import { EventDetails } from '@/components/EventDetails'
import { Room } from '@/components/Room'
import { Scene } from '@/components/Scene'

/** Gallery II. Tilak Ceremony, then Food & Blessings, as a Mughal miniature. */
export function TilakRoom({ index }: { index: number }) {
  return (
    <Room index={index} plaque="Tilak Ceremony">
      <div className="room-content">
        <EventDetails room="tilak" />
      </div>
      <Scene name="mughal" />
    </Room>
  )
}
