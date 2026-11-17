import { EventDetails } from '@/components/EventDetails'
import { Room } from '@/components/Room'
import { Scene } from '@/components/Scene'

/** Gallery VII. The Sangeet as a neon sign from a retro future. */
export function SangeetRoom({ index }: { index: number }) {
  return (
    <Room index={index} plaque="Sangeet">
      <div className="stars" aria-hidden="true" />
      <div className="room-content">
        <EventDetails room="sangeet" />
      </div>
      <Scene name="sangeet" />
    </Room>
  )
}
