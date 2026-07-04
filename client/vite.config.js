import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all /api/v1/* requests to Express backend on port 5000
      '/api': {
        target: 'https://templetrust.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
