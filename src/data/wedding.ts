// Everything guests need to know lives here. Change a time, a venue or a link in this file and
// every scene, the schedule, the countdown and the calendar links follow.

export const couple = {
  bride: 'Mansi',
  groom: 'Vivek',
  families: 'The Sharma & Tiwari Families',
  dateRange: '28 November — 3 December 2026',
  tagline: 'Rituals, music, blessings & a little festivity',
}

const IST = '+05:30'

/** Local India time, written as `YYYY-MM-DDTHH:mm`. */
type IstDateTime = `${number}-${number}-${number}T${number}:${number}`

export type VenueId = 'indore' | 'nanded'

export interface Venue {
  id: VenueId
  city: string
  state: string
  name: string
  address: string
  /** What Google Maps is asked to find. Replace with an exact place link if you have one. */
  mapsQuery: string
  /** Optional exact Google Maps link (for example the one behind the QR code on the invitation). */
  mapsLink?: string
}

export const venues: Record<VenueId, Venue> = {
  indore: {
    id: 'indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    name: 'Indore',
    address: '152-B, Maa Sharda Nagar, Sukhliya, Indore, Madhya Pradesh',
    mapsQuery: '152-B, Maa Sharda Nagar, Sukhliya, Indore, Madhya Pradesh',
  },
  nanded: {
    id: 'nanded',
    city: 'Nanded',
    state: 'Maharashtra',
    name: 'Pranada Valley',
    address: 'Pranada Valley, Nanded, Maharashtra',
    mapsQuery: 'Pranada Valley, Nanded, Maharashtra',
  },
}

export type SceneId =
  | 'entrance'
  | 'tilak'
  | 'ganesh'
  | 'matrika'
  | 'baraat'
  | 'pool'
  | 'sangeet'
  | 'wedding'

export interface WeddingEvent {
  id: string
  title: string
  /** The scene of the journey this event appears in. */
  scene: Exclude<SceneId, 'entrance'>
  start: IstDateTime
  /**
   * The invitation gives an end time only for the Tilak. For everything else this is a sensible
   * guess used only as the end of the Google Calendar entry.
   */
  end: IstDateTime
  /** Shown to guests exactly as printed on the invitation. */
  timeLabel: string
  venue: VenueId
  /** How the place is printed on the invitation. */
  placeLabel: string
  note?: { label: string; text: string }
}

export const events: WeddingEvent[] = [
  {
    id: 'tilak',
    title: 'Tilak Ceremony',
    scene: 'tilak',
    start: '2026-11-28T13:00',
    end: '2026-11-28T15:00',
    timeLabel: '1:00 – 3:00 PM',
    venue: 'indore',
    placeLabel: '152-B, Maa Sharda Nagar, Sukhliya, Indore',
  },
  {
    id: 'food-blessings',
    title: 'Food & Blessings',
    scene: 'tilak',
    start: '2026-11-28T19:00',
    end: '2026-11-28T22:00',
    timeLabel: '7:00 PM onwards',
    venue: 'indore',
    placeLabel: '152-B, Maa Sharda Nagar, Sukhliya, Indore',
  },
  {
    id: 'ganesh-pujan',
    title: 'Ganesh Pujan',
    scene: 'ganesh',
    start: '2026-11-29T10:00',
    end: '2026-11-29T13:00',
    timeLabel: '10:00 AM onwards',
    venue: 'indore',
    placeLabel: 'Indore',
  },
  {
    id: 'matrika-pujan',
    title: 'Matrika Pujan',
    scene: 'matrika',
    start: '2026-11-30T10:00',
    end: '2026-11-30T13:00',
    timeLabel: '10:00 AM onwards',
    venue: 'indore',
    placeLabel: 'Indore',
  },
  {
    id: 'baraat',
    title: 'Baraat Prasthan',
    scene: 'baraat',
    start: '2026-12-01T17:00',
    end: '2026-12-01T18:00',
    timeLabel: '5:00 PM',
    venue: 'indore',
    placeLabel: 'Indore',
    note: { label: 'Route', text: 'By bus, Indore to Nanded' },
  },
  {
    id: 'pool-party',
    title: 'Pool Party Carnival',
    scene: 'pool',
    start: '2026-12-02T09:00',
    end: '2026-12-02T13:00',
    timeLabel: '9:00 AM onwards',
    venue: 'nanded',
    placeLabel: 'Pranada Valley, Nanded',
    note: { label: 'Theme', text: 'Sky Blue' },
  },
  {
    id: 'sangeet',
    title: 'Sangeet',
    scene: 'sangeet',
    start: '2026-12-02T19:00',
    end: '2026-12-02T23:00',
    timeLabel: '7:00 PM onwards',
    venue: 'nanded',
    placeLabel: 'Pranada Valley, Nanded',
    note: { label: 'Attire', text: 'Indo-Western, as you wish' },
  },
  {
    id: 'wedding',
    title: 'Wedding Ceremony',
    scene: 'wedding',
    start: '2026-12-03T11:00',
    end: '2026-12-03T15:00',
    timeLabel: '11:00 AM onwards',
    venue: 'nanded',
    placeLabel: 'Pranada Valley, Nanded',
  },
]

