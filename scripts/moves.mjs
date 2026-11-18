// Moving parts of a drawing, for scripts/build-art.mjs.
//
// Any <g> in a drawing can be marked as moving:
//
//   <g data-move="sway" data-origin="bottom" data-amp="4" data-dur="5">…</g>
//
// The build cuts every marked group out of its layer into a small drawing of its own
// (`<layer>.m<n>.svg`, cropped to the group), and lists them in `<drawing>.moves.json`. The page
// lays each one back exactly where it was drawn and moves it with a CSS animation (see
// src/styles/moves.css), so nothing is ever redrawn while it moves. Marked groups can nest: a
// cow that wanders can have a head that grazes and a tail that swishes.
//
// Attributes (all coordinates are in the drawing's own units, as seen, whatever transforms the
// group sits inside):
//   data-move    one of the names in MOVES below
//   data-origin  the point it turns or scales about: "x y", or a keyword (center, top, bottom,
//                left, right, top-left, top-right, bottom-left, bottom-right) on its own box.
//                Defaults to MOVES[move].origin.
//   data-amp     how far: degrees for turns, drawing units for travel, a fraction for scaling
//   data-path    "dx dy", in drawing units, for moves that travel (drift, pace, fly, jump, kite, rise)
//   data-dur     seconds per cycle
//   data-delay   seconds; by default every part starts at a different point of its cycle
//   data-pad     extra room around the group's shapes, in units (default 8), for wide strokes
//   data-box     "x y w h": the crop, if it must be set by hand instead of measured
import { existsSync } from 'node:fs'

import * as cheerio from 'cheerio'

/** Every move, with its defaults. Keep in step with src/styles/moves.css. */
export const MOVES = {
  sway: { origin: 'bottom', amp: 3, dur: 5 }, // trees, palms, flowers, reeds: rock gently about the root
  swing: { origin: 'top', amp: 8, dur: 2.8 }, // hanging things: lanterns, bells, swings, garlands
  swish: { origin: 'top', amp: 14, dur: 2.2 }, // tails: a quick flick, then rest
  nod: { origin: 'center', amp: 16, dur: 7 }, // a head that dips to graze or peck and comes back up
  flap: { origin: 'center', amp: 28, dur: 0.5 }, // wings, fans, a hand fan
  flutter: { origin: 'left', amp: 6, dur: 1.1 }, // flags, pennants, bunting, a dupatta end
  bob: { origin: 'center', amp: 3, dur: 3.2 }, // up and down on water or in the air
  rock: { origin: 'bottom', amp: 3, dur: 4.5 }, // boats and floats: tilt from side to side
  float: { origin: 'center', amp: 6, dur: 6 }, // balloons, lanterns, clouds: rise a little and tilt
  drift: { origin: 'center', amp: 0, dur: 24, path: [60, 0] }, // to `path` and back, slowly
  pace: { origin: 'center', amp: 0, dur: 30, path: [80, 0] }, // to `path`, turn round, come back
  fly: { origin: 'center', amp: 0, dur: 16, path: [600, -40] }, // across by `path`, fading in and out, again and again
  jump: { origin: 'center', amp: 40, dur: 7, path: [40, 0] }, // a fish leaping: drawn at the top of its arc
  spin: { origin: 'center', amp: 1, dur: 14 }, // wheels, ferris wheel, disco ball, pinwheel (amp -1: backwards)
  pulse: { origin: 'center', amp: 0.08, dur: 1.8 }, // swell and settle: glows, hearts, lamps
  breathe: { origin: 'bottom', amp: 0.025, dur: 4 }, // a sleeping or resting animal
  flicker: { origin: 'bottom', amp: 0, dur: 1 }, // flames: diyas, the havan, torches
  twinkle: { origin: 'center', amp: 0, dur: 2.6 }, // stars, sparkles, bulbs
  sparkle: { origin: 'center', amp: 0, dur: 1.6 }, // star-shaped glints that turn as they twinkle
  blink: { origin: 'center', amp: 0, dur: 6 }, // a neon tube or bulb that stutters now and then
  ripple: { origin: 'center', amp: 0, dur: 3.5 }, // a ring on water that spreads and fades
  shimmer: { origin: 'center', amp: 4, dur: 3 }, // light on water sliding to and fro
  wave: { origin: 'bottom', amp: 22, dur: 2.4 }, // a waving hand or arm
  dance: { origin: 'bottom', amp: 4, dur: 1.3 }, // a dancer: bounce on the beat and lean side to side
  bounce: { origin: 'bottom', amp: 20, dur: 1.4 }, // a ball, a jumping child
  kite: { origin: 'center', amp: 10, dur: 7, path: [14, -8] }, // a kite riding the wind in a loop
  splash: { origin: 'bottom', amp: 0, dur: 0.9 }, // fountain jets, a waterfall's spray
  rise: { origin: 'bottom', amp: 0, dur: 4.5, path: [0, -30] }, // smoke, steam, incense, bubbles
  spray: { origin: 'bottom', amp: 0, dur: 1.2 }, // a firework fountain (anar) or a sparkler's sparks
  pop: { origin: 'center', amp: 0, dur: 3.6 }, // a firework burst: blooms, hangs, fades
}

