#!/usr/bin/env node
// Paints the prepared ground artwork (friezes, joins, the bus) into bitmaps, so phones do not have
// to draw thousands of vector shapes while the guest scrolls. Safari in particular draws an SVG
// image on the page's main thread, and a detailed frieze can hold a scroll up for most of a second.
//
// For every drawing in src/art/build/ that the ground uses, this writes
// src/art/build/<name>.<width>.webp once per width in WIDTHS, where <width> is the width in pixels
// of a whole frieze at that size (drawings narrower than a frieze are scaled to match). The page
// picks the size that suits the screen (src/art/index.ts) and falls back to the SVG when a bitmap
// is missing, so this step is optional: without Chrome it warns and leaves the SVGs to do the job.
//
// The painting is done by headless Chrome, the same engine most guests see the SVGs in, so the
// bitmaps match the drawings exactly. Set CHROME_PATH if Chrome is somewhere unusual.
import { existsSync } from 'node:fs'
import { readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src/art/build')

/** Widths of a whole frieze, in pixels. Keep in step with RASTER_WIDTHS in src/art/index.ts. */
export const WIDTHS = [1600, 2400, 3600]
/** A frieze is drawn 2400 units wide; everything on the ground shares that scale. */
const FRIEZE_UNITS = 2400
const QUALITY = 82

/** Ground artwork: everything in the build folder except the ornaments, which stay vector. */
const onGround = (file) => file.endsWith('.svg') && !file.startsWith('orn-')

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/local/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ]
  return candidates.find((path) => path && existsSync(path))
}

function viewBox(svg) {
  const match = svg.match(/<svg[^>]*\bviewBox="([^"]+)"/)
  if (!match) return null
  const [, , width, height] = match[1].trim().split(/[\s,]+/).map(Number)
  return width > 0 && height > 0 ? { width, height } : null
}

/** A drawing with nothing in it yet (a join waiting for its artwork) gets no bitmap. */
const isEmpty = (svg) => !/<(path|rect|circle|ellipse|line|poly|use|g|image)\b/.test(svg)

async function newer(file, than) {
  try {
    return (await stat(file)).mtimeMs >= than
  } catch {
    return false
  }
}

/**
 * Rasterises the named drawings (all of them when `names` is empty). Returns false when there is
 * no Chrome to paint with.
 */
export async function rasterArt(names = [], { force = false } = {}) {
  const chrome = findChrome()
  if (!chrome) {
    console.warn('raster: no Chrome found (set CHROME_PATH); the site will draw the SVGs instead')
    return false
  }
  const { default: puppeteer } = await import('puppeteer-core')

  const all = (await readdir(outDir)).filter(onGround).sort()
  const files = names.length
    ? all.filter((file) => names.includes(file.replace(/(\.(back|front))?\.svg$/, '')))
    : all

  const jobs = []
  const wanted = new Set()
  for (const file of files) {
    const path = join(outDir, file)
    const svg = await readFile(path, 'utf8')
    const box = viewBox(svg)
    if (!box || isEmpty(svg)) continue
    const { mtimeMs } = await stat(path)
    for (const width of WIDTHS) {
      const outName = file.replace(/\.svg$/, `.${width}.webp`)
      wanted.add(outName)
      if (!force && (await newer(join(outDir, outName), mtimeMs))) continue
      const scale = width / FRIEZE_UNITS
      jobs.push({ svg, outName, width: Math.round(box.width * scale), height: Math.round(box.height * scale) })
    }
  }

  // Bitmaps of drawings that are gone, or are empty again.
  for (const file of await readdir(outDir)) {
    if (!file.endsWith('.webp') || wanted.has(file)) continue
    const source = file.replace(/\.\d+\.webp$/, '.svg')
    if (names.length === 0 || files.includes(source)) await rm(join(outDir, file))
  }

  if (jobs.length === 0) return true

  const browser = await puppeteer.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb'],
  })
  try {
    // One page, one drawing at a time: Chrome only paints the page in front.
    const page = await browser.newPage()
    for (const job of jobs) {
      await page.setViewport({ width: job.width, height: job.height, deviceScaleFactor: 1 })
      const sized = job.svg.replace(/<svg\b/, `<svg width="${job.width}" height="${job.height}" style="display:block"`)
      await page.setContent(`<!doctype html><body style="margin:0;background:transparent">${sized}</body>`)
      const data = await page.screenshot({ type: 'webp', quality: QUALITY, omitBackground: true })
      const temp = join(outDir, `.${job.outName}.${process.pid}.tmp`)
      await writeFile(temp, data)
      await rename(temp, join(outDir, job.outName))
      console.log(`${job.outName.padEnd(34)} ${(data.length / 1024).toFixed(0).padStart(5)} KB`)
    }
  } finally {
    await browser.close()
  }
  return true
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const names = args.filter((arg) => !arg.startsWith('--')).map((name) => name.replace(/\.svg$/, ''))
  await rasterArt(names, { force: args.includes('--force') })
}
