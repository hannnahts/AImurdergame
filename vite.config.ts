import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site under /<repo-name>/
  base: '/AImurdergame/',
  plugins: [react()],
})
