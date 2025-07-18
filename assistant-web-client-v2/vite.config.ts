import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, './env');

  const VITE_BASE_PATH = fileEnv.VITE_BASE_PATH ?? process.env.VITE_BASE_PATH;
  const VITE_PORT      = fileEnv.VITE_FRONTEND_CLIENT_PORT ?? process.env.VITE_FRONTEND_CLIENT_PORT;
  console.log('VITE_PORT ', VITE_PORT);
  return {
    plugins: [react(), tailwindcss()],
    base: VITE_BASE_PATH || '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: true, // Enable access from outside the container
      port: 3000,
      watch: {
        usePolling: Boolean(process.env.CHOKIDAR_USEPOLLING) || true, // Enable polling for file changes in Docker
        interval: Number(process.env.CHOKIDAR_INTERVAL) || 100,
      },
      hmr: {
        port: 3000, // Ensure HMR uses the same port
      },
    },
    envDir: './env',
  }
});