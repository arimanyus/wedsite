// Screenshots of the running dev server at chosen scroll positions (a development tool).
// usage: node scripts/shot.mjs <name> <width> <height> <dpr> <stop>[,<stop>...] [calm]
// output: $SHOT_DIR/<name>-<stop>.png (default /tmp/shots). `calm` emulates prefers-reduced-motion.
// stop: a number = journey t (screen heights), "guide", "guide+<px>", "end"
import puppeteer from 'puppeteer-core'

const [name, w, h, dpr, stops, extra] = process.argv.slice(2)
const url = process.env.URL || 'http://localhost:4826/'
const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-prefers-reduced-motion=0'],
})
const page = await browser.newPage()
const mobile = Number(w) < 700
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: Number(dpr), isMobile: mobile, hasTouch: mobile })
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: extra === 'calm' ? 'reduce' : 'no-preference' }])
page.on('console', (m) => { if (m.type() === 'error') console.log('console error:', m.text()) })
page.on('pageerror', (e) => console.log('pageerror:', e.message))
await page.goto(url, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)
for (const stop of stops.split(',')) {
  await page.evaluate((stop) => {
    const track = document.querySelector('.journey')
    const top = track.getBoundingClientRect().top + window.scrollY
    const length = track.offsetHeight - window.innerHeight
    const total = (track.offsetHeight / window.innerHeight) - 1
    if (stop === 'end') window.scrollTo(0, document.documentElement.scrollHeight)
    else if (stop.startsWith('guide')) {
      const g = document.querySelector('#guide')
      window.scrollTo(0, g.getBoundingClientRect().top + window.scrollY + Number(stop.split('+')[1] || 0))
    } else window.scrollTo(0, top + (Number(stop) / total) * length)
  }, stop)
  await new Promise((r) => setTimeout(r, 900))
  const file = `${process.env.SHOT_DIR || '/tmp/shots'}/${name}-${stop.replace('+', '_')}.png`
  await page.screenshot({ path: file })
  console.log(file)
}
await browser.close()
