import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

import { CALENDAR_FILE, calendarFile } from './src/data/calendar.ts'

/** Publishes the week's calendar file (src/data/calendar.ts) next to the page. */
function calendar(): Plugin {
  return {
    name: 'wedding-calendar',
    configureServer(server) {
      server.middlewares.use(`/${CALENDAR_FILE}`, (_request, response) => {
        response.setHeader('Content-Type', 'text/calendar; charset=utf-8')
        response.end(calendarFile())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: CALENDAR_FILE, source: calendarFile() })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), calendar()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Artwork is always served as a file. Inlined into the script, a small drawing (a join that is
  // still empty, say) stays as it was when the dev server first read it.
  build: { assetsInlineLimit: 0 },
  server: { port: 4826, strictPort: true, host: true, allowedHosts: true },
  preview: { port: 4827, host: true, allowedHosts: true },
})
