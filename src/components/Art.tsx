import { motion, type MotionStyle } from 'motion/react'
import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from 'react'

import { art, groundArt, movesOf, sheetArt, type MovingPart } from '@/art'
import { useJourney } from '@/journey/context'
import { imageArrived, useExpectedImages, useMayFetch } from '@/journey/loading'

const percent = (share: number) => `${share * 100}%`

interface ImageProps {
  fetchPriority?: 'high' | 'low' | 'auto'
  loading?: 'lazy' | 'eager'
}

/** How many images a drawing is shown with when it has no sheet: itself, and each moving part that has artwork of its own. */
function imageCount(name: string): number {
  const count = (parts: MovingPart[] = []): number =>
    parts.reduce((sum, part) => sum + (art(part.name) ? 1 : 0) + count(part.children), 0)
  return 1 + count(movesOf(name)?.parts)
}

type PictureProps = Omit<ComponentProps<'img'>, 'src'> & { src: string; onArrive: (loaded?: string) => void }

/**
 * An image that asks again, a little later, if it fails to arrive. The host can turn one away now
 * and then (just after a deploy, say); without this the piece it shows would be missing from the
 * picture until the page was reloaded. Calls `onArrive` once: with the address it finally came
 * from, or with nothing when it has failed for good.
 */
function Picture({ src, onArrive, ...props }: PictureProps) {
  const [attempt, setAttempt] = useState(0)
  const done = useRef(false)
  const current = attempt ? `${src}?retry=${attempt}` : src
  const arrive = (loaded?: string) => {
    if (done.current) return
    done.current = true
    onArrive(loaded)
  }
  return (
    <img
      {...props}
      src={current}
      onLoad={() => arrive(current)}
      onError={() => {
        if (attempt < 3) window.setTimeout(() => setAttempt(attempt + 1), 1500 * (attempt + 1))
        else arrive()
      }}
    />
  )
}

/** The one image all of a drawing's moving parts are painted on: its size in drawing units, and its address once it is in. */
interface Sheet {
  size: [width: number, height: number]
  src?: string
}

interface PartProps {
  part: MovingPart
  within: MovingPart['box']
  rasterWidth: number
  sheet?: Sheet
  image: ImageProps
  onArrive: () => void
}

/**
 * One moving part, laid exactly where it was drawn inside `within` (its drawing's or its parent
 * part's box) and animated by its `move-<name>` class. Travel is set as a share of the part's own
 * size, so it is right at every size of screen. With a sheet it shows its own patch of that,
 * sized and placed in shares too; without one, its own image.
 */
function Part({ part, within, rasterWidth, sheet, image, onArrive }: PartProps) {
  const [x, y, width, height] = part.box
  const [left, top, outerWidth, outerHeight] = within
  const [dx, dy] = part.path ?? [0, 0]
  const src = !sheet && art(part.name) ? groundArt(part.name, rasterWidth) : undefined
  const patch =
    sheet?.src && part.at
      ? {
          backgroundImage: `url("${sheet.src}")`,
          backgroundSize: `${percent(sheet.size[0] / width)} ${percent(sheet.size[1] / height)}`,
          backgroundPosition: `${percent(part.at[0] / (sheet.size[0] - width))} ${percent(part.at[1] / (sheet.size[1] - height))}`,
        }
      : undefined
  const style = {
    ...patch,
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
        <Part
          key={child.name}
          part={child}
          within={part.box}
          rasterWidth={rasterWidth}
          sheet={sheet}
          image={image}
          onArrive={onArrive}
        />
      ))}
    </div>
  )
}

interface ArtProps extends ImageProps {
  /** A prepared drawing on the ground: a frieze layer such as `pichwai.front`, a join, the bus. */
  name: string
  /** The scene (index into `scenes`) whose artwork this is, fetched in that scene's turn (journey/loading.ts). */
  scene?: number
  /** Called once the drawing is on show. */
  onShown?: () => void
  className?: string
  style?: MotionStyle
}

/**
 * A piece of ground artwork with its moving parts. A drawing with none is a single image; one with
 * some is that image with the parts laid over it, each painted from the drawing's sheet (or, in
 * development, its own drawing), so the browser only ever moves pictures it has already painted.
 * Nothing is fetched until the ground has been measured and the scene's turn has come, and nothing
 * shows until every piece is in: then it fades in whole, never a part floating with nothing behind it.
 */
export function Art({ name, scene, onShown, className, style, ...image }: ArtProps) {
  const { rasterWidth } = useJourney()
  const mayFetch = useMayFetch(scene)
  const moves = movesOf(name)
  const sheetSrc = rasterWidth && moves?.sheet ? sheetArt(name, rasterWidth) : undefined
  const images = sheetSrc ? 2 : imageCount(name)
  useExpectedImages(scene, images)
  const count = useRef(0)
  const [shown, setShown] = useState(false)
  const [sheetIn, setSheetIn] = useState<string>()
  const src = rasterWidth && mayFetch ? groundArt(name, rasterWidth) : undefined

  // Should a piece be very slow, show what has come rather than hold the whole drawing back.
  useEffect(() => {
    if (!src || shown) return
    const timer = window.setTimeout(() => setShown(true), 8000)
    return () => window.clearTimeout(timer)
  }, [src, shown])

  useEffect(() => {
    if (shown) onShown?.()
  }, [shown, onShown])

  if (!src) return null
  const onArrive = () => {
    count.current++
    if (scene !== undefined) imageArrived(scene)
    if (count.current >= images) setShown(true)
  }
  const classes = `art ${className ?? ''}${shown ? '' : ' art-waiting'}`
  const picture = { src, alt: '', draggable: false, decoding: 'async' as const, onArrive, ...image }

  if (!moves) return <MotionPicture {...picture} className={classes} style={style} />
  const sheet = sheetSrc && moves.sheet ? { size: moves.sheet, src: sheetIn } : undefined
  return (
    <motion.div className={`${classes} has-moves`} style={style}>
      <Picture {...picture} className="art-fill" />
      {sheetSrc && (
        <Picture
          {...picture}
          key={sheetSrc}
          src={sheetSrc}
          aria-hidden="true"
          className="art-sheet"
          onArrive={(loaded) => {
            if (loaded) setSheetIn(loaded)
            onArrive()
          }}
        />
      )}
      {moves.parts.map((part) => (
        <Part
          key={part.name}
          part={part}
          within={moves.size}
          rasterWidth={rasterWidth}
          sheet={sheet}
          image={image}
          onArrive={onArrive}
        />
      ))}
    </motion.div>
  )
}

const MotionPicture = motion.create(Picture)
