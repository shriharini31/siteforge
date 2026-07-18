import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const developmentApiUrl = process.env.VITE_DEV_API_URL || 'http://localhost:4000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: developmentApiUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
