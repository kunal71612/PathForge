import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const currentEnv = loadEnv(mode, process.cwd(), '');
  const parentEnv = loadEnv(mode, path.resolve(process.cwd(), '..'), '');
  const rawApiUrl = currentEnv.VITE_API_URL || parentEnv.VITE_API_URL || 'http://127.0.0.1:3000';
  const proxyTarget = rawApiUrl.replace(/\/api\/?$/, '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
