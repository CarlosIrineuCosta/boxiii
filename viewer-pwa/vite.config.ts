import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',  // Change from 0.0.0.0 to localhost for WSL2
    port: 5173,
    strictPort: false,
    watch: {
      usePolling: true,
      interval: 1000,  // Poll every second for changes
    },
    hmr: {
      port: 24678,
      host: 'localhost',  // Ensure HMR uses localhost too
    },
    cors: true,
  },
  clearScreen: false,
})
