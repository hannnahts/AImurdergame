import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages 把站点放在 /<仓库名>/ 下;本地开发仍用根路径
  base: command === 'build' ? '/AImurdergame/' : '/',
  plugins: [react()],
}))
