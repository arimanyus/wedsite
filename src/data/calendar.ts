// The whole week as one calendar file (iCalendar, RFC 5545). vite.config.ts publishes it at
// /<CALENDAR_FILE>, so it can be downloaded into any calendar app or subscribed to, in which case
// a change made in wedding.ts reaches guests' calendars by itself.

import { couple, events, formatDay, mapsUrl, toDate, venues } from './wedding.ts'

export const CALENDAR_FILE = 'mansi-weds-vivek.ics'

const NAME = `${couple.bride} weds ${couple.groom}`

/** 20261128T073000Z */
const utc = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

const escape = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** Lines may be at most 75 bytes; longer ones continue on the next line after a space. */
function fold(line: string): string {
  const bytes = new TextEncoder()
  const parts: string[] = []
  let current = ''
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74
    if (bytes.encode(current + char).length > limit) {
      parts.push(current)
      current = char
    } else current += char
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export function calendarFile(stamp = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${NAME}//Wedding week//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape(NAME)}`,
    `X-WR-CALDESC:${escape(`${couple.dateRange}, Indore and Nanded`)}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
  ]
  for (const event of events) {
    const venue = venues[event.venue]
    const description = [
      NAME,
      `${formatDay(event)} 2026, ${event.timeLabel} (India time)`,
      event.note ? `${event.note.label}: ${event.note.text}` : null,
      `Directions: ${mapsUrl(event.venue)}`,
    ]
      .filter(Boolean)
      .join('\n')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@mansiwedsvivek.xyz`,
      `DTSTAMP:${utc(stamp)}`,
      `DTSTART:${utc(toDate(event.start))}`,
      `DTEND:${utc(toDate(event.end))}`,
      `SUMMARY:${escape(`${event.title} · ${NAME}`)}`,
      `LOCATION:${escape(venue.address)}`,
      `DESCRIPTION:${escape(description)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escape(event.title)}`,
      'TRIGGER:-PT2H',
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
