import { useEffect, useState } from 'react'

import { useOpeningProgress } from '@/journey/loading'
import { openCurtain, showCurtainProgress } from '@/lib/curtain'

/** The longest the curtain stays down once the page is running, however slow the artwork is. */
const LONGEST = 12000

/**
 * Keeps the curtain from index.html down until the opening scene is whole: every piece of its
 * artwork in, and its lettering in its own fonts. Then the doors swing open onto it.
 */
export function Curtain() {
  const progress = useOpeningProgress()
  const [lettered, setLettered] = useState(false)

  useEffect(() => {
    let live = true
    // The fonts are asked for once the opening scene's text has been laid out, a frame from now.
    const frame = requestAnimationFrame(() => {
      void document.fonts.ready.then(() => live && setLettered(true))
    })
    const timer = window.setTimeout(openCurtain, LONGEST)
    return () => {
      live = false
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    showCurtainProgress(lettered ? progress : progress * 0.92)
    if (progress >= 1 && lettered) openCurtain()
  }, [progress, lettered])

  return null
}
