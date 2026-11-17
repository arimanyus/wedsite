#!/usr/bin/env node
// Renders an SVG to a PNG with headless Chrome, so the art can be looked at while it is drawn.
//
//   node scripts/render-svg.mjs <in.svg> <out.png> [--width 1600] [--bg "#f6ecd9"] [--crop "x,y,w,h"]
//
// --crop takes a region in viewBox units and renders only that region, for close-up checks.
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

const args = process.argv.slice(2)
const positional = []
const options = { width: 1600, bg: '#ffffff', crop: null }
for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--width') options.width = Number(args[++i])
  else if (arg === '--bg') options.bg = args[++i]
  else if (arg === '--crop') options.crop = args[++i].split(',').map(Number)
  else positional.push(arg)
}

if (positional.length < 2) {
  console.error('usage: render-svg.mjs <in.svg> <out.png> [--width N] [--bg COLOR] [--crop x,y,w,h]')
  process.exit(1)
}

const [input, output] = positional.map((p) => resolve(p))
let svg = await readFile(input, 'utf8')

const viewBoxMatch = svg.match(/viewBox\s*=\s*"([^"]+)"/)
if (!viewBoxMatch) {
  console.error('The root <svg> needs a viewBox attribute.')
  process.exit(1)
}
let [, , vbW, vbH] = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number)
if (options.crop) {
  const [x, y, w, h] = options.crop
  svg = svg.replace(viewBoxMatch[0], `viewBox="${x} ${y} ${w} ${h}"`)
  vbW = w
  vbH = h
}

const width = Math.round(options.width)
const height = Math.round((width * vbH) / vbW)

const dir = await mkdtemp(join(tmpdir(), 'render-svg-'))
const svgPath = join(dir, 'art.svg')
const htmlPath = join(dir, 'index.html')
await writeFile(svgPath, svg)
await writeFile(
  htmlPath,
  `<!doctype html><html><body style="margin:0;background:${options.bg}"><img src="art.svg" style="display:block;width:${width}px;height:${height}px"></body></html>`,
)

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})
try {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' })
  await page.screenshot({ path: output, type: 'png' })
  console.log(`${output} (${width}x${height})`)
} finally {
  await browser.close()
  await rm(dir, { recursive: true, force: true })
}
