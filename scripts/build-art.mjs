#!/usr/bin/env node
// Prepares the hand-drawn SVGs in src/art/ for the site.
//
// Paintings contain two top-level groups, <g id="back"> and <g id="front">. Each group is written
// out as its own optimised file so the page can move the layers independently as <img> elements,
// which keeps parallax on the compositor instead of re-rasterising a large inline SVG every frame.
// Everything else (ornaments, the bus) is optimised and copied as a single file.
import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { optimize } from 'svgo'

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
      params: { overrides: { mergePaths: false, convertShapeToPath: false } },
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
const only = process.argv.slice(2).map((name) => name.replace(/\.svg$/, ''))

await mkdir(outDir, { recursive: true })

const sources = (await readdir(sourceDir)).filter((file) => file.endsWith('.svg')).sort()
const files = only.length ? sources.filter((file) => only.includes(file.replace(/\.svg$/, ''))) : sources
for (const name of only) {
  if (!sources.includes(`${name}.svg`)) console.warn(`no such drawing: src/art/${name}.svg`)
}

const written = new Set()
for (const file of files) {
  const name = file.replace(/\.svg$/, '')
  const source = await readFile(join(sourceDir, file), 'utf8')
  const $ = cheerio.load(source, { xml: true })
  const layered = LAYERS.every((id) => $('svg').first().children(`g#${id}`).length === 1)

  const outputs = layered
    ? LAYERS.map((id) => [`${name}.${id}.svg`, extractLayer(source, id)])
    : [[`${name}.svg`, source]]

  for (const [outName, markup] of outputs) {
    const data = optimise(markup, outName)
    // Written beside the target and renamed into place, so the dev server never reads half a file.
    const temp = join(outDir, `.${outName}.${process.pid}.tmp`)
    await writeFile(temp, data)
    await rename(temp, join(outDir, outName))
    written.add(outName)
    console.log(`${outName.padEnd(34)} ${(data.length / 1024).toFixed(1)} KB`)
  }
}

// A full rebuild also clears out files whose drawing has been deleted or renamed.
if (only.length === 0) {
  for (const file of await readdir(outDir)) {
    if (file.endsWith('.svg') && !written.has(file)) await rm(join(outDir, file))
  }
}
