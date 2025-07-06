import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, './env');

  const VITE_BASE_PATH = fileEnv.VITE_BASE_PATH ?? process.env.VITE_BASE_PATH;
  const VITE_PORT      = fileEnv.VITE_FRONTEND_CLIENT_PORT ?? process.env.VITE_FRONTEND_CLIENT_PORT;
  console.log('VITE_PORT ', VITE_PORT);
  return {
    plugins: [vue()],
    base: VITE_BASE_PATH || '/',
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
      port: Number(VITE_PORT) || 3000,
    },
    envDir: './env',
  };
});