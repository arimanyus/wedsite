/** How long the doors of the curtain in index.html take to swing open, in ms (with a little to spare). */
const OPENING = 1400

/** Lights the curtain's petals: `share` (0 to 1) of the opening scene is in. */
export function showCurtainProgress(share: number) {
  document.getElementById('curtain')?.style.setProperty('--p', String(share))
}

/** Opens the curtain in index.html onto the page, then takes it away. Does nothing once it is open. */
export function openCurtain() {
  const curtain = document.getElementById('curtain')
  if (!curtain || curtain.classList.contains('open')) return
  curtain.classList.add('open')
  curtain.setAttribute('aria-hidden', 'true')
  document.documentElement.classList.remove('curtained')
  window.setTimeout(() => curtain.remove(), OPENING)
}