const KEYWORDS = {
  center: [0.5, 0.5],
  top: [0.5, 0],
  bottom: [0.5, 1],
  left: [0, 0.5],
  right: [1, 0.5],
  'top-left': [0, 0],
  'top-right': [1, 0],
  'bottom-left': [0, 1],
  'bottom-right': [1, 1],
}

const DEFAULT_PAD = 8

/** Elements whose content is only drawn where it is referenced, so it cannot move on its own. */
const DEFINITIONS = 'defs, symbol, pattern, clipPath, mask, marker, linearGradient, radialGradient, filter'

const numbers = (value) =>
  String(value ?? '')
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)

const round = (value, places = 2) => Math.round(value * 10 ** places) / 10 ** places

export function findChrome() {
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

export const hasMoves = (source) => /\bdata-move=/.test(source)

/** Gives every moving group a number (data-mid), so its pieces can be matched up after the split. */
export function numberMoves(source) {
  const $ = cheerio.load(source, { xml: true })
  $('g[data-move]').each((index, element) => {
    $(element).attr('data-mid', String(index))
  })
  return $.xml()
}

let browser = null

async function page() {
  if (!browser) {
    const chrome = findChrome()
    if (!chrome) return null
    const { default: puppeteer } = await import('puppeteer-core')
    browser = await puppeteer.launch({ executablePath: chrome, args: ['--no-sandbox', '--disable-gpu'] })
  }
  const pages = await browser.pages()
  return pages[0] ?? (await browser.newPage())
}

export async function closeBrowser() {
  await browser?.close()
  browser = null
}

/**
 * The box of every numbered moving group, in drawing units, measured by drawing the whole thing
 * in Chrome at one pixel per unit. Null when there is no Chrome to measure with.
 */
export async function measureMoves(numbered) {
  const tab = await page()
  if (!tab) return null
  const $ = cheerio.load(numbered, { xml: true })
  const [x, y, width, height] = numbers($('svg').first().attr('viewBox'))
  await tab.setViewport({ width: Math.ceil(width), height: Math.ceil(height) })
  const sized = numbered.replace(/<svg\b/, `<svg width="${width}" height="${height}" style="display:block"`)
  await tab.setContent(`<!doctype html><body style="margin:0">${sized}</body>`)
  const rects = await tab.evaluate(() => {
    const svg = document.querySelector('svg').getBoundingClientRect()
    return [...document.querySelectorAll('[data-mid]')].map((element) => {
      const rect = element.getBoundingClientRect()
      return [element.getAttribute('data-mid'), rect.x - svg.x, rect.y - svg.y, rect.width, rect.height]
    })
  })
  const boxes = new Map()
  for (const [mid, left, top, w, h] of rects) boxes.set(mid, [left + x, top + y, w, h])
  return boxes
}

/** Attributes of an element as markup, without the ones that only mean something to this build. */
function attributes(element, { keepId = true } = {}) {
  return Object.entries(element.attribs ?? {})
    .filter(([name]) => !name.startsWith('data-') && (keepId || name !== 'id'))
    .map(([name, value]) => ` ${name}="${String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`)
    .join('')
}

function referencedIds(markup) {
  const ids = new Set()
  for (const match of markup.matchAll(/(?:href="#|url\(#)([^")]+)/g)) ids.add(match[1])
  return ids
}

function warn(drawing, element, message) {
  const id = element.attribs?.id ? ` (#${element.attribs.id})` : ''
  console.warn(`  ${drawing}: moving group ${element.attribs['data-mid']}${id}: ${message}`)
}

/**
 * Cuts the moving groups out of one prepared layer (or a single-layer drawing). Returns the layer
 * without them, the part drawings to write, and the list of parts for the page.
 */
