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

## Status

Under construction. The app code and artwork are being added to this repository.

## Run it locally

Requires Node 22 or newer.

```bash
npm install
npm run dev
```

`npm run build` produces the static site in `dist/`, which can be hosted on any static host.

## Stack

Vite, React, TypeScript, Tailwind CSS and Motion. All artwork is hand-drawn SVG in `src/art/`. No backend and no secrets.
