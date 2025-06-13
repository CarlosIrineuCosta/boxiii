import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// IMPORTANT: Using Tailwind CSS v4 with dedicated Vite plugin for Rust-based compilation
// This replaces the traditional PostCSS plugin approach from v3
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://builder-backend:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
