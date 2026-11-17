# Mansi weds Vivek

The wedding website for Mansi and Vivek, 28 November to 3 December 2026.
Home: [mansiwedsvivek.xyz](https://mansiwedsvivek.xyz)

The site is one continuous illustrated journey. As you scroll, the view travels along a single painted landscape, and each celebration has its own stretch of it, drawn in a different art style:

| Celebration | Date | Drawn as |
| --- | --- | --- |
| Welcome | | Pichwai |
| Tilak Ceremony, Food & Blessings | Sat 28 Nov | Mughal miniature |
| Ganesh Pujan | Sun 29 Nov | Madhubani |
| Matrika Pujan | Mon 30 Nov | Art Nouveau |
| Baraat Prasthan (Indore to Nanded by bus) | Tue 1 Dec | Truck art |
| Pool Party Carnival | Wed 2 Dec | Pop art |
| Sangeet | Wed 2 Dec | Neon retro-future |
| Wedding Ceremony | Thu 3 Dec | Pichwai |

Along the way there is a live countdown to the ceremony, the full schedule, and for every event an Open in Google Maps button and an Add to Google Calendar button.

At the end of the journey the wedding's lotus pond runs on into the plan: the day-by-day schedule, the two venues with directions, the baraat's road from Indore to Nanded, and the bus heading home.

## Run it locally

Requires Node 22 or newer.

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:4826.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-checks and builds the static site into `dist/` |
| `npm run preview` | Serves the built site at http://localhost:4827 |
| `npm run lint` | Lints with oxlint |
| `npm run art` | Rebuilds the artwork layers (runs automatically before `dev` and `build`) |

## Deploying

The site is hosted on GitHub Pages at `mansiwedsvivek.xyz`. Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site and publishes `dist/`.

One-time setup in the GitHub repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**, with `mansiwedsvivek.xyz` as the custom domain. With the source left on "Deploy from a branch", GitHub also publishes the raw source files on every push; the workflow waits for that and deploys the built site after it, but the page can be blank for a few seconds in between.

`dist/` is plain static files, so it can go on any other static host (Vercel, Netlify, Cloudflare Pages) just as well.

## Changing the details

Everything a guest reads comes from one file, [`src/data/wedding.ts`](src/data/wedding.ts): names, events, dates, times, venues and notes. The countdown, the schedule, the map links and the calendar links all follow from it.

- **Map pins.** Each venue has a `mapsQuery` (the address, searched in Google Maps). To send guests to an exact pin instead, paste the Google Maps share link into that venue's `mapsLink`.
- **Calendar entries.** Events listed as "onwards" have no end time on the invitation, so `end` is an estimate that is only used for the length of the calendar entry.
- **Times** are written in India time and shown as India time wherever the guest is.

## How it is built

- The journey is a pinned stage with shared planes: the sky (one backdrop per scene; each new sky sweeps in from the right with its landscape, through a colour that sits between the two skies), the ground (every scene's frieze on one strip, overlapping its neighbours a little), decorations in front of the ground, and the text. `src/components/Journey.tsx` and `src/components/Planes.tsx` build it.
- `src/journey/scenes.ts` lists the scenes in order with their frieze and how long their text stays on screen. `src/journey/timeline.ts` turns the scroll position into everything that moves: where the camera is along the ground, which sky and text are showing, and where the baraat bus is. Its timing constants are at the top of the file.
- `src/scenes/` has one small component per scene. Each puts its pieces on the planes with `<Sky>`, `<Foreground>` and `<TextBlock>`.
- `src/index.css` imports the styles in order from `src/styles/`: `journey.css` for the stage, `event.css` for the typography every scene shares, one file per scene in `scenes/` (each lists which selectors set its backdrop, sky decorations, text block and decorations over the frieze), `guide.css` for the plan, `chrome.css` for the top bar and the scene dots (they take their colours from the scene on screen, through `--chrome-bg`, `--chrome-fg` and `--chrome-accent` in each scene's stylesheet), and `responsive.css` last.
- `src/components/Guide.tsx` and `src/components/guide/` are the schedule and directions section after the journey. Each event's card takes its colour and typeface from the list at the top of `src/styles/guide.css`.
- `node scripts/make-og.mjs` re-renders the link-preview image (`public/og.jpg`) from the first screen, with the dev server running.
- `src/art/*.svg` is the artwork, all hand-drawn SVG. Each frieze is 2400 x 600 with a `back` and a `front` group; `scripts/build-art.mjs` splits and optimises them into `src/art/build/` so the two layers can drift apart as you move.
- Guests who ask their device for reduced motion get a gentle dissolve in place between scenes instead of the camera travelling, and no bobbing bus or falling petals.
- `node scripts/shot.mjs <name> <width> <height> <dpr> <stops> [calm]` takes screenshots of the dev server at chosen points of the journey, for checking the motion.

## Stack

Vite, React, TypeScript, Tailwind CSS and Motion, with Fontsource typefaces and Lucide icons. No backend and no secrets.
