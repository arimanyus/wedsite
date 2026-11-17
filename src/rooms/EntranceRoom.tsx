import { ChevronDown } from 'lucide-react'

import { Countdown } from '@/components/Countdown'
import { Divider, GaneshaMark, PaperCorners } from '@/components/Ornaments'
import { Room } from '@/components/Room'
import { Scene } from '@/components/Scene'
import { couple } from '@/data/wedding'
import { useMuseum } from '@/museum/context'

/** Gallery I. The invitation itself, in the Pichwai style, with the countdown. */
export function EntranceRoom({ index }: { index: number }) {
  const { goTo } = useMuseum()

  return (
    <Room index={index} plaque={`${couple.bride} weds ${couple.groom}`}>
      <PaperCorners />
      <div className="room-content">
        <GaneshaMark />
        <h1 className="names">
          <span className="names-name">{couple.bride}</span>
          <span className="names-weds">weds</span>
          <span className="names-name">{couple.groom}</span>
        </h1>
        <Divider />
        <p className="entrance-dates">{couple.dateRange}</p>
        <p className="entrance-tagline">{couple.tagline}</p>
        <Countdown />
        <p className="entrance-regards">
          <span>With regards,</span>
          {couple.families}
        </p>
      </div>
      <Scene name="pichwai" />
      <button type="button" className="scroll-hint" onClick={() => goTo(index + 1)}>
        Step inside
        <ChevronDown aria-hidden="true" />
      </button>
    </Room>
  )
}
