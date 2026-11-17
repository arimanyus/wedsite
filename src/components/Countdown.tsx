import { weddingStart } from '@/data/wedding'
import { pad2, timeLeft, useNow } from '@/lib/hooks'

/** Days, hours, minutes and seconds until the wedding ceremony, counted in real time. */
export function Countdown({ className = '' }: { className?: string }) {
  const left = timeLeft(weddingStart, useNow())

  if (left.over) {
    return (
      <p className={`countdown countdown-over ${className}`} role="status">
        Just married
      </p>
    )
  }

  const units: [string, string][] = [
    [String(left.days), left.days === 1 ? 'day' : 'days'],
    [pad2(left.hours), 'hours'],
    [pad2(left.minutes), 'minutes'],
    [pad2(left.seconds), 'seconds'],
  ]

  return (
    <div
      className={`countdown ${className}`}
      role="timer"
      aria-label={`${left.days} days, ${left.hours} hours and ${left.minutes} minutes until the wedding ceremony`}
    >
      {units.map(([value, unit]) => (
        <div key={unit} className="countdown-unit" aria-hidden="true">
          <span className="countdown-value">{value}</span>
          <span className="countdown-label">{unit}</span>
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
