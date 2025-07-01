import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, './env');
  return {
    plugins: [vue()],
    base: env.VITE_BASE_PATH || '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    server: {
      host: true,
      port: 3000,
    },
    envDir: './env',
  };
});