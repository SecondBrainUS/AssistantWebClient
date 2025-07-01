import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.');
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
    server: {
      host: true, // Enable access from outside the container
      port: 3000,
      watch: {
        usePolling: true, // Enable polling for file changes in Docker
      },
      hmr: {
        port: 3000, // Ensure HMR uses the same port
      },
    }
  }
});