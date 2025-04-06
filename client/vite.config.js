import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    mimeTypes: {
      'js': 'application/javascript'
    }
  },
  plugins: [react()],
})
