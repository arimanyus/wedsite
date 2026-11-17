import { EventDetails } from '@/components/EventDetails'
import { Room } from '@/components/Room'
import { Scene } from '@/components/Scene'

/** Gallery III. Ganesh Pujan as a Madhubani folk painting. */
export function GaneshRoom({ index }: { index: number }) {
  return (
    <Room index={index} plaque="Ganesh Pujan">
      <div className="room-content">
        <EventDetails room="ganesh" />
      </div>
      <Scene name="madhubani" />
    </Room>
  )
}
