# Mansi weds Vivek

The wedding website for Mansi and Vivek, 28 November to 3 December 2026.
Home: [mansiwedsvivek.xyz](https://mansiwedsvivek.xyz)

The site is a museum that travels through time. Each celebration hangs as a painting from a different art era, and you walk from one to the next as you scroll:

| Celebration | Date | Painted as |
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

After the last painting comes the visitor guide: the day-by-day schedule, the two venues with directions, the baraat's road from Indore to Nanded, and the bus heading home.

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

One-time setup in the GitHub repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**, with `mansiwedsvivek.xyz` as the custom domain. With the source left on "Deploy from a branch", GitHub also publishes the raw source files on every push; the workflow redeploys the built site straight afterwards, but the page is blank for about a minute in between.

`dist/` is plain static files, so it can go on any other static host (Vercel, Netlify, Cloudflare Pages) just as well.

## Changing the details

Everything a guest reads comes from one file, [`src/data/wedding.ts`](src/data/wedding.ts): names, events, dates, times, venues and notes. The countdown, the schedule, the map links and the calendar links all follow from it.

- **Map pins.** Each venue has a `mapsQuery` (the address, searched in Google Maps). To send guests to an exact pin instead, paste the Google Maps share link into that venue's `mapsLink`.
- **Calendar entries.** Events listed as "onwards" have no end time on the invitation, so `end` is an estimate that is only used for the length of the calendar entry.
- **Times** are written in India time and shown as India time wherever the guest is.

## How it is built

- `src/museum/rooms.ts` lists the galleries and turns the scroll position into each painting's pose: hanging on the wall, walking past, or stepped inside.
- `src/rooms/` has one component per painting, and `src/index.css` holds each era's typography and colour.
- `src/components/VisitorGuide.tsx` is the schedule and directions section.
- `src/art/*.svg` is the artwork, all hand-drawn SVG. Each painting is a 2400 x 600 frieze with a `back` and a `front` group; `scripts/build-art.mjs` splits and optimises them into `src/art/build/` so the two layers can drift apart as you move.
- Guests who ask their device for reduced motion get a gentle dissolve between paintings instead of the walk.

## Stack

Vite, React, TypeScript, Tailwind CSS and Motion, with Fontsource typefaces and Lucide icons. No backend and no secrets.
