import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/outfit/latin-400.css'
import '@fontsource/outfit/latin-500.css'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/latin-700.css'
import '@fontsource/cormorant-garamond/latin-400-italic.css'
import '@fontsource/cormorant-garamond/latin-500-italic.css'
import '@fontsource/cormorant-garamond/latin-600-italic.css'
import '@fontsource/cinzel-decorative/latin-700.css'
import '@fontsource/cinzel-decorative/latin-900.css'
import '@fontsource/kalam/latin-400.css'
import '@fontsource/kalam/latin-700.css'
import '@fontsource/federo/latin-400.css'
import '@fontsource/bungee-shade/latin-400.css'
import '@fontsource/bungee/latin-400.css'
import '@fontsource/yatra-one/latin-400.css'
import '@fontsource/bangers/latin-400.css'
import '@fontsource/tilt-neon/latin-400.css'
import './index.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
