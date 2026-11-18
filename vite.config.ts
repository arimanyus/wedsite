import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Artwork is always served as a file. Inlined into the script, a small drawing (a join that is
  // still empty, say) stays as it was when the dev server first read it.
  build: { assetsInlineLimit: 0 },
  server: { port: 4826, strictPort: true, host: true, allowedHosts: true },
  preview: { port: 4827, host: true, allowedHosts: true },
})
