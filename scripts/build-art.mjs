#!/usr/bin/env node
// Prepares the hand-drawn SVGs in src/art/ for the site.
//
// Paintings contain two top-level groups, <g id="back"> and <g id="front">. Each group is written
// out as its own optimised file so the page can move the layers independently as <img> elements,
// which keeps parallax on the compositor instead of re-rasterising a large inline SVG every frame.
// Everything else (ornaments, the bus, the joins) is optimised and copied as a single file.
//
// Groups marked `data-move` are cut out into drawings of their own and animated by the page; see
// scripts/moves.mjs.
//
// With --raster (as `npm run build` runs it) the ground artwork is then also painted into bitmaps
// for the published site: see scripts/raster-art.mjs.
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { optimize } from 'svgo'

import { closeBrowser, coverage, hasMoves, measureMoves, numberMoves, splitMoves } from './moves.mjs'
import { rasterArt } from './raster-art.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = join(root, 'src/art')
const outDir = join(root, 'src/art/build')
const LAYERS = ['back', 'front']

const svgoConfig = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: 'preset-default',
      // removeUselessStrokeAndFill drops `stroke="none"` from shapes inside a <symbol> or <defs>,
      // which then take on the stroke of whatever uses them.
      params: { overrides: { mergePaths: false, convertShapeToPath: false, removeUselessStrokeAndFill: false } },
    },
  ],
}

function referencedIds(markup) {
  const ids = new Set()
  for (const match of markup.matchAll(/(?:href="#|url\(#)([^")]+)/g)) ids.add(match[1])
  return ids
}

function extractLayer(source, keep) {
  const $ = cheerio.load(source, { xml: true })
  const svg = $('svg').first()
  const dropped = LAYERS.filter((id) => id !== keep).map((id) => svg.children(`g#${id}`))

  // A shape defined inside the other layer may still be reused here, so rescue it into <defs>.
  let defs = svg.children('defs').first()
  let moved = true
  while (moved) {
    moved = false
    for (const group of dropped) group.attr('data-drop', '1')
    const keptMarkup = $.xml(svg.children().not('[data-drop]'))
    for (const id of referencedIds(keptMarkup)) {
      for (const group of dropped) {
        const target = group.find(`[id="${id}"]`).first()
        if (target.length === 0) continue
        if (defs.length === 0) {
          svg.prepend('<defs/>')
          defs = svg.children('defs').first()
        }
        defs.append(target)
        moved = true
      }
    }
  }
  for (const group of dropped) group.remove()
  return $.xml(svg)
}

function optimise(markup, name) {
  try {
    return optimize(markup, { ...svgoConfig, path: name }).data
  } catch (error) {
    console.warn(`  could not optimise ${name}, using it as drawn: ${error.message}`)
    return markup
  }
}

// `node scripts/build-art.mjs` rebuilds everything; `node scripts/build-art.mjs pichwai bus` only
// those drawings, leaving the rest of ./build alone (safe while someone else rebuilds another one).
const args = process.argv.slice(2)
const raster = args.includes('--raster')
const only = args.filter((arg) => !arg.startsWith('--')).map((name) => name.replace(/\.svg$/, ''))

await mkdir(outDir, { recursive: true })

const sources = (await readdir(sourceDir)).filter((file) => file.endsWith('.svg')).sort()
const files = only.length ? sources.filter((file) => only.includes(file.replace(/\.svg$/, ''))) : sources
for (const name of only) {
  if (!sources.includes(`${name}.svg`)) console.warn(`no such drawing: src/art/${name}.svg`)
}

/** Writes a file unless it already holds exactly this, so an unchanged drawing keeps its date and its bitmaps. */
async function put(outName, data, log = true) {
  written.add(outName)
  const current = await readFile(join(outDir, outName), 'utf8').catch(() => null)
  if (current === data) return
  // Written beside the target and renamed into place, so the dev server never reads half a file.
  const temp = join(outDir, `.${outName}.${process.pid}.tmp`)
  await writeFile(temp, data)
  await rename(temp, join(outDir, outName))
  if (log) console.log(`${outName.padEnd(34)} ${(data.length / 1024).toFixed(1)} KB`)
}

const written = new Set()
for (const file of files) {
  const name = file.replace(/\.svg$/, '')
  let source = await readFile(join(sourceDir, file), 'utf8')
  const $ = cheerio.load(source, { xml: true })
  const layered = LAYERS.every((id) => $('svg').first().children(`g#${id}`).length === 1)

  // Moving parts are measured on the whole drawing, then cut out of whichever layer holds them.
  let boxes = null
  if (hasMoves(source)) {
    source = numberMoves(source)
    boxes = await measureMoves(source)
    if (!boxes) console.warn(`  ${name}: no Chrome to measure its moving parts (set CHROME_PATH); drawn still`)
  }

  const outputs = layered
    ? LAYERS.map((id) => [`${name}.${id}`, extractLayer(source, id)])
    : [[name, source]]

  const moves = {}
  for (const [outBase, markup] of outputs) {
    let layer = markup
    if (boxes) {
      const split = splitMoves(markup, outBase, boxes)
      layer = split.layer
      for (const [partName, part] of split.files) await put(partName, optimise(part, partName), false)
      if (split.entry) {
        moves[outBase] = split.entry
        const { count, share } = coverage(split.entry)
        console.log(`${`${outBase} moving`.padEnd(34)} ${count} parts, ${Math.round(share * 100)}% of its area`)
      }
    }
    await put(`${outBase}.svg`, optimise(layer, `${outBase}.svg`))
  }
  if (Object.keys(moves).length) await put(`${name}.moves.json`, `${JSON.stringify(moves)}\n`, false)

  // Parts and lists left over from an earlier version of this drawing.
  const own = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\.(back|front))?(\\.m\\d+\\.svg|\\.moves\\.json)$`)
  for (const leftover of await readdir(outDir)) {
    if (own.test(leftover) && !written.has(leftover)) await rm(join(outDir, leftover))
  }
}
await closeBrowser()

// A full rebuild also clears out files whose drawing has been deleted or renamed.
if (only.length === 0) {
  for (const file of await readdir(outDir)) {
    if ((file.endsWith('.svg') || file.endsWith('.json')) && !written.has(file)) await rm(join(outDir, file))
  }
}

if (raster) {
  // The site works without the bitmaps (it draws the SVGs instead), so a failure here must not
  // stop it being built.
  try {
    await rasterArt(only)
  } catch (error) {
    console.warn(`raster: failed, the site will draw the SVGs instead: ${error.message}`)
  }
}
