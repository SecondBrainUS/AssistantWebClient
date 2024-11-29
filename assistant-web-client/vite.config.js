import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src', // Short path alias
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Enable sourcemaps for debugging
  },
});
