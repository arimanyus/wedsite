import { Guide } from '@/components/Guide'
import { Hud } from '@/components/Hud'
import { Journey } from '@/components/Journey'
import { SceneNav } from '@/components/SceneNav'
import { JourneyProvider } from '@/journey/JourneyProvider'

export default function App() {
  return (
    <JourneyProvider>
      <Hud />
      <SceneNav />
      <main>
        <Journey />
        <Guide />
      </main>
    </JourneyProvider>
  )
}
