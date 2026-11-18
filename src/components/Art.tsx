import { motion, type MotionStyle } from 'motion/react'
import { useState, type ComponentProps, type CSSProperties } from 'react'

import { groundArt, movesOf, type MovingPart } from '@/art'
import { useJourney } from '@/journey/context'

const percent = (share: number) => `${share * 100}%`

interface ImageProps {
  fetchPriority?: 'high' | 'low' | 'auto'
  loading?: 'lazy' | 'eager'
}

/**
 * An image that asks again, a little later, if it fails to arrive. A drawing is cut into hundreds
 * of small images, and the host can turn one away now and then (just after a deploy, say); without
 * this the piece it shows would be missing from the picture until the page was reloaded.
 */
function Picture({ src, ...props }: Omit<ComponentProps<'img'>, 'src'> & { src: string }) {
  const [attempt, setAttempt] = useState(0)
  return (
    <img
      {...props}
      src={attempt ? `${src}?retry=${attempt}` : src}
      onError={() => {
        if (attempt < 3) window.setTimeout(() => setAttempt(attempt + 1), 1500 * (attempt + 1))
      }}
    />
  )
}

/**
 * One moving part, laid exactly where it was drawn inside `within` (its drawing's or its parent
 * part's box) and animated by its `move-<name>` class. Travel is set as a share of the part's own
 * size, so it is right at every size of screen.
 */
function Part({ part, within, rasterWidth, image }: { part: MovingPart; within: MovingPart['box']; rasterWidth: number; image: ImageProps }) {
  const [x, y, width, height] = part.box
  const [left, top, outerWidth, outerHeight] = within
  const [dx, dy] = part.path ?? [0, 0]
  const src = groundArt(part.name, rasterWidth)
  const style = {
    left: percent((x - left) / outerWidth),
    top: percent((y - top) / outerHeight),
    width: percent(width / outerWidth),
    height: percent(height / outerHeight),
    transformOrigin: `${percent((part.origin[0] - x) / width)} ${percent((part.origin[1] - y) / height)}`,
    '--dur': `${part.dur}s`,
    '--delay': `${part.delay}s`,
    '--amp': part.amp,
    '--ax': percent(part.amp / width),
    '--ay': percent(part.amp / height),
    '--dx': percent(dx / width),
    '--dy': percent(dy / height),
  } as CSSProperties

  return (
    <div className={`move move-${part.move}`} style={style}>
      {src && <Picture src={src} alt="" className="art-fill" draggable={false} decoding="async" {...image} />}
      {part.children?.map((child) => (
        <Part key={child.name} part={child} within={part.box} rasterWidth={rasterWidth} image={image} />
      ))}
    </div>
  )
}

interface ArtProps extends ImageProps {
  /** A prepared drawing on the ground: a frieze layer such as `pichwai.front`, a join, the bus. */
  name: string
  className?: string
  style?: MotionStyle
}

/**
 * A piece of ground artwork with its moving parts. A drawing with none is a single image; one with
 * some is that image with the parts laid over it, each in its own small image, so the browser only
 * ever moves pictures it has already painted. Nothing is fetched until the ground has been measured.
 */
export function Art({ name, className, style, ...image }: ArtProps) {
  const { rasterWidth } = useJourney()
  const src = rasterWidth ? groundArt(name, rasterWidth) : undefined
  if (!src) return null
  const moves = movesOf(name)
  const picture = { src, alt: '', draggable: false, decoding: 'async' as const, ...image }

  if (!moves) return <motion.img {...picture} className={className} style={style} />
  return (
    <motion.div className={`${className ?? ''} has-moves`} style={style}>
      <Picture {...picture} className="art-fill" />
      {moves.parts.map((part) => (
        <Part key={part.name} part={part} within={moves.size} rasterWidth={rasterWidth} image={image} />
      ))}
    </motion.div>
  )
}
