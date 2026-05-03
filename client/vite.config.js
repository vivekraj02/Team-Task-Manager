import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // ... your other config
  preview: {
    allowedHosts: ["peaceful-heart-production-02ca.up.railway.app"]
  },
  server: {
    allowedHosts: ["peaceful-heart-production-02ca.up.railway.app"]
  }
})