export const weddingEvent = events[events.length - 1]

export function toDate(value: IstDateTime): Date {
  return new Date(`${value}:00${IST}`)
}

export const weddingStart = toDate(weddingEvent.start)

export function eventsInScene(scene: SceneId): WeddingEvent[] {
  return events.filter((event) => event.scene === scene)
}

const dayFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const shortDayFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

/** "Saturday, 28 November" */
export function formatDay(event: WeddingEvent): string {
  return dayFormat.format(toDate(event.start))
}

/** "Sat, 28 Nov" */
export function formatShortDay(event: WeddingEvent): string {
  return shortDayFormat.format(toDate(event.start))
}

export function dayParts(event: WeddingEvent): { day: string; month: string; weekday: string } {
  const parts = dayFormat.formatToParts(toDate(event.start))
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return { day: pick('day').padStart(2, '0'), month: pick('month').slice(0, 3), weekday: pick('weekday') }
}

/** Opens Google Maps with directions to the venue from wherever the guest is. */
export function mapsUrl(venueId: VenueId): string {
  const venue = venues[venueId]
  if (venue.mapsLink) return venue.mapsLink
  const params = new URLSearchParams({ api: '1', destination: venue.mapsQuery })
  return `https://www.google.com/maps/dir/?${params}`
}

/** The baraat's road route, Indore to Nanded. */
export function routeUrl(from: VenueId, to: VenueId): string {
  const params = new URLSearchParams({
    api: '1',
    origin: venues[from].mapsQuery,
    destination: venues[to].mapsQuery,
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${params}`
}

/** A prefilled "new event" page in Google Calendar, pinned to India time. */
export function calendarUrl(event: WeddingEvent): string {
  const compact = (value: IstDateTime) => `${value.replaceAll('-', '').replaceAll(':', '')}00`
  const venue = venues[event.venue]
  const details = [
    `${couple.bride} weds ${couple.groom}`,
    `${formatDay(event)} 2026, ${event.timeLabel} (India time)`,
    event.note ? `${event.note.label}: ${event.note.text}` : null,
    `Directions: ${mapsUrl(event.venue)}`,
  ]
    .filter(Boolean)
    .join('\n')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} · ${couple.bride} weds ${couple.groom}`,
    dates: `${compact(event.start)}/${compact(event.end)}`,
    ctz: 'Asia/Kolkata',
    location: venue.address,
    details,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export type EventStatus = 'upcoming' | 'now' | 'done'

export function eventStatus(event: WeddingEvent, now: Date): EventStatus {
  if (now < toDate(event.start)) return 'upcoming'
  if (now < toDate(event.end)) return 'now'
  return 'done'
}

/** The event happening now, or else the next one to start. Undefined once everything is over. */
export function nextEvent(now: Date): WeddingEvent | undefined {
  return events.find((event) => eventStatus(event, now) !== 'done')
}
