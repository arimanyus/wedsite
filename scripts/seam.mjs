// Screenshot of the ground where two friezes meet, taken from the running dev server with the
// seam in the middle of the screen (a development tool for drawing the joins).
// usage: node scripts/seam.mjs <seam> [out.png] [wide|phone]
//   seam: 1 = between the 1st and 2nd scene ... 7 = between the 7th and 8th
//   wide (default): a 1600 x 800 window, where one whole frieze-width of ground is in view
//   phone: a 390 x 844 phone
// The wide picture is cropped to the ground and the sky just above it; both are saved at 2x.
import puppeteer from 'puppeteer-core'

const [seamArg, out = '/tmp/seam.png', mode = 'wide'] = process.argv.slice(2)
const seam = Number(seamArg)
const url = process.env.URL || 'http://localhost:4826/'
const phone = mode === 'phone'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport(
  phone
    ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { width: 1600, height: 800, deviceScaleFactor: 2 },
)
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])
page.on('pageerror', (error) => console.log('pageerror:', error.message))
await page.goto(url, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)
await page.addStyleTag({ content: '.hud, .scene-nav, .text-plane { visibility: hidden !important; }' })

// Scroll until the seam's box is centred on screen: bisect on the scroll position.
const offset = () =>
  page.evaluate((seam) => {
    const box = document.querySelector(`.join-box[data-seam="${seam}"]`)
    if (!box || getComputedStyle(box).display === 'none') return null
    const rect = box.getBoundingClientRect()
    const ground = document.querySelector('.ground').getBoundingClientRect()
    return rect.left + rect.width / 2 - (ground.left + ground.width / 2)
  }, seam)
const scrollTo = async (y) => {
  await page.evaluate((y) => window.scrollTo(0, y), y)
  await new Promise((resolve) => setTimeout(resolve, 60))
}
const height = await page.evaluate(() => document.querySelector('.journey').offsetHeight)
let low = 0
let high = height
for (let step = 0; step < 24; step++) {
  const middle = (low + high) / 2
  await scrollTo(middle)
  const off = await offset()
  // Not drawn yet means the seam is still far away on one side: find out which from the scene order.
  const before =
    off === null
      ? await page.evaluate(
          (seam) => {
            const boxes = [...document.querySelectorAll('.join-box')].filter((box) => getComputedStyle(box).display !== 'none')
            if (boxes.length === 0) return null
            return Math.max(...boxes.map((box) => Number(box.dataset.seam))) < seam
          },
          seam,
        )
      : off > 0
  if (before === null) {
    // No seam is drawn here (the very start or end): step towards the middle of the journey.
    if (middle < height / 2) low = middle
    else high = middle
  } else if (before) low = middle
  else high = middle
}
await new Promise((resolve) => setTimeout(resolve, 700))
const ground = await page.evaluate(() => {
  const rect = document.querySelector('.ground').getBoundingClientRect()
  return { top: rect.top + window.scrollY, height: rect.height, width: window.innerWidth }
})
const lift = ground.height * 0.25
// The clip is measured from the top of the page, and only what is on screen now is captured (the
// stage is pinned). A phone-sized window is saved whole.
await page.screenshot(
  phone
    ? { path: out }
    : {
        path: out,
        clip: { x: 0, y: ground.top - lift, width: ground.width, height: ground.height + lift },
        captureBeyondViewport: false,
      },
)
console.log(out)
await browser.close()
