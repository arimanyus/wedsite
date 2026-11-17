import { motion, useTransform } from 'motion/react'

import { useMuseum } from '@/museum/context'
import { distanceWalked, rooms, roomStarts, TOTAL } from '@/museum/rooms'
import { BaraatRoom } from '@/rooms/BaraatRoom'
import { EntranceRoom } from '@/rooms/EntranceRoom'
import { GaneshRoom } from '@/rooms/GaneshRoom'
import { MatrikaRoom } from '@/rooms/MatrikaRoom'
import { PoolRoom } from '@/rooms/PoolRoom'
import { SangeetRoom } from '@/rooms/SangeetRoom'
import { TilakRoom } from '@/rooms/TilakRoom'
import { WeddingRoom } from '@/rooms/WeddingRoom'

const paintings = {
  entrance: EntranceRoom,
  tilak: TilakRoom,
  ganesh: GaneshRoom,
  matrika: MatrikaRoom,
  baraat: BaraatRoom,
  pool: PoolRoom,
  sangeet: SangeetRoom,
  wedding: WeddingRoom,
}

// The wall keeps each gallery's colour while the visitor is inside and blends during the walk.
const wallStops = rooms.flatMap((room, index) => [roomStarts[index], roomStarts[index] + room.dwell])
const wallColours = rooms.flatMap((room) => [room.wall, room.wall])

// Width of one wall panel, in viewport widths.
const PANEL = 38

/**
 * The galleries. The outer element is very tall and only provides scroll distance; the stage
 * inside it stays pinned to the screen while the paintings come and go.
 */
export function Museum() {
  const { trackRef, t, options } = useMuseum()
  const wall = useTransform(t, wallStops, wallColours)
  const stride = (0.5 + options.hung / 2 + 0.07) * 100
  const panelsX = useTransform(t, (value) => `${-((distanceWalked(value) * stride) % PANEL)}vw`)

  return (
    <div ref={trackRef} className="museum" style={{ height: `${(TOTAL + 1) * 100}vh` }}>
      <div className="museum-stage">
        <motion.div className="wall" style={{ backgroundColor: wall }} aria-hidden="true">
          <motion.div className="wall-panels" style={{ x: panelsX }} />
          <div className="wall-light" />
          <div className="wall-floor" />
        </motion.div>
        {rooms.map((room, index) => {
          const Painting = paintings[room.id]
          return <Painting key={room.id} index={index} />
        })}
      </div>
    </div>
  )
}
