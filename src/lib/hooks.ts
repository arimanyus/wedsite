import { useEffect, useState, useSyncExternalStore } from 'react'

/** The current time, refreshed every `intervalMs`. */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export interface TimeLeft {
  over: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function timeLeft(target: Date, now: Date): TimeLeft {
  const total = Math.floor((target.getTime() - now.getTime()) / 1000)
  if (total <= 0) return { over: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    over: false,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export const pad2 = (value: number) => String(value).padStart(2, '0')
