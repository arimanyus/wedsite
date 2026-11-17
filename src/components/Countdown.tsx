import { weddingStart } from '@/data/wedding'
import { pad2, timeLeft, useNow } from '@/lib/hooks'

/**
 * Days, hours, minutes and seconds until the wedding ceremony, counted in real time. Each digit is
 * keyed by its value, so a digit that changes is mounted afresh and its entry animation plays.
 */
export function Countdown({ className = '' }: { className?: string }) {
  const left = timeLeft(weddingStart, useNow())

  if (left.over) {
    return (
      <p className={`countdown countdown-over ${className}`} role="status">
        <span className="countdown-over-text">Just married</span>
      </p>
    )
  }

  const units: [id: string, value: string, label: string][] = [
    ['days', String(left.days), left.days === 1 ? 'day' : 'days'],
    ['hours', pad2(left.hours), 'hours'],
    ['minutes', pad2(left.minutes), 'minutes'],
    ['seconds', pad2(left.seconds), 'seconds'],
  ]

  return (
    <div
      className={`countdown ${className}`}
      role="timer"
      aria-label={`${left.days} days, ${left.hours} hours and ${left.minutes} minutes until the wedding ceremony`}
    >
      {units.map(([id, value, label]) => (
        <div key={id} className={`countdown-unit countdown-${id}`} aria-hidden="true">
          <span className="countdown-value">
            {[...value].map((digit, place) => (
              <span key={`${value.length - place}-${digit}`} className="countdown-digit">
                {digit}
              </span>
            ))}
          </span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  )
}

/** The compact version that stays in the top bar. */
export function CountdownChip() {
  const left = timeLeft(weddingStart, useNow())
  if (left.over) return <span className="tabular-nums">Just married</span>
  return (
    <span className="tabular-nums" aria-hidden="true">
      {left.days}d {pad2(left.hours)}h {pad2(left.minutes)}m {pad2(left.seconds)}s
    </span>
  )
}
