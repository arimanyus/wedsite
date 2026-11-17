import { CalendarPlus, MapPin } from 'lucide-react'
import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import { calendarUrl, formatShortDay, mapsUrl, venues, type VenueId, type WeddingEvent } from '@/data/wedding'

type ButtonProps = Pick<ComponentProps<typeof Button>, 'variant' | 'size' | 'className'>

/** A shorter label on phones, where two buttons have to share one row. */
function ResponsiveLabel({ short, long }: { short: string; long: string }) {
  return (
    <>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{long}</span>
    </>
  )
}

/** Opens Google Maps with directions to the venue. On phones this hands over to the Maps app. */
export function MapButton({ venue, label, ...button }: { venue: VenueId; label?: string } & ButtonProps) {
  const place = venues[venue]
  return (
    <Button asChild {...button}>
      <a
        href={mapsUrl(venue)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${place.name === place.city ? place.address : `${place.name}, ${place.city}`} in Google Maps`}
      >
        <MapPin aria-hidden="true" />
        {label ?? <ResponsiveLabel short="Maps" long="Google Maps" />}
      </a>
    </Button>
  )
}

/** Opens Google Calendar with the event already filled in. */
export function CalendarButton({
  event,
  label,
  iconOnly = false,
  ...button
}: { event: WeddingEvent; label?: string; iconOnly?: boolean } & ButtonProps) {
  return (
    <Button asChild {...button}>
      <a
        href={calendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Add ${event.title}, ${formatShortDay(event)}, to Google Calendar`}
        title={iconOnly ? `Add ${event.title} to Google Calendar` : undefined}
      >
        <CalendarPlus aria-hidden="true" />
        {!iconOnly && (label ?? <ResponsiveLabel short="Calendar" long="Add to Calendar" />)}
      </a>
    </Button>
  )
}
