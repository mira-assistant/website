import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const rootDir = path.resolve(__dirname, '..');
  const env = loadEnv(mode, rootDir, '');

  const apiUrl = env.API_URL || 'http://localhost:8000';
  const beta = env.BETA || '';

  return {
    root: __dirname,
    envDir: rootDir,
    base: '/',
    plugins: [react()],
    define: {
      'process.env.API_URL': JSON.stringify(apiUrl),
      'process.env.BETA': JSON.stringify(beta),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
