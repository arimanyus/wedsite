import { motion, useTransform } from 'motion/react'

import { art } from '@/art'
import { useMuseum, useRoom } from '@/museum/context'

/**
 * The painted frieze along the bottom of a room. Its far and near layers drift at different
 * speeds as the painting arrives and leaves, and follow the pointer a little, which gives depth.
 */
export function Scene({ name }: { name: string }) {
  const { pointer } = useMuseum()
  const { presence } = useRoom()
  const backX = useTransform([presence, pointer], ([p, m]: number[]) => `${p * 2.2 - m * 0.4}%`)
  const frontX = useTransform([presence, pointer], ([p, m]: number[]) => `${p * 0.9 - m * 1}%`)

  const back = art(`${name}.back`)
  const front = art(`${name}.front`)

  return (
    <div className="scene" aria-hidden="true">
      {back && (
        <motion.img src={back} alt="" className="scene-layer" draggable={false} style={{ x: backX, scale: 1.06 }} />
      )}
      {front && (
        <motion.img src={front} alt="" className="scene-layer" draggable={false} style={{ x: frontX, scale: 1.06 }} />
      )}
    </div>
  )
}
