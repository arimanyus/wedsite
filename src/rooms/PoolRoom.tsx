import { EventDetails } from '@/components/EventDetails'
import { Room } from '@/components/Room'
import { Scene } from '@/components/Scene'

/** Gallery VI. Pool Party Carnival as 1960s pop art. */
export function PoolRoom({ index }: { index: number }) {
  return (
    <Room index={index} plaque="Pool Party Carnival">
      <div className="halftone" aria-hidden="true" />
      <div className="room-content">
        <EventDetails room="pool" />
      </div>
      <Scene name="pool" />
    </Room>
  )
}
