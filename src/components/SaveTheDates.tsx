import { CalendarHeart, CalendarPlus, Check, Copy, Download } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CALENDAR_FILE } from '@/data/calendar'
import { calendarUrl, couple, events, formatShortDay, venues } from '@/data/wedding'

/** Where the week's calendar file is published (see vite.config.ts), on whatever host serves the page. */
function feedUrl() {
  return new URL(`${import.meta.env.BASE_URL}${CALENDAR_FILE}`, window.location.href)
}

/** Google adds a calendar by its address; it fetches the file itself, so the page has to be public. */
function googleSubscribeUrl() {
  const feed = feedUrl().href.replace(/^https?:/, 'webcal:')
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feed)}`
}

const COUNT_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const count = COUNT_WORDS[events.length] ?? String(events.length)

function Option({
  href,
  onClick,
  icon,
  title,
  detail,
  tone,
  external = false,
}: {
  href?: string
  onClick?: () => void
  icon: ReactNode
  title: string
  detail: string
  tone: 'rani' | 'leaf' | 'paper'
  external?: boolean
}) {
  const body = (
    <>
      <span className="save-option-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="save-option-text">
        <span className="save-option-title">{title}</span>
        <span className="save-option-detail">{detail}</span>
      </span>
    </>
  )
  const className = `save-option save-option-${tone}`
  if (href)
    return (
      <a className={className} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {body}
      </a>
    )
  return (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  )
}

/**
 * "Add all to calendar": every celebration of the week into the guest's calendar in one go, as a
 * file for Apple Calendar and Outlook or a subscription in Google Calendar, or one at a time.
 */
export function SaveTheDates({ trigger }: { trigger: ReactNode }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl().href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      window.prompt('Copy this calendar link:', feedUrl().href)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="save-dates">
        <DialogHeader>
          <p className="save-kicker">Save the dates</p>
          <DialogTitle className="save-title">
            All {count} celebrations, <em>in your calendar</em>
          </DialogTitle>
          <ol className="save-strip" aria-hidden="true">
            {events.map((event) => (
              <li key={event.id} style={{ background: `var(--ev-${event.id})` }} />
            ))}
          </ol>
          <DialogDescription className="save-description">
            {couple.dateRange} in {venues.indore.city} and {venues.nanded.city}. Times are India time; your
            calendar shows them in yours, with a reminder two hours before each.
          </DialogDescription>
        </DialogHeader>

        <div className="save-options">
          <Option
            href={`${import.meta.env.BASE_URL}${CALENDAR_FILE}`}
            icon={<Download />}
            title="iPhone, Mac & Outlook"
            detail={`Adds all ${count} at once`}
            tone="rani"
          />
          <Option
            href={googleSubscribeUrl()}
            external
            icon={<CalendarHeart />}
            title="Google Calendar"
            detail="Subscribe, and any change reaches you"
            tone="leaf"
          />
          <Option
            onClick={copy}
            icon={copied ? <Check /> : <Copy />}
            title={copied ? 'Link copied' : 'Any other calendar'}
            detail={copied ? 'Paste it where your calendar asks for a URL' : 'Copy the calendar link'}
            tone="paper"
          />
        </div>

        <section className="save-each" aria-labelledby="save-each-title">
          <h3 id="save-each-title" className="save-each-title">
            Or one at a time, in Google Calendar
          </h3>
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <a href={calendarUrl(event)} target="_blank" rel="noopener noreferrer" className="save-event">
                  <span className="save-event-dot" style={{ background: `var(--ev-${event.id})` }} aria-hidden="true" />
                  <span className="save-event-day">{formatShortDay(event)}</span>
                  <span className="save-event-title">{event.title}</span>
                  <span className="save-event-time">{event.timeLabel}</span>
                  <CalendarPlus className="save-event-add" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  )
}

/** The big "add everything" button under the plan's title. */
export function SaveTheDatesButton() {
  return (
    <SaveTheDates
      trigger={
        <Button className="save-dates-button">
          <CalendarPlus aria-hidden="true" />
          Add all {count} to my calendar
        </Button>
      }
    />
  )
}
