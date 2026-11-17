import { art } from '@/art'

/** The flower sprigs in the four corners of the invitation's paper. */
export function PaperCorners() {
  const corner = art('orn-corner')
  if (!corner) return null
  return (
    <div className="paper-corners" aria-hidden="true">
      {(['tl', 'tr', 'br', 'bl'] as const).map((position) => (
        <img key={position} src={corner} alt="" className={`paper-corner paper-corner-${position}`} />
      ))}
    </div>
  )
}

export function Divider({ className = '' }: { className?: string }) {
  const divider = art('orn-divider')
  if (!divider) return <hr className={`divider-fallback ${className}`} />
  return <img src={divider} alt="" aria-hidden="true" className={`divider ${className}`} />
}

export function GaneshaMark({ className = '' }: { className?: string }) {
  const mark = art('orn-ganesha')
  if (!mark) return null
  return <img src={mark} alt="" aria-hidden="true" className={`ganesha-mark ${className}`} />
}

export function Lotus({ className = '' }: { className?: string }) {
  const lotus = art('orn-lotus')
  if (!lotus) return null
  return <img src={lotus} alt="" aria-hidden="true" className={className} />
}
