import { motion, type MotionStyle } from 'motion/react'
import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from 'react'

import { art, groundArt, movesOf, type MovingPart } from '@/art'
import { useJourney } from '@/journey/context'
import { imageArrived, useExpectedImages, useMayFetch } from '@/journey/loading'

const percent = (share: number) => `${share * 100}%`

interface ImageProps {
  fetchPriority?: 'high' | 'low' | 'auto'
  loading?: 'lazy' | 'eager'
}

/** How many images a drawing is shown with: itself, and each moving part that has artwork of its own. */
function imageCount(name: string): number {
  const count = (parts: MovingPart[] = []): number =>
    parts.reduce((sum, part) => sum + (art(part.name) ? 1 : 0) + count(part.children), 0)
  return 1 + count(movesOf(name)?.parts)
}

type PictureProps = Omit<ComponentProps<'img'>, 'src'> & { src: string; onArrive: () => void }

/**
 * An image that asks again, a little later, if it fails to arrive. A drawing is cut into hundreds
 * of small images, and the host can turn one away now and then (just after a deploy, say); without
 * this the piece it shows would be missing from the picture until the page was reloaded. Calls
 * `onArrive` once, when the image is in or has failed for good.
 */
function Picture({ src, onArrive, ...props }: PictureProps) {
  const [attempt, setAttempt] = useState(0)
  const done = useRef(false)
  const arrive = () => {
    if (done.current) return
    done.current = true
    onArrive()
  }
  return (
    <img
      {...props}
      src={attempt ? `${src}?retry=${attempt}` : src}
      onLoad={arrive}
      onError={() => {
        if (attempt < 3) window.setTimeout(() => setAttempt(attempt + 1), 1500 * (attempt + 1))
        else arrive()
      }}
    />
  )
}

interface PartProps {
  part: MovingPart
  within: MovingPart['box']
  rasterWidth: number
  image: ImageProps
  onArrive: () => void
}

/**
 * One moving part, laid exactly where it was drawn inside `within` (its drawing's or its parent
 * part's box) and animated by its `move-<name>` class. Travel is set as a share of the part's own
 * size, so it is right at every size of screen.
 */
function Part({ part, within, rasterWidth, image, onArrive }: PartProps) {
  const [x, y, width, height] = part.box
  const [left, top, outerWidth, outerHeight] = within
  const [dx, dy] = part.path ?? [0, 0]
  const src = art(part.name) && groundArt(part.name, rasterWidth)
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
      {src && (
        <Picture src={src} alt="" className="art-fill" draggable={false} decoding="async" onArrive={onArrive} {...image} />
      )}
      {part.children?.map((child) => (
        <Part key={child.name} part={child} within={part.box} rasterWidth={rasterWidth} image={image} onArrive={onArrive} />
      ))}
    </div>
  )
}

interface ArtProps extends ImageProps {
  /** A prepared drawing on the ground: a frieze layer such as `pichwai.front`, a join, the bus. */
  name: string
  /** The scene (index into `scenes`) whose artwork this is, fetched in that scene's turn (journey/loading.ts). */
  scene?: number
  className?: string
  style?: MotionStyle
}

/**
 * A piece of ground artwork with its moving parts. A drawing with none is a single image; one with
 * some is that image with the parts laid over it, each in its own small image, so the browser only
 * ever moves pictures it has already painted. Nothing is fetched until the ground has been measured
 * and the scene's turn has come, and nothing shows until every piece is in: then it fades in whole,
 * never a part floating with nothing behind it.
 */
export function Art({ name, scene, className, style, ...image }: ArtProps) {
  const { rasterWidth } = useJourney()
  const mayFetch = useMayFetch(scene)
  const images = imageCount(name)
  useExpectedImages(scene, images)
  const count = useRef(0)
  const [shown, setShown] = useState(false)
  const src = rasterWidth && mayFetch ? groundArt(name, rasterWidth) : undefined

  // Should a piece be very slow, show what has come rather than hold the whole drawing back.
  useEffect(() => {
    if (!src || shown) return
    const timer = window.setTimeout(() => setShown(true), 8000)
    return () => window.clearTimeout(timer)
  }, [src, shown])

  if (!src) return null
  const onArrive = () => {
    count.current++
    if (scene !== undefined) imageArrived(scene)
    if (count.current >= images) setShown(true)
  }
  const classes = `art ${className ?? ''}${shown ? '' : ' art-waiting'}`
  const picture = { src, alt: '', draggable: false, decoding: 'async' as const, onArrive, ...image }
  const moves = movesOf(name)

  if (!moves) return <MotionPicture {...picture} className={classes} style={style} />
  return (
    <motion.div className={`${classes} has-moves`} style={style}>
      <Picture {...picture} className="art-fill" />
      {moves.parts.map((part) => (
        <Part key={part.name} part={part} within={moves.size} rasterWidth={rasterWidth} image={image} onArrive={onArrive} />
      ))}
    </motion.div>
  )
}

const MotionPicture = motion.create(Picture)
