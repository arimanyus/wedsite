import { ChevronDown } from 'lucide-react'

import { Countdown } from '@/components/Countdown'
import { Divider, GaneshaMark, PaperCorners } from '@/components/Ornaments'
import { Sky, TextBlock } from '@/components/SceneLayers'
import { couple } from '@/data/wedding'
import { useJourney } from '@/journey/context'

/**
 * The first screen: the invitation itself, in the Pichwai style, with the countdown.
 * Styles: src/styles/scenes/entrance.css. Frieze: `pichwai`.
 */
export function EntranceScene() {
  const { goTo } = useJourney()

  return (
    <>
      <Sky>
        <PaperCorners />
      </Sky>

      <TextBlock>
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
        <button type="button" className="scroll-hint" onClick={() => goTo(1)}>
          Begin
          <ChevronDown aria-hidden="true" />
        </button>
      </TextBlock>
    </>
  )
}
