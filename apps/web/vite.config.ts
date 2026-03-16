import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(() => {
  const env = loadEnv('', process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5000,
      proxy: {
        '/api': {
          target: env.VITE_API_HOST,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@food-up/shared': path.resolve(__dirname, '../../shared/src/index.ts'),
      },
    },
  };
});
