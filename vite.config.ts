import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // CDN Deployment Configuration:
  // Option 1: Root domain (e.g., https://cdn.example.com/)
  // base: './',
  
  // Option 2: Subdirectory (e.g., https://cdn.example.com/karma-ui/)
  // base: '/karma-ui/',
  
  // Option 3: Root with relative paths (recommended for flexible CDN deployment)
  base: './',
})
