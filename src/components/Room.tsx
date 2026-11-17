import { motion, useTransform } from 'motion/react'
import { useMemo, type ReactNode } from 'react'

import { art } from '@/art'
import { RoomContext, useMuseum } from '@/museum/context'
import { roomPose, rooms } from '@/museum/rooms'

interface RoomProps {
  index: number
  /** Line on the plaque under the frame, for example the event name. */
  plaque: string
  children: ReactNode
}

/**
 * One painting. While the visitor is inside it, it fills the screen. Between paintings it shrinks
 * back into its frame on the gallery wall and slides away as the next one arrives.
 */
export function Room({ index, plaque, children }: RoomProps) {
  const { t, options } = useMuseum()
  const room = rooms[index]

  const pose = useTransform(t, (value) => roomPose(index, value, options))
  const display = useTransform(pose, (p) => (p.visible ? 'block' : 'none'))
  const x = useTransform(pose, (p) => `${p.x * 100}vw`)
  const scale = useTransform(pose, (p) => p.scale)
  const opacity = useTransform(pose, (p) => p.opacity)
  const framed = useTransform(pose, (p) => p.framed)
  const frameVisibility = useTransform(pose, (p) => (p.framed > 0.001 ? 'visible' : 'hidden'))
  const presence = useTransform(pose, (p) => p.presence)
  const inside = useTransform(pose, (p) => p.inside)
  const roomState = useMemo(() => ({ presence, inside }), [presence, inside])

  const corner = room.frame === 'gilt' ? art('orn-frame-corner') : undefined

  return (
    <motion.article
      id={`room-${room.id}`}
      className={`room room-${room.id}`}
      style={{ display, x, scale, opacity }}
      aria-label={`Gallery ${room.gallery}: ${plaque}`}
    >
      <div className="room-canvas">
        <RoomContext.Provider value={roomState}>{children}</RoomContext.Provider>
      </div>

      <motion.div
        className={`frame frame-${room.frame}`}
        style={{ opacity: framed, visibility: frameVisibility }}
        aria-hidden="true"
      >
        {corner &&
          (['tl', 'tr', 'br', 'bl'] as const).map((position) => (
            <img key={position} src={corner} alt="" className={`frame-corner frame-corner-${position}`} />
          ))}
      </motion.div>

      <motion.div className="plaque" style={{ opacity: framed, visibility: frameVisibility }} aria-hidden="true">
        <span className="plaque-gallery">Gallery {room.gallery}</span>
        <span className="plaque-title">{plaque}</span>
        <span className="plaque-era">{room.era}</span>
      </motion.div>
    </motion.article>
  )
}
