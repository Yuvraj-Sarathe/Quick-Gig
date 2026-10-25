import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy: /api → Flask on 5001 (backend/app.py), so the frontend stays
// same-origin and uploaded images (served under /api/uploads) also resolve.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
})
