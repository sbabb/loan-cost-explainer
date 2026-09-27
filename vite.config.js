import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Same setup as Cadence: relative asset URLs, so one build runs from a domain
// root, the GitHub Pages path /loan-cost-explainer/, or a folder opened
// locally. host: true lets a phone on the same Wi-Fi open the dev server.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 3001, host: true },
  preview: { port: 3001, host: true },
})
