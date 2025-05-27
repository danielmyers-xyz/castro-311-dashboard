import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/castro-311-dashboard/',
  build: {
    outDir: 'docs',
    emptyOutDir: true
  },
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '/geoserver': {
        target: 'https://geoserver.danielmyers.xyz',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/geoserver/, '/geoserver')
      }
    }
  }
});