export function splitMoves(markup, base, boxes) {
  const $ = cheerio.load(markup, { xml: true })
  const svg = $('svg').first()
  const root = svg.get(0)
  const viewBox = numbers(svg.attr('viewBox'))
  const rootMarkup = attributes({
    attribs: Object.fromEntries(
      Object.entries(root.attribs).filter(([name]) => !['viewBox', 'width', 'height', 'id'].includes(name)),
    ),
  })
  const files = []
  let count = 0

  const closestMove = (element) => $(element).parents('g[data-move]').get(0)
  const movable = (element) => $(element).parents(DEFINITIONS).length === 0 && !$(element).is(DEFINITIONS)

  /** Copies of everything `markup` refers to by id (and what those refer to), except what `has` already. */
  function borrow(markup, has) {
    const borrowed = []
    const seen = new Set()
    let pending = [...referencedIds(markup)]
    while (pending.length) {
      const next = []
      for (const id of pending) {
        if (seen.has(id)) continue
        seen.add(id)
        const target = $(`[id="${id}"]`).first()
        if (target.length === 0 || has(target.get(0))) continue
        const copy = $.xml(target)
        borrowed.push(copy)
        next.push(...referencedIds(copy))
      }
      pending = next
    }
    return borrowed
  }

  function part(element) {
    const move = element.attribs['data-move']
    const settings = MOVES[move]
    if (!settings) {
      warn(base, element, `"${move}" is not a move (see scripts/moves.mjs); drawn still`)
      return null
    }
    const pad = numbers(element.attribs['data-pad'])[0] ?? DEFAULT_PAD
    const given = numbers(element.attribs['data-box'])
    const measured = boxes.get(element.attribs['data-mid'])
    let box
    if (given.length === 4) box = given
    else if (measured && measured[2] > 0 && measured[3] > 0)
      box = [measured[0] - pad, measured[1] - pad, measured[2] + 2 * pad, measured[3] + 2 * pad]
    else {
      warn(base, element, 'has nothing in it to draw; drawn still')
      return null
    }
    box = box.map((value) => round(value, 1))

    const originAttribute = (element.attribs['data-origin'] ?? settings.origin).trim()
    const point = numbers(originAttribute)
    let origin = point
    if (point.length !== 2 || point.some(Number.isNaN)) {
      const keyword = KEYWORDS[originAttribute]
      if (!keyword) warn(base, element, `origin "${originAttribute}" not understood; using its centre`)
      const [fx, fy] = keyword ?? KEYWORDS.center
      origin = [box[0] + fx * box[2], box[1] + fy * box[3]]
    }

    const name = `${base}.m${count++}`
    const children = $(element)
      .find('g[data-move]')
      .filter((_, child) => closestMove(child) === element)
      .toArray()
      .map(part)
      .filter(Boolean)

    // The group as drawn, inside a bare copy of every group around it (for their transforms and
    // inherited colours), with whatever it borrows from elsewhere in the drawing.
    const copy = $(element).clone()
    copy.find('g[data-move]').remove()
    let body = `<g${attributes(element)}>${copy.html()}</g>`
    // Nearest first, so each wraps what is already there.
    for (const ancestor of $(element).parentsUntil('svg').toArray()) {
      body = `<${ancestor.name}${attributes(ancestor, { keepId: false })}>${body}</${ancestor.name}>`
    }

    const ownedBy = (target) => $(target).closest('g[data-move]').get(0) === element
    const borrowed = borrow(body, ownedBy)
    const drawing = `<svg${rootMarkup} viewBox="${box.join(' ')}"><defs>${borrowed.join('')}</defs>${body}</svg>`
    files.push([`${name}.svg`, drawing])

    const number = (attribute, fallback) => numbers(element.attribs[attribute])[0] ?? fallback
    const dur = number('data-dur', settings.dur)
    const path = numbers(element.attribs['data-path'])
    const entry = {
      mid: element.attribs['data-mid'],
      name,
      move,
      box,
      origin: origin.map((value) => round(value, 1)),
      dur,
      amp: number('data-amp', settings.amp),
      // Golden-ratio steps spread the parts of one drawing evenly round their cycles.
      delay: round(number('data-delay', -(((count * 0.618034) % 1) * dur))),
    }
    if (path.length === 2 || settings.path) entry.path = path.length === 2 ? path : settings.path
    if (children.length) entry.children = children
    return entry
  }

  const top = $('g[data-move]')
    .filter((_, element) => movable(element) && !closestMove(element))
    .toArray()
  const parts = top.map(part).filter(Boolean)
  const cut = top.filter((element) => parts.some((entry) => entry.mid === element.attribs['data-mid']))
  // The still drawing may reuse a shape defined inside a group that is about to leave it.
  for (const element of cut) $(element).attr('data-cut', '1')
  const still = svg.clone()
  still.find('[data-cut]').remove()
  const inCut = (target) => $(target).closest('[data-cut]').length > 0
  const rescued = borrow($.xml(still), (target) => !inCut(target))
  for (const element of cut) $(element).remove()
  if (rescued.length) svg.prepend(`<defs>${rescued.join('')}</defs>`)
  const forget = (list) => {
    for (const entry of list) {
      delete entry.mid
      if (entry.children) forget(entry.children)
    }
  }
  forget(parts)
  // Anything left marked (inside definitions) is drawn still; drop the marks.
  $('[data-mid]').removeAttr('data-mid')
  $('[data-move]').removeAttr('data-move')

  return { layer: $.xml(svg), files, entry: parts.length ? { size: viewBox, parts } : null }
}

/** How much of the drawing moves, for the build log. */
export function coverage(entry) {
  const [, , width, height] = entry.size
  let count = 0
  let area = 0
  const walk = (parts, top) => {
    for (const part of parts) {
      count++
      if (top) area += part.box[2] * part.box[3]
      if (part.children) walk(part.children, false)
    }
  }
  walk(entry.parts, true)
  return { count, share: area / (width * height) }
}
