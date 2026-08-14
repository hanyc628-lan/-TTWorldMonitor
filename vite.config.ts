import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          state: ['zustand'],
          data: ['hls.js', 'jmespath', 'clsx'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:3100', changeOrigin: true },
      '/mcp': { target: 'http://localhost:3100', changeOrigin: true },
      '/.well-known': { target: 'http://localhost:3100', changeOrigin: true },
    },
  },
});
