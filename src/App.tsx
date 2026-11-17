import { Hud } from '@/components/Hud'
import { Museum } from '@/components/Museum'
import { MuseumNav } from '@/components/MuseumNav'
import { VisitorGuide } from '@/components/VisitorGuide'
import { MuseumProvider } from '@/museum/MuseumProvider'

export default function App() {
  return (
    <MuseumProvider>
      <Hud />
      <MuseumNav />
      <main>
        <Museum />
        <VisitorGuide />
      </main>
    </MuseumProvider>
  )
}
