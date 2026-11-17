import { CountdownChip } from '@/components/Countdown'
import { couple, formatShortDay, nextEvent, eventStatus } from '@/data/wedding'
import { useNow } from '@/lib/hooks'
import { useJourney } from '@/journey/context'
import { sceneIndex } from '@/journey/scenes'

/** Top bar: monogram (back to the top), countdown to the ceremony, and on wide screens the next event. */
export function Hud() {
  const { goTo } = useJourney()
  const now = useNow(30_000)
  const upNext = nextEvent(now)

  return (
    <header className="hud">
      <button type="button" className="hud-monogram" onClick={() => goTo(0)} aria-label="Back to the top">
        {couple.bride[0]}
        <span aria-hidden="true">&amp;</span>
        {couple.groom[0]}
      </button>

      <div className="hud-countdown" role="timer" aria-label="Time until the wedding ceremony">
        <CountdownChip />
      </div>

      {upNext && (
        <button type="button" className="hud-next" onClick={() => goTo(sceneIndex(upNext.scene))}>
          <span className="opacity-60">{eventStatus(upNext, now) === 'now' ? 'Now' : 'Next'}</span>
          <span>
            {upNext.title}, {formatShortDay(upNext)}
          </span>
        </button>
      )}
    </header>
  )
}
