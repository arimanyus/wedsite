import { Component, type ReactNode } from 'react'

import { couple, events, formatDay, mapsUrl } from '@/data/wedding'
import { openCurtain } from '@/lib/curtain'

/**
 * If anything in the page fails to draw, the guest still gets the invitation: who, when and where,
 * as plain text with map links, instead of an empty screen.
 */
export class Fallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    openCurtain()
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="plain-invitation">
        <h1>
          {couple.bride} weds {couple.groom}
        </h1>
        <p className="plain-dates">{couple.dateRange}</p>
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.title}</strong>
              <span>
                {formatDay(event)} 2026, {event.timeLabel}
              </span>
              <a href={mapsUrl(event.venue)} target="_blank" rel="noreferrer">
                {event.placeLabel} (map)
              </a>
            </li>
          ))}
        </ul>
        <p>{couple.families}</p>
      </main>
    )
  }
}
