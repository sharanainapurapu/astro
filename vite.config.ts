import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The GitHub Pages base path. For a project page the site is served from
// https://<user>.github.io/<repo>/ so Vite needs the repo name as base.
// Override at build time with VITE_BASE if the repo name differs.
const base = process.env.VITE_BASE ?? '/palmistry/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
