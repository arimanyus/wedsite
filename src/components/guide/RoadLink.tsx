import { Route } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { routeUrl, venues, type VenueId } from '@/data/wedding'

/** The road between two cities, as on the Baraat scene's route line, with the whole drive in Google Maps. */
export function RoadLink({ from, to }: { from: VenueId; to: VenueId }) {
  return (
    <div className="road-link">
      <p className="road-link-line" aria-hidden="true">
        <span>{venues[from].city}</span>
        <span className="road-link-track">
          <span className="road-link-marker" />
        </span>
        <span>{venues[to].city}</span>
      </p>
      <Button asChild className="road-link-button">
        <a
          href={routeUrl(from, to)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`See the road from ${venues[from].city} to ${venues[to].city} in Google Maps`}
        >
          <Route aria-hidden="true" />
          See the road
        </a>
      </Button>
    </div>
  )
}
