import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 1. Import the plugin

export default defineConfig({
  plugins: [react()], // 2. Add it here
  preview: {
    allowedHosts: ["peaceful-heart-production-02ca.up.railway.app"]
  },
  server: {
    allowedHosts: ["peaceful-heart-production-02ca.up.railway.app"]
  }
})