import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: true,
    cors: true
  },
  publicDir: '../',
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  }
});

