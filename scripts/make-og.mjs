// Renders the link-preview image (public/og.jpg) from the entrance painting.
// usage: start the dev server, then `node scripts/make-og.mjs [url]`
import puppeteer from 'puppeteer-core'

const url = process.argv[2] ?? 'http://localhost:4826/'
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)
await page.addStyleTag({
  content: '.hud, .museum-nav, .scroll-hint, .countdown { display: none !important; }',
})
await new Promise((resolve) => setTimeout(resolve, 600))
await page.screenshot({
  path: new URL('../public/og.jpg', import.meta.url).pathname,
  type: 'jpeg',
  quality: 86,
})
await browser.close()
