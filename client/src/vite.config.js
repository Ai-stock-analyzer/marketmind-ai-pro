import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Pre-bundle framer-motion so Vite doesn't choke on its ESM exports
    include: ['framer-motion'],
  },
  resolve: {
    alias: {
      // Ensures a single copy of framer-motion is resolved
      'framer-motion': 'framer-motion',
    },
  },
})
